import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _isCsrfRetry?: boolean;
    _isAuthRetry?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    _isCsrfRetry?: boolean;
    _isAuthRetry?: boolean;
  }
}

export interface CsrfResponse {
  csrf_token: string;
  expires_in?: number;
}

let cachedCsrfToken: string | null = null;
let csrfTokenExpiresAt = 0;
let pendingCsrfPromise: Promise<string> | null = null;

/**
 * Retrieves the CSRF token from the backend, caching it in memory.
 * GET /api/auth/v1/csrf sets the signed CSRF cookie and returns the token in JSON.
 */
export const getCsrfToken = async (forceRefresh = false): Promise<string> => {
  const now = Date.now();
  if (!forceRefresh && cachedCsrfToken && now < csrfTokenExpiresAt - 10000) {
    return cachedCsrfToken;
  }

  if (!forceRefresh && pendingCsrfPromise) {
    return pendingCsrfPromise;
  }

  pendingCsrfPromise = (async () => {
    try {
      const response = await axios.get<CsrfResponse>('/api/auth/v1/csrf', {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-store',
        },
      });

      const token = response.data.csrf_token;
      cachedCsrfToken = token;
      const expiresInSec = response.data.expires_in ?? 600;
      csrfTokenExpiresAt = Date.now() + expiresInSec * 1000;
      return token;
    } finally {
      pendingCsrfPromise = null;
    }
  })();

  return pendingCsrfPromise;
};

/**
 * Clears the in-memory cached CSRF token.
 */
export const clearCsrfToken = (): void => {
  cachedCsrfToken = null;
  csrfTokenExpiresAt = 0;
  pendingCsrfPromise = null;
};

/**
 * Public HTTP client for unauthenticated requests.
 */
export const publicClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Authenticated HTTP client for authorized requests.
 * Automatically sends HttpOnly cookies (`withCredentials: true`).
 */
export const authedClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

// Request interceptor: automatically attach X-CSRF-Token to mutating requests
authedClient.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  if (method && MUTATING_METHODS.includes(method)) {
    try {
      const existingHeader =
        typeof config.headers?.get === 'function'
          ? config.headers.get('X-CSRF-Token')
          : config.headers?.['X-CSRF-Token'];

      if (!existingHeader) {
        const token = await getCsrfToken();
        if (token) {
          if (typeof config.headers?.set === 'function') {
            config.headers.set('X-CSRF-Token', token);
          } else {
            config.headers = config.headers ?? {};
            config.headers['X-CSRF-Token'] = token;
          }
        }
      }
    } catch {
      // Proceed; backend will reject if CSRF token is required and missing
    }
  }
  return config;
});

const REFRESH_PATH = '/auth/v1/refresh';

let pendingRefreshPromise: Promise<boolean> | null = null;

/**
 * Rotates the session via the adapter's refresh cookie, deduping concurrent
 * callers so one in-flight request serves every 401 raised at the same time.
 * Returns false (and clears the cached CSRF token) on any failure: an
 * expired refresh cookie, a revoked session, or a dependency error all mean
 * the caller must fall back to its normal unauthorized handling.
 */
const refreshSession = async (): Promise<boolean> => {
  if (pendingRefreshPromise) {
    return pendingRefreshPromise;
  }

  pendingRefreshPromise = (async () => {
    try {
      const csrfToken = await getCsrfToken();
      await axios.post(REFRESH_PATH, null, {
        baseURL: '/api',
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-store',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
      });
      return true;
    } catch {
      clearCsrfToken();
      return false;
    } finally {
      pendingRefreshPromise = null;
    }
  })();

  return pendingRefreshPromise;
};

const isCsrfError = (error: AxiosError): boolean => {
  if (error.response?.status !== 403) {
    return false;
  }
  const data = error.response.data;
  if (typeof data === 'string') {
    return data.includes('csrf_failed');
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (
      record.error === 'csrf_failed' ||
      record.code === 'csrf_failed' ||
      record.message === 'csrf_failed' ||
      record.detail === 'csrf_failed'
    ) {
      return true;
    }
    if (record.error && typeof record.error === 'object') {
      const nested = record.error as Record<string, unknown>;
      if (nested.code === 'csrf_failed' || nested.message === 'csrf_failed') {
        return true;
      }
    }
  }
  return false;
};

// Response interceptor: handles 401 session clearing and bounded CSRF 403 retry.
authedClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const config = error.config as InternalAxiosRequestConfig | undefined;

      if (error.response?.status === 401) {
        clearCsrfToken();

        const isRefreshCall = config?.url?.includes(REFRESH_PATH) ?? false;
        if (config && !config._isAuthRetry && !isRefreshCall) {
          config._isAuthRetry = true;
          const refreshed = await refreshSession();
          if (refreshed) {
            try {
              return await authedClient.request(config);
            } catch (retryError) {
              return Promise.reject(retryError);
            }
          }
        }
      }

      const method = config?.method?.toUpperCase();
      if (
        config &&
        !config._isCsrfRetry &&
        method &&
        MUTATING_METHODS.includes(method) &&
        isCsrfError(error)
      ) {
        config._isCsrfRetry = true;
        clearCsrfToken();
        try {
          const newToken = await getCsrfToken(true);
          if (newToken) {
            if (typeof config.headers?.set === 'function') {
              config.headers.set('X-CSRF-Token', newToken);
            } else if (config.headers) {
              config.headers['X-CSRF-Token'] = newToken;
            }
          }
          return await authedClient.request(config);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }
    }
    return Promise.reject(error);
  },
);

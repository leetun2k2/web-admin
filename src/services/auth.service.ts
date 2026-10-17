import { authedClient, clearCsrfToken, getCsrfToken } from '@/lib/http';

export interface UserProfile {
  user_id: string;
  identity_id?: string;
  email: string | null;
  display_name?: string;
  avatar_url?: string;
}

export interface UpdateProfilePayload {
  display_name?: string;
  avatar_url?: string;
}

export interface LoginResponse {
  redirect_url: string;
}

const AUTH_PREFIX = '/auth/v1';

export const authService = {
  /**
   * Retrieves or refreshes the CSRF token via GET /api/auth/v1/csrf.
   */
  async getCsrfToken(forceRefresh = false): Promise<string> {
    return getCsrfToken(forceRefresh);
  },

  /**
   * Starts Google OAuth login by posting to the adapter's /login/google endpoint with CSRF token.
   * Redirects browser to Google's authorize URL returned in redirect_url.
   */
  async loginWithGoogle(): Promise<void> {
    const response = await authedClient.post<LoginResponse>(
      `${AUTH_PREFIX}/login/google`,
      {},
    );

    if (response.data.redirect_url) {
      window.location.assign(response.data.redirect_url);
    }
  },

  /**
   * Retrieves the current authenticated user profile (/api/auth/v1/me).
   * Uses HttpOnly session cookie via authedClient.
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await authedClient.get<UserProfile>(`${AUTH_PREFIX}/me`);
    return response.data;
  },

  /**
   * Updates user profile fields (/api/auth/v1/profile) with CSRF protection.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await authedClient.patch<UserProfile>(
      `${AUTH_PREFIX}/profile`,
      payload,
    );
    return response.data;
  },

  /**
   * Revokes current session and logs out (/api/auth/v1/logout) with CSRF protection.
   */
  async logout(): Promise<void> {
    try {
      await authedClient.post(`${AUTH_PREFIX}/logout`, {});
    } finally {
      clearCsrfToken();
    }
  },
};

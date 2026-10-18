import axios from 'axios';
import { authedClient } from '@/lib/http';

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface ResponseEnvelope<T> {
  data: T;
  pagination?: Pagination;
  request_id?: string;
}

export interface UserAccess {
  user_id: string;
  email?: string | null;
  display_name: string;
  avatar_url: string;
  roles: string[];
  is_admin: boolean;
}

export interface UserSummary {
  id: string;
  email?: string | null;
  display_name: string;
  avatar_url: string;
  roles: string[];
}

export interface IdentitySummary {
  id: string;
  user_id: string;
  user_email?: string | null;
  provider: string;
  provider_subject: string;
  email?: string | null;
  email_verified: boolean;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

export interface UserDetail extends UserSummary {
  identities: IdentitySummary[];
}

export interface RoleItem {
  id: string;
  key: string;
  name: string;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface SessionItem {
  id: string;
  user_id: string;
  user_email?: string | null;
  user_name: string;
  client_id: string;
  client_name: string;
  provider: string;
  expires_at: string;
  revoked_at?: string | null;
  created_at: string;
}

export interface ClientRegistrationItem {
  id: string;
  provider: string;
  client_id: string;
  name: string;
  redirect_url: string;
  redirect_uris: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertClientPayload {
  name: string;
  client_secret: string;
  auth_secret: string;
  redirect_url: string;
  redirect_uris: string[];
  enabled?: boolean;
}

const ADMIN_PREFIX = '/admin/v1';

export const iamService = {
  async getUserAccess(): Promise<UserAccess> {
    const res = await authedClient.get<ResponseEnvelope<UserAccess>>(
      `${ADMIN_PREFIX}/access`,
    );
    return res.data.data;
  },

  async getUsers(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    role?: string;
  }) {
    const res = await authedClient.get<ResponseEnvelope<UserSummary[]>>(
      `${ADMIN_PREFIX}/users`,
      { params },
    );
    return res.data;
  },

  async getUser(id: string) {
    const res = await authedClient.get<ResponseEnvelope<UserDetail>>(
      `${ADMIN_PREFIX}/users/${id}`,
    );
    return res.data.data;
  },

  async updateUserRoles(id: string, roleIds: string[]) {
    const res = await authedClient.put<ResponseEnvelope<UserDetail>>(
      `${ADMIN_PREFIX}/users/${id}/roles`,
      { role_ids: roleIds },
    );
    return res.data.data;
  },

  async getIdentities(params?: {
    page?: number;
    page_size?: number;
    provider?: string;
  }) {
    const res = await authedClient.get<ResponseEnvelope<IdentitySummary[]>>(
      `${ADMIN_PREFIX}/identities`,
      { params },
    );
    return res.data;
  },

  async getRoles(params?: { page?: number; page_size?: number }) {
    const res = await authedClient.get<ResponseEnvelope<RoleItem[]>>(
      `${ADMIN_PREFIX}/roles`,
      { params },
    );
    return res.data;
  },

  async getRole(id: string) {
    const res = await authedClient.get<ResponseEnvelope<RoleItem>>(
      `${ADMIN_PREFIX}/roles/${id}`,
    );
    return res.data.data;
  },

  async createRole(data: { key: string; name: string }) {
    const res = await authedClient.post<ResponseEnvelope<RoleItem>>(
      `${ADMIN_PREFIX}/roles`,
      data,
    );
    return res.data.data;
  },

  async updateRole(id: string, data: { name: string }) {
    const res = await authedClient.patch<ResponseEnvelope<RoleItem>>(
      `${ADMIN_PREFIX}/roles/${id}`,
      data,
    );
    return res.data.data;
  },

  async deleteRole(id: string) {
    const res = await authedClient.delete<
      ResponseEnvelope<{ success: boolean }>
    >(`${ADMIN_PREFIX}/roles/${id}`);
    return res.data.data;
  },

  async getSessions(params?: {
    page?: number;
    page_size?: number;
    user_id?: string;
    active?: boolean;
  }) {
    const res = await authedClient.get<ResponseEnvelope<SessionItem[]>>(
      `${ADMIN_PREFIX}/sessions`,
      { params },
    );
    return res.data;
  },

  async revokeSession(id: string) {
    const res = await authedClient.delete<
      ResponseEnvelope<{ success: boolean }>
    >(`${ADMIN_PREFIX}/sessions/${id}`);
    return res.data.data;
  },

  async getClients(params?: { page?: number; page_size?: number }) {
    const res = await authedClient.get<
      ResponseEnvelope<ClientRegistrationItem[]>
    >(`${ADMIN_PREFIX}/clients`, { params });
    return res.data;
  },

  async getClient(id: string) {
    const res = await authedClient.get<
      ResponseEnvelope<ClientRegistrationItem>
    >(`${ADMIN_PREFIX}/clients/${id}`);
    return res.data.data;
  },

  async updateClientEnabled(id: string, enabled: boolean) {
    const res = await authedClient.patch<
      ResponseEnvelope<ClientRegistrationItem>
    >(`${ADMIN_PREFIX}/clients/${id}`, { enabled });
    return res.data.data;
  },

  async upsertClient(
    provider: string,
    clientId: string,
    payload: UpsertClientPayload,
  ): Promise<void> {
    await authedClient.put<void>(
      `${ADMIN_PREFIX}/clients/${encodeURIComponent(provider)}/${encodeURIComponent(clientId)}`,
      payload,
    );
  },
};

/**
 * Extracts a readable error message from a failed API call, preferring the
 * backend's envelope error body over the generic Axios message.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      const errorField = record.error;
      if (typeof errorField === 'string') {
        return errorField;
      }
      if (errorField && typeof errorField === 'object') {
        const nested = errorField as Record<string, unknown>;
        if (typeof nested.message === 'string' && nested.message) {
          return nested.message;
        }
      }
      if (typeof record.message === 'string' && record.message) {
        return record.message;
      }
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

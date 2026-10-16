import { applySession, removeToken, removeUser } from '@/services/api/api';
import api from '@/services/api/api';
import type { LoginPayload, Profile, RegisterPayload, SessionResponse } from '@/types/auth';

const BASE = '/api/v1/authentication';

export const authService = {
  async register(payload: RegisterPayload): Promise<SessionResponse> {
    const { data } = await api.post<SessionResponse>(`${BASE}/register`, payload);
    applySession(data);
    return data;
  },

  async login(payload: LoginPayload): Promise<SessionResponse> {
    const { data } = await api.post<SessionResponse>(`${BASE}/login`, payload);
    applySession(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post(`${BASE}/logout`);
    } finally {
      removeToken();
      removeUser();
    }
  },

  async getProfile(): Promise<Profile> {
    const { data } = await api.get<Profile>(`${BASE}/profile`);
    return data;
  },

  async updateProfile(payload: { name: string }): Promise<Profile> {
    const { data } = await api.put<Profile>(`${BASE}/profile`, payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put(`${BASE}/password`, payload);
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post(`${BASE}/password-reset/request`, { email });
  },

  async confirmPasswordReset(payload: { email: string; code: string; newPassword: string }): Promise<void> {
    await api.post(`${BASE}/password-reset/confirm`, payload);
  },

  async uploadProfilePhoto(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ profilePhotoUrl: string }>(`${BASE}/profile/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.profilePhotoUrl;
  },

  async deleteProfilePhoto(): Promise<void> {
    await api.delete(`${BASE}/profile/photo`);
  },
};

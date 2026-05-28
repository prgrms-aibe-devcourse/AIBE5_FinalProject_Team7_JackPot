import { apiClient } from '@/shared/api/client';
import { unwrapApiData } from '@/shared/api/types/response';
import type { ApiResponse } from '@/shared/api/types/response';

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  userId: number;
  isNewUser: boolean;
  nickname: string;
  profileImageUrl: string | null;
}

export const authApi = {
  register: async (
    email: string,
    password: string,
    nickname: string,
    birthday: string,
    name?: string,
  ): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/register', {
      email,
      password,
      nickname,
      birthday,
      ...(name ? { name } : {}),
    });
    return unwrapApiData(res.data);
  },

  login: async (email: string, password: string): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/login', {
      email,
      password,
    });
    return unwrapApiData(res.data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

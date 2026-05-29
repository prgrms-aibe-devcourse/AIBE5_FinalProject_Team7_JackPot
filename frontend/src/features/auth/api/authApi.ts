/**
 * 인증 API 클라이언트 (AUTH-01 ~ AUTH-05)
 *
 * 이메일 로그인: login/register → AuthData → localStorage 저장 (LoginPage)
 *
 * 소셜 로그인 (2단계 — redirect는 authApi가 아닌 브라우저 navigation):
 * 1. LoginPage: window.location.href = `/api/v1/auth/oauth/${provider}`
 * 2. OauthCallbackPage: oauthCallback(provider, code) → localStorage 저장
 *
 * 로그아웃: logout() — apiClient가 Bearer 헤더 자동 첨부
 */
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

  oauthCallback: async (provider: string, code: string): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>(`/auth/oauth/${provider}/callback`, { code });
    return unwrapApiData(res.data);
  },
};

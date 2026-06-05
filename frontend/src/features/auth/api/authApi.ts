/**
 * 인증 API 클라이언트 (프론트)
 * - AUTH-01: register → POST /auth/register
 * - AUTH-02: login    → POST /auth/login
 * - AUTH-03: LoginPage redirect → OauthCallbackPage oauthCallback → POST /auth/oauth/{provider}/callback
 * - AUTH-05: logout   → POST /auth/logout
 *
 * 성공 시 accessToken 등 localStorage 저장 (LoginPage, OauthCallbackPage)
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
  role: string;
}

export const authApi = {
  // AUTH-01: register
  // 의도: RegisterPage → 가입 성공 시 토큰 반환 (호출부에서 localStorage 저장)
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

  // AUTH-02: login
  // 의도: LoginPage → JWT 수신 후 라운지/온보딩 분기
  login: async (email: string, password: string): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/login', {
      email,
      password,
    });
    return unwrapApiData(res.data);
  },

  // AUTH-05: logout
  // 의도: 서버 RefreshToken 폐기 + localStorage는 호출부에서 clear
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // AUTH-03: oauthCallback
  // 의도: OauthCallbackPage가 URL의 code를 서버에 넘겨 JWT 수신
  oauthCallback: async (provider: string, code: string): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>(`/auth/oauth/${provider}/callback`, { code });
    return unwrapApiData(res.data);
  },
};

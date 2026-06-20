/**
 * 마이페이지 API 클라이언트 (프론트)
 * - USER-01: getMe            → GET /users/me
 * - USER-02: updateMe         → PATCH /users/me (profileImageUrl = S3 object key)
 * - USER-04: deleteMe         → DELETE /users/me
 * - SET-01:  updateMyPassword → PATCH /users/me/password (LOCAL만)
 *
 * Authorization Bearer 자동 첨부 (apiClient)
 */
import { apiClient } from '@/shared/api/client';
import { unwrapApiData, unwrapApiVoid } from '@/shared/api/types/response';

export interface UserMeDto {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  introduction: string | null;
  flavorProfile: unknown | null;
}

export interface UpdateUserMeRequest {
  nickname?: string | null;
  /** S3 object key (profiles/{userId}/...) */
  profileImageUrl?: string | null;
  introduction?: string | null;
}

export interface UpdateMyPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// USER-01: getMe
// 의도: MyPage 마운트 시 서버 프로필과 localStorage 동기화
export async function getMe(): Promise<UserMeDto> {
  const res = await apiClient.get('/users/me');
  return unwrapApiData(res.data);
}

// USER-02: updateMe
// 의도: 닉네임·프로필 이미지 key만 PATCH (부분 업데이트)
export async function updateMe(body: UpdateUserMeRequest): Promise<UserMeDto> {
  const res = await apiClient.patch('/users/me', body);
  return unwrapApiData(res.data);
}

// USER-04: deleteMe
// 의도: 탈퇴 API 호출 — 세션 삭제는 MyPage에서 clearAuthSession
export async function deleteMe(): Promise<void> {
  const res = await apiClient.delete('/users/me');
  unwrapApiVoid(res.data);
}

// SET-01: updateMyPassword
// 의도: LOCAL 계정 비밀번호 변경 (204 No Content)
export async function updateMyPassword(body: UpdateMyPasswordRequest): Promise<void> {
  await apiClient.patch('/users/me/password', body);
}

export const userApi = {
  client: apiClient,
  getMe,
  updateMe,
  deleteMe,
  updateMyPassword,
};

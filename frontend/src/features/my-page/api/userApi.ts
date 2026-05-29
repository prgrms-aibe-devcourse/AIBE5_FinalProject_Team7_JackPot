/**
 * 마이페이지 API (USER-01/02/04, SET-01)
 *
 * - getMe / updateMe: MyPage 프로필 조회·닉네임 수정
 * - updateMe({ profileImageUrl }): presign 업로드 후 S3 object key 저장
 * - updateMyPassword: LOCAL 계정만 (소셜 계정은 UI에서 숨기거나 비활성화 권장)
 * - deleteMe: 탈퇴 후 clearAuthSession() 호출
 *
 * apiClient가 accessToken을 Authorization 헤더에 자동 첨부.
 */
import { apiClient } from '@/shared/api/client';
import { unwrapApiData } from '@/shared/api/types/response';

export interface UserMeDto {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  flavorProfile: unknown | null;
}

export interface UpdateUserMeRequest {
  nickname?: string | null;
  /** S3 object key (profiles/{userId}/...) */
  profileImageUrl?: string | null;
}

export interface UpdateMyPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function getMe(): Promise<UserMeDto> {
  const res = await apiClient.get('/users/me');
  return unwrapApiData(res.data);
}

export async function updateMe(body: UpdateUserMeRequest): Promise<UserMeDto> {
  const res = await apiClient.patch('/users/me', body);
  return unwrapApiData(res.data);
}

export async function deleteMe(): Promise<void> {
  const res = await apiClient.delete('/users/me');
  unwrapApiData(res.data);
}

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

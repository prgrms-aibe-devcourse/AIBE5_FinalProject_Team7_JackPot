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

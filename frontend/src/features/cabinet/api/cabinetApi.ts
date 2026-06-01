import { apiClient } from '@/shared/api/client';

export const cabinetApi = {
  // 특정 유저의 픽 목록 조회 (공개 — 로그인 불필요)
  getPickList: (userId: number, page = 0, size = 20) =>
    apiClient.get(`/users/${userId}/picks`, { params: { page, size } }),

  // 픽 여부 조회 (로그인 필요)
  getPickStatus: (whiskeyId: number) =>
    apiClient.get(`/whiskeys/${whiskeyId}/pick`),

  // 픽 추가 (로그인 필요)
  addPick: (whiskeyId: number) =>
    apiClient.post(`/whiskeys/${whiskeyId}/pick`),

  // 픽 삭제 (로그인 필요)
  deletePick: (whiskeyId: number) =>
    apiClient.delete(`/whiskeys/${whiskeyId}/pick`),
};

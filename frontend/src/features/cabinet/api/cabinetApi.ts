import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types/response';
import { unwrapApiData } from '@/shared/api/types/response';

export interface CabinetStatsResponse {
  pickCount: number;
  wishCount?: number;
  reviewCount: number;
  noteCount?: number;
}

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

  // 자신의 캐비넷 통계 조회 (로그인 필요)
  getCabinetStats: async (): Promise<CabinetStatsResponse> => {
    const res = await apiClient.get<ApiResponse<CabinetStatsResponse>>('/users/me/cabinet/stats');
    return unwrapApiData(res.data);
  },

  // 타인 캐비넷 통계 조회 (로그인 필요할 수 있음 — 서버 정책에 따름)
  getUserCabinetStats: async (userId: number): Promise<CabinetStatsResponse> => {
    const res = await apiClient.get<ApiResponse<CabinetStatsResponse>>(`/users/${userId}/cabinet/stats`);
    return unwrapApiData(res.data);
  },
};

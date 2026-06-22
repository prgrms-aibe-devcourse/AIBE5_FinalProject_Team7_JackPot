import { apiClient } from '@/shared/api/client';

/** 취향 비슷한 유저 응답 — 백엔드 TasteMatchDto */
export interface TasteMatchUser {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  /** 0~100, 소수점 1자리 */
  similarity: number;
}

export const tasteMatchApi = {
  /** 라운지 위젯용 — 랜덤 1명 */
  getRandom: async (): Promise<TasteMatchUser | null> => {
    const { data } = await apiClient.get('/lounge/match/random');
    return data.data ?? null;
  },

  /** 취향 비슷한 유저 목록 — 상위 10명 */
  getList: async (): Promise<TasteMatchUser[]> => {
    const { data } = await apiClient.get('/lounge/match');
    return data.data ?? [];
  },
};

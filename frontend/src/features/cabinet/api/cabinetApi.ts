import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types/response';
import { unwrapApiData } from '@/shared/api/types/response';

export interface CabinetStatsResponse {
  pickCount: number;
  wishCount?: number;
  reviewCount: number;
  noteCount?: number;
}

// 위시 폴더 응답 타입
export interface WishlistFolder {
  folderId: number;
  name: string;
  sortOrder: number;
  createdAt: string;
}

// 위시 아이템 응답 타입
export interface WishlistItem {
  itemId: number;
  folderId: number | null;
  whiskey: {
    id: number;
    name: string;
    type: string;
    imageUrl: string | null;
    abv: number | null;
  };
  createdAt: string;
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

  // ── 위시 폴더 ──────────────────────────────
  // 내 위시 폴더 목록 조회
  getWishFolders: () =>
    apiClient.get('/users/me/wishlists'),

  // 위시 폴더 생성
  createWishFolder: (name: string, sortOrder = 0) =>
    apiClient.post('/users/me/wishlists', { name, sortOrder }),

  // 위시 폴더 이름 수정
  updateWishFolder: (folderId: number, name: string) =>
    apiClient.patch(`/users/me/wishlists/folders/${folderId}`, { name }),

  // 위시 폴더 순서 변경
  reorderWishFolders: (folderIds: number[]) =>
    apiClient.patch('/users/me/wishlists/folders/reorder', { folderIds }),

  // 위시 폴더 삭제 (폴더 내 아이템 전체 삭제)
  deleteWishFolder: (folderId: number) =>
    apiClient.delete(`/users/me/wishlists/folders/${folderId}`),

  // ── 위시 아이템 ────────────────────────────
  // 폴더 내 위시 아이템 목록 조회
  getWishItems: (folderId: number) =>
    apiClient.get(`/users/me/wishlists/${folderId}/items`),

  // 위시 추가
  addWish: (whiskeyId: number, folderId: number) =>
    apiClient.post(`/whiskeys/${whiskeyId}/wish`, null, { params: { folderId } }),

  // 특정 위스키가 등록된 폴더 ID 목록 조회 (모달 등록 여부 표시용)
  getWishedFolderIds: (whiskeyId: number) =>
    apiClient.get(`/whiskeys/${whiskeyId}/wish/folders`),

  // 위시 삭제
  removeWish: (wishItemId: number, folderId: number) =>
    apiClient.delete(`/whiskeys/wish/${wishItemId}`, { params: { folderId } }),

  // 위시 아이템 폴더 이동
  moveWishItem: (itemId: number, targetFolderId: number) =>
    apiClient.patch(`/users/me/wishlists/items/${itemId}/move`, null, { params: { targetFolderId } }),

  // 자신의 캐비넷 통계 조회 (로그인 필요)
  getCabinetStats: async (): Promise<CabinetStatsResponse> => {
    const res = await apiClient.get<ApiResponse<CabinetStatsResponse>>('/users/me/cabinet/stats');
    return unwrapApiData(res.data);
  },
};

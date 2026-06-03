import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types/common';
import {
  getMockSimilarWhiskeys,
  getMockWhiskeyDetail,
  MOCK_RELATED_COLUMNS,
  MOCK_WHISKEY_REVIEWS,
} from '../mocks/whiskeyDetailMock';
import type { RelatedColumnPost, SimilarWhiskey, WhiskeyDetail, WhiskeyReview } from '../types';

const USE_MOCK_ONLY = import.meta.env.VITE_API_MOCK === 'true';

async function withMockFallback<T>(
  fetcher: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  if (USE_MOCK_ONLY) return fallback();
  try {
    return await fetcher();
  } catch {
    return fallback();
  }
}

/** WH-02 GET /api/v1/whiskeys/{id} */
export async function fetchWhiskeyDetail(whiskeyId: string): Promise<WhiskeyDetail> {
  return withMockFallback(
    async () => {
      const { data } = await apiClient.get<WhiskeyDetail>(`/whiskeys/${whiskeyId}`);
      return data;
    },
    () => getMockWhiskeyDetail(whiskeyId),
  );
}

/** WH-02-1 GET /api/v1/whiskeys/{id}/related-posts — raw array, no wrapper */
export async function fetchRelatedColumns(whiskeyId: string): Promise<RelatedColumnPost[]> {
  return withMockFallback(
    async () => {
      const { data } = await apiClient.get<RelatedColumnPost[]>(
        `/whiskeys/${whiskeyId}/related-posts`,
      );
      return data;
    },
    () => MOCK_RELATED_COLUMNS,
  );
}

/** GET /api/v1/whiskeys/{id}/reviews */
export async function fetchWhiskeyReviews(
  whiskeyId: string,
  page = 0,
  size = 5,
  userId?: number | null,
): Promise<PageResponse<WhiskeyReview>> {
  return withMockFallback(
    async () => {
      const { data } = await apiClient.get<PageResponse<WhiskeyReview>>(
        `/whiskeys/${whiskeyId}/reviews`,
        { params: { page, size, ...(userId != null ? { userId } : {}) } },
      );
      return data;
    },
    () => MOCK_WHISKEY_REVIEWS,
  );
}

/**
 * WH-03 비슷한 위스키 추천 (raw 배열, 최대 3)
 * - 백엔드 GET /api/v1/whiskeys/{id}/similar 준비 전: 목데이터로 표시
 * - 실제 연결 시 아래 두 줄로 교체:
 *     const { data } = await apiClient.get<SimilarWhiskey[]>(`/whiskeys/${whiskeyId}/similar`);
 *     return data;
 */
export async function fetchSimilarWhiskeys(whiskeyId: string): Promise<SimilarWhiskey[]> {
  return getMockSimilarWhiskeys(whiskeyId);
}

export const whiskeyApi = {
  fetchWhiskeyDetail,
  fetchRelatedColumns,
  fetchWhiskeyReviews,
  fetchSimilarWhiskeys,
};

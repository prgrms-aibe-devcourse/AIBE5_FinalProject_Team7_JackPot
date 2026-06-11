import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types/common';
import {
  getMockSimilarWhiskeys,
  getMockWhiskeyDetail,
  MOCK_RELATED_COLUMNS,
  MOCK_WHISKEY_REVIEWS,
} from '../mocks/whiskeyDetailMock';
import type {
  RelatedColumnPost,
  SimilarWhiskey,
  WhiskeyDetail,
  WhiskeyReview,
  WhiskeyReviewStats,
} from '../types';

const USE_MOCK_ONLY = import.meta.env.VITE_API_MOCK === 'true';

const LOCAL_DETAIL_READ_ERROR_CONFIG = {
  skipAuthRedirect: true,
  skipGlobalErrorRedirect: true,
};

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
      const { data } = await apiClient.get<WhiskeyDetail>(
        `/whiskeys/${whiskeyId}`,
        LOCAL_DETAIL_READ_ERROR_CONFIG,
      );
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
        LOCAL_DETAIL_READ_ERROR_CONFIG,
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
        {
          ...LOCAL_DETAIL_READ_ERROR_CONFIG,
          params: { page, size, ...(userId != null ? { userId } : {}) },
        },
      );
      return data;
    },
    () => MOCK_WHISKEY_REVIEWS,
  );
}

/** GET /api/v1/whiskeys/{id}/reviewstats — 리뷰 개수·평균 점수 */
export async function fetchWhiskeyReviewStats(whiskeyId: string): Promise<WhiskeyReviewStats> {
  return withMockFallback(
    async () => {
      const { data } = await apiClient.get<WhiskeyReviewStats>(
        `/whiskeys/${whiskeyId}/reviewstats`,
        LOCAL_DETAIL_READ_ERROR_CONFIG,
      );
      return data;
    },
    () => ({ reviewCount: 0, avgRating: null }),
  );
}

/**
 * WH-03 GET /api/v1/whiskeys/{id}/similar — 비슷한 위스키 추천 (raw 배열, 최대 3)
 * - 200 응답이 오면 실제 추천 데이터를 사용
 * - 호출 실패 시 목데이터로 폴백 (다른 위스키 API와 동일한 패턴)
 */
export async function fetchSimilarWhiskeys(whiskeyId: string): Promise<SimilarWhiskey[]> {
  return withMockFallback(
    async () => {
      const { data } = await apiClient.get<SimilarWhiskey[]>(
        `/whiskeys/${whiskeyId}/similar`,
        LOCAL_DETAIL_READ_ERROR_CONFIG,
      );
      return data;
    },
    () => getMockSimilarWhiskeys(whiskeyId),
  );
}

/**
 * POST /api/v1/whiskeys/{id}/view-logs — 조회 로그 적재
 * - 로그인 유저가 상세 페이지에 일정 시간 이상 머물면 호출
 * - userId는 서버가 인증 토큰에서 채움 (body 없음)
 * - 분석용 fire-and-forget: 실패해도 화면 동작을 막지 않음
 */
export async function recordWhiskeyView(whiskeyId: string): Promise<void> {
  try {
    await apiClient.post(`/whiskeys/${whiskeyId}/view-logs`);
  } catch {
    // 로그 적재 실패는 무시
  }
}

export const whiskeyApi = {
  fetchWhiskeyDetail,
  recordWhiskeyView,
  fetchRelatedColumns,
  fetchWhiskeyReviews,
  fetchWhiskeyReviewStats,
  fetchSimilarWhiskeys,
};

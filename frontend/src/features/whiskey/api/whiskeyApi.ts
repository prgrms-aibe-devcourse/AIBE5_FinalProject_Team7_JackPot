import { apiClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types/response';
import { unwrapApiData } from '@/shared/api/types/response';
import { getMockWhiskeyDetail, MOCK_RELATED_COLUMNS } from '../mocks/whiskeyDetailMock';
import type { RelatedColumnPost, WhiskeyDetail } from '../types';

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
      const { data } = await apiClient.get<ApiResponse<WhiskeyDetail>>(`/whiskeys/${whiskeyId}`);
      return unwrapApiData(data);
    },
    () => getMockWhiskeyDetail(whiskeyId),
  );
}

/** WH-02-1 GET /api/v1/whiskeys/{id}/related-posts */
export async function fetchRelatedColumns(whiskeyId: string): Promise<RelatedColumnPost[]> {
  return withMockFallback(
    async () => {
      const { data } = await apiClient.get<ApiResponse<RelatedColumnPost[]>>(
        `/whiskeys/${whiskeyId}/related-posts`,
      );
      return unwrapApiData(data);
    },
    () => MOCK_RELATED_COLUMNS,
  );
}

export const whiskeyApi = {
  fetchWhiskeyDetail,
  fetchRelatedColumns,
};

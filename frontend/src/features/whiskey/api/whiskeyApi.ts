import { apiClient } from '@/shared/api/client';
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

export const whiskeyApi = {
  fetchWhiskeyDetail,
  fetchRelatedColumns,
};

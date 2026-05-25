import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types/common';

export type WhiskeyType = 'single_malt' | 'blended' | 'bourbon' | 'rye' | 'etc';

export interface WhiskeyCard {
  id: number;
  name: string;
  type: WhiskeyType;
  imageUrl: string | null;
  abv: number | null;
  ageYears: number;
  region: string | null;
  country: string | null;
  cask: string | null;
}

export interface WhiskeyListParams {
  page?: number;
  size?: number;
}

export interface WhiskeySearchParams extends WhiskeyListParams {
  q: string;
}

/** FN-031 GET /api/v1/whiskeys - 위스키 전체 목록 */
export async function fetchWhiskeys(params: WhiskeyListParams = {}): Promise<PageResponse<WhiskeyCard>> {
  const { data } = await apiClient.get<PageResponse<WhiskeyCard>>('/whiskeys', {
    params,
  });

  return data;
}

/** FN-028 GET /api/v1/whiskeys/search - 검색어로 위스키 목록 검색 */
export async function searchWhiskeys(params: WhiskeySearchParams): Promise<PageResponse<WhiskeyCard>> {
  const { data } = await apiClient.get<PageResponse<WhiskeyCard>>('/whiskeys/search', {
    params,
  });

  return data;
}

export const whiskeyApi = {
  client: apiClient,
  fetchWhiskeys,
  searchWhiskeys,
};

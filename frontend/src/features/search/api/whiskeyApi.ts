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

export interface WhiskeyFilterParams extends WhiskeyListParams {
  keyword?: string;
  types?: WhiskeyType[];
  noseTags?: string[];
  tasteTags?: string[];
  minAbv?: number;
  maxAbv?: number;
  minAge?: number;
  maxAge?: number;
}

export interface WhiskeyAutocompleteItem {
  keyword: string;
}

export interface WhiskeyAutocompleteParams {
  q: string;
  size?: number;
}

export interface WhiskeyKeywordCorrection {
  originalKeyword: string;
  correctedKeyword: string | null;
}

const LOCAL_SEARCH_ERROR_CONFIG = {
  skipAuthRedirect: true,
  skipGlobalErrorRedirect: true,
};

function toFilterSearchParams(params: WhiskeyFilterParams) {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.set('keyword', params.keyword);
  params.types?.forEach((type) => searchParams.append('types', type));
  params.noseTags?.forEach((tag) => searchParams.append('noseTags', tag));
  params.tasteTags?.forEach((tag) => searchParams.append('tasteTags', tag));
  if (params.minAbv != null) searchParams.set('minAbv', String(params.minAbv));
  if (params.maxAbv != null) searchParams.set('maxAbv', String(params.maxAbv));
  if (params.minAge != null) searchParams.set('minAge', String(params.minAge));
  if (params.maxAge != null) searchParams.set('maxAge', String(params.maxAge));
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.size != null) searchParams.set('size', String(params.size));

  return searchParams;
}

/** FN-031 GET /api/v1/whiskeys - 위스키 전체 목록 */
export async function fetchWhiskeys(params: WhiskeyListParams = {}): Promise<PageResponse<WhiskeyCard>> {
  const { data } = await apiClient.get<PageResponse<WhiskeyCard>>('/whiskeys', {
    ...LOCAL_SEARCH_ERROR_CONFIG,
    params,
  });

  return data;
}

/** 전체 위스키 목록 — 페이지를 순회해 모두 수집 (칼럼 작성 등 선택 UI용) */
export async function fetchAllWhiskeyCards(pageSize = 100): Promise<WhiskeyCard[]> {
  const first = await fetchWhiskeys({ page: 0, size: pageSize });
  const all = [...first.content];

  if (first.totalPages <= 1) return all;

  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) =>
      fetchWhiskeys({ page: i + 1, size: pageSize }),
    ),
  );
  rest.forEach((page) => all.push(...page.content));
  return all;
}

/** FN-028 GET /api/v1/whiskeys/search - 검색어로 위스키 목록 검색 */
export async function searchWhiskeys(params: WhiskeySearchParams): Promise<PageResponse<WhiskeyCard>> {
  const { data } = await apiClient.get<PageResponse<WhiskeyCard>>('/whiskeys/search', {
    ...LOCAL_SEARCH_ERROR_CONFIG,
    params,
  });

  return data;
}

/** GET /api/v1/whiskeys/autocomplete - 검색창 자동완성 키워드 */
export async function autocompleteWhiskeys(
  params: WhiskeyAutocompleteParams,
): Promise<WhiskeyAutocompleteItem[]> {
  const { data } = await apiClient.get<WhiskeyAutocompleteItem[]>('/whiskeys/autocomplete', {
    ...LOCAL_SEARCH_ERROR_CONFIG,
    params,
  });

  return data;
}

/** GET /api/v1/whiskeys/search/correction - 오타 교정 검색어 추천 */
export async function correctWhiskeyKeyword(q: string): Promise<WhiskeyKeywordCorrection> {
  const { data } = await apiClient.get<WhiskeyKeywordCorrection>('/whiskeys/search/correction', {
    ...LOCAL_SEARCH_ERROR_CONFIG,
    params: { q },
  });

  return data;
}

/** GET /api/v1/whiskeys/{id} - 위스키 단건 조회 */
export async function fetchWhiskeyById(id: number): Promise<WhiskeyCard> {
  const { data } = await apiClient.get<WhiskeyCard>(`/whiskeys/${id}`);
  return data;
}

/** GET /api/v1/whiskeys/filter - 키워드와 사이드바 필터 조합 검색 */
export async function filterWhiskeys(params: WhiskeyFilterParams): Promise<PageResponse<WhiskeyCard>> {
  const { data } = await apiClient.get<PageResponse<WhiskeyCard>>('/whiskeys/filter', {
    ...LOCAL_SEARCH_ERROR_CONFIG,
    params: toFilterSearchParams(params),
  });

  return data;
}

export const whiskeyApi = {
  client: apiClient,
  fetchWhiskeys,
  fetchAllWhiskeyCards,
  searchWhiskeys,
  autocompleteWhiskeys,
  correctWhiskeyKeyword,
  filterWhiskeys,
};

import { apiClient } from '@/shared/api/client';

/** 태그 카테고리 — 백엔드 TagCategory enum 상수명(소문자)과 일치 */
export type TagCategory = 'nose' | 'taste';

/**
 * GET /api/v1/tags 응답 (raw 배열, 래퍼 없음) — 백엔드 TagResponse DTO
 * - pairedTag를 제외한 Tag 엔티티 필드
 * - imageUrl은 현재 비어 있으므로 이미지 렌더에 사용하지 않는다.
 */
export interface Tag {
  id: number;
  category: TagCategory;
  name: string;
  nameEng: string | null;
  description: string | null;
  example: string | null;
  displayOrder: number | null;
  imageUrl: string | null;
}

/**
 * GET /api/v1/tags?category=nose|taste
 * - category 생략 시 전체 태그 반환
 * - displayOrder 기준 정렬 (백엔드 정렬 보장이 없어 프론트에서 보정)
 */
export async function fetchTags(category?: TagCategory): Promise<Tag[]> {
  const { data } = await apiClient.get<Tag[]>('/tags', {
    params: category ? { category } : undefined,
  });
  // 서버가 category 필터를 적용하지 않더라도 중복 노출되지 않도록 한 번 더 거른다.
  const filtered = category ? data.filter((t) => t.category === category) : data;
  return [...filtered].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export const tagApi = { fetchTags };

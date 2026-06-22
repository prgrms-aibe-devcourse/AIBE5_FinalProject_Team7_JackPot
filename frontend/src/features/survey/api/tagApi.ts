import { apiClient } from '@/shared/api/client';

/** 태그 카테고리 — 백엔드 TagCategory enum 상수명(소문자)과 일치 */
export type TagCategory = 'nose' | 'taste';

/**
 * 태그 1건 — 백엔드 TagResponse DTO (pairedTag 제외)
 * imageUrl은 현재 비어 있으므로 이미지 렌더에 사용하지 않는다.
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

/** 중분류 그룹 (백엔드 TagGroup label 기준) + 소속 태그 */
export interface TagGroupView {
  group: string;
  tags: Tag[];
}

/** GET /api/v1/tags 응답 — 백엔드 TagMapResponse: { tags: { 그룹라벨: TagResponse[] } } */
interface TagMapResponse {
  tags: Record<string, Tag[]>;
}

/**
 * GET /api/v1/tags?category=nose|taste
 * - 백엔드가 중분류 그룹 맵으로 반환 (그룹 순서·내부 displayOrder 정렬 보장)
 * - 빈 그룹은 제외하고, JSON 객체 키 순서(=백엔드 enum 순서)를 유지해 배열로 변환
 * - 구버전 평탄 배열 응답이 와도 단일 그룹으로 감싸 안전 처리
 */
export async function fetchTags(category?: TagCategory): Promise<TagGroupView[]> {
  const { data } = await apiClient.get<TagMapResponse | Tag[]>('/tags', {
    params: category ? { category } : undefined,
  });

  // 구버전: 평탄 배열로 오는 경우 → 단일 그룹으로 감쌈
  if (Array.isArray(data)) {
    return data.length ? [{ group: '전체', tags: data }] : [];
  }

  return Object.entries(data?.tags ?? {})
    .filter(([, tags]) => tags.length > 0)
    .map(([group, tags]) => ({ group, tags }));
}

export const tagApi = { fetchTags };

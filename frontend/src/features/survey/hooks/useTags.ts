import { useQuery } from '@tanstack/react-query';
import { fetchTags, type TagCategory } from '../api/tagApi';

export function tagsQueryKey(category?: TagCategory) {
  return ['tags', category ?? 'ALL'] as const;
}

/**
 * 태그 목록 조회 — 설문 향(NOSE)/맛(TASTE) chip 등에 사용.
 * 태그는 거의 바뀌지 않으므로 staleTime을 길게 둬 재요청을 줄인다.
 */
export function useTags(category?: TagCategory) {
  return useQuery({
    queryKey: tagsQueryKey(category),
    queryFn: () => fetchTags(category),
    staleTime: 1000 * 60 * 30,
  });
}

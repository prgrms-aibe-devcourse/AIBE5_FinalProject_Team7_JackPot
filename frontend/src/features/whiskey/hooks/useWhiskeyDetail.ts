import { useQuery } from '@tanstack/react-query';
import { fetchRelatedColumns, fetchWhiskeyDetail, fetchWhiskeyReviews } from '../api/whiskeyApi';

export function whiskeyDetailQueryKey(whiskeyId: string) {
  return ['whiskey', 'detail', whiskeyId] as const;
}

export function relatedColumnsQueryKey(whiskeyId: string) {
  return ['whiskey', 'related-posts', whiskeyId] as const;
}

export function whiskeyReviewsQueryKey(whiskeyId: string, page: number, size: number) {
  return ['whiskey', 'reviews', whiskeyId, page, size] as const;
}

export function useWhiskeyDetail(whiskeyId: string | undefined) {
  return useQuery({
    queryKey: whiskeyDetailQueryKey(whiskeyId ?? ''),
    queryFn: () => fetchWhiskeyDetail(whiskeyId!),
    enabled: Boolean(whiskeyId),
  });
}

export function useRelatedColumns(whiskeyId: string | undefined) {
  return useQuery({
    queryKey: relatedColumnsQueryKey(whiskeyId ?? ''),
    queryFn: () => fetchRelatedColumns(whiskeyId!),
    enabled: Boolean(whiskeyId),
  });
}

export function useWhiskeyReviews(whiskeyId: string | undefined, page = 0, size = 5) {
  return useQuery({
    queryKey: whiskeyReviewsQueryKey(whiskeyId ?? '', page, size),
    queryFn: () => fetchWhiskeyReviews(whiskeyId!, page, size),
    enabled: Boolean(whiskeyId),
  });
}

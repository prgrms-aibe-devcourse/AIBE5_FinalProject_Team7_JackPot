import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchRelatedColumns,
  fetchSimilarWhiskeys,
  fetchWhiskeyDetail,
  fetchWhiskeyReviews,
  fetchWhiskeyReviewStats,
} from '../api/whiskeyApi';

function getCurrentUserId(): number | null {
  const value = localStorage.getItem('userId');
  if (!value) return null;

  const userId = Number(value);
  return Number.isFinite(userId) ? userId : null;
}

export function whiskeyDetailQueryKey(whiskeyId: string) {
  return ['whiskey', 'detail', whiskeyId] as const;
}

export function relatedColumnsQueryKey(whiskeyId: string) {
  return ['whiskey', 'related-posts', whiskeyId] as const;
}

export function whiskeyReviewsQueryKey(whiskeyId: string, page: number, size: number) {
  return ['whiskey', 'reviews', whiskeyId, page, size, getCurrentUserId()] as const;
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

export function similarWhiskeysQueryKey(whiskeyId: string) {
  return ['whiskey', 'similar', whiskeyId] as const;
}

export function useSimilarWhiskeys(whiskeyId: string | undefined) {
  return useQuery({
    queryKey: similarWhiskeysQueryKey(whiskeyId ?? ''),
    queryFn: () => fetchSimilarWhiskeys(whiskeyId!),
    enabled: Boolean(whiskeyId),
  });
}

export function whiskeyReviewStatsQueryKey(whiskeyId: string) {
  return ['whiskey', 'review-stats', whiskeyId] as const;
}

export function useWhiskeyReviewStats(whiskeyId: string | undefined) {
  return useQuery({
    queryKey: whiskeyReviewStatsQueryKey(whiskeyId ?? ''),
    queryFn: () => fetchWhiskeyReviewStats(whiskeyId!),
    enabled: Boolean(whiskeyId),
  });
}

export function useWhiskeyReviews(whiskeyId: string | undefined, page = 0, size = 5) {
  const userId = getCurrentUserId();

  return useQuery({
    queryKey: whiskeyReviewsQueryKey(whiskeyId ?? '', page, size),
    queryFn: () => fetchWhiskeyReviews(whiskeyId!, page, size, userId),
    enabled: Boolean(whiskeyId),
  });
}

export function useWhiskeyReviewsInfinite(whiskeyId: string | undefined, size = 10) {
  const userId = getCurrentUserId();

  return useInfiniteQuery({
    queryKey: ['whiskey', 'reviews', 'infinite', whiskeyId ?? '', size, userId] as const,
    queryFn: ({ pageParam }) => fetchWhiskeyReviews(whiskeyId!, pageParam, size, userId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      allPages.length < (lastPage.totalPages ?? 0) ? allPages.length : undefined,
    enabled: Boolean(whiskeyId),
  });
}

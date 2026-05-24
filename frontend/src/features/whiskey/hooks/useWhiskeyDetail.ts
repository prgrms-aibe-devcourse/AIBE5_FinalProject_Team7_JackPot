import { useQuery } from '@tanstack/react-query';
import { fetchRelatedColumns, fetchWhiskeyDetail } from '../api/whiskeyApi';

export function whiskeyDetailQueryKey(whiskeyId: string) {
  return ['whiskey', 'detail', whiskeyId] as const;
}

export function relatedColumnsQueryKey(whiskeyId: string) {
  return ['whiskey', 'related-posts', whiskeyId] as const;
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

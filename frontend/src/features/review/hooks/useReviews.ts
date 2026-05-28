import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  deleteReview,
  fetchMyReviews,
  updateReview,
  type ReviewSaveRequest,
} from '../api/reviewApi';

export const reviewKeys = {
  mine: (userId: number, page: number, size: number) => ['reviews', 'me', userId, page, size] as const,
  whiskey: (whiskeyId: string, page: number, size: number) => ['whiskey', 'reviews', whiskeyId, page, size] as const,
};

export function useMyReviews(userId: number | null, page = 0, size = 20) {
  return useQuery({
    queryKey: reviewKeys.mine(userId ?? 0, page, size),
    queryFn: () => fetchMyReviews(userId!, page, size),
    enabled: userId != null,
  });
}

export function useCreateReview(userId: number | null, whiskeyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReviewSaveRequest) => createReview(userId!, whiskeyId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'reviews', whiskeyId] });
      if (userId != null) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'me', userId] });
      }
    },
  });
}

export function useUpdateReview(userId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: number; body: ReviewSaveRequest }) =>
      updateReview(userId!, reviewId, body),
    onSuccess: () => {
      if (userId != null) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'me', userId] });
      }
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'reviews'] });
    },
  });
}

export function useDeleteReview(userId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(userId!, reviewId),
    onSuccess: () => {
      if (userId != null) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'me', userId] });
      }
      queryClient.invalidateQueries({ queryKey: ['whiskey', 'reviews'] });
    },
  });
}

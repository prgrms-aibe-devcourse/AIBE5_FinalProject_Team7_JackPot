import { apiClient } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types/common';
import type { WhiskeyReview } from '@/features/whiskey/types';

export interface ReviewSaveRequest {
  rating: number;
  publicText: string;
  attachedNoteId?: number | null;
}

export interface ReviewLikeResponse {
  reviewId: number;
  likeCount: number;
  likedByMe: boolean;
}

export async function fetchMyReviews(
  userId: number,
  page = 0,
  size = 20,
): Promise<PageResponse<WhiskeyReview>> {
  const { data } = await apiClient.get<PageResponse<WhiskeyReview>>('/reviews', {
    params: { userId, page, size },
  });
  return data;
}

export async function createReview(
  userId: number,
  whiskeyId: string,
  body: ReviewSaveRequest,
): Promise<WhiskeyReview> {
  const { data } = await apiClient.post<WhiskeyReview>(
    `/whiskeys/${whiskeyId}/reviews`,
    body,
    { params: { userId } },
  );
  return data;
}

export async function updateReview(
  userId: number,
  reviewId: number,
  body: ReviewSaveRequest,
): Promise<WhiskeyReview> {
  const { data } = await apiClient.patch<WhiskeyReview>(
    `/reviews/${reviewId}`,
    body,
    { params: { userId } },
  );
  return data;
}

export async function deleteReview(userId: number, reviewId: number): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}`, {
    params: { userId },
  });
}

export async function likeReview(userId: number, reviewId: number): Promise<ReviewLikeResponse> {
  const { data } = await apiClient.post<ReviewLikeResponse>(
    `/reviews/${reviewId}/likes`,
    null,
    { params: { userId } },
  );
  return data;
}

export async function unlikeReview(userId: number, reviewId: number): Promise<ReviewLikeResponse> {
  const { data } = await apiClient.delete<ReviewLikeResponse>(`/reviews/${reviewId}/likes`, {
    params: { userId },
  });
  return data;
}

export const reviewApi = {
  client: apiClient,
  fetchMyReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
};

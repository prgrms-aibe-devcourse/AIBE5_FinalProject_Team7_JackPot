import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchColumns,
  fetchComments,
  fetchFreePosts,
  fetchPost,
  fetchQnaPosts,
  likePost,
  unlikePost,
  createComment,
  deleteComment,
} from '../api/communityApi';
import type { CommentCreateRequest, PostCategory } from '../types';

export const communityKeys = {
  columns: (page: number) => ['community', 'columns', page] as const,
  free: (page: number, category?: PostCategory) =>
    ['community', 'free', page, category] as const,
  qna: (page: number) => ['community', 'qna', page] as const,
  post: (postId: number, userId?: number) => ['community', 'post', postId, userId] as const,
  comments: (postId: number) => ['community', 'comments', postId] as const,
};

export function useColumns(page = 0) {
  return useQuery({
    queryKey: communityKeys.columns(page),
    queryFn: () => fetchColumns(page),
  });
}

export function useFreePosts(page = 0, category?: PostCategory) {
  return useQuery({
    queryKey: communityKeys.free(page, category),
    queryFn: () => fetchFreePosts(page, 10, category),
  });
}

export function useQnaPosts(page = 0) {
  return useQuery({
    queryKey: communityKeys.qna(page),
    queryFn: () => fetchQnaPosts(page),
  });
}

export function usePost(postId: number | undefined, userId?: number) {
  return useQuery({
    queryKey: communityKeys.post(postId!, userId),
    queryFn: () => fetchPost(postId!, userId),
    enabled: postId != null,
  });
}

export function useComments(postId: number | undefined) {
  return useQuery({
    queryKey: communityKeys.comments(postId!),
    queryFn: () => fetchComments(postId!),
    enabled: postId != null,
  });
}

export function useLikePost(postId: number, userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (liked: boolean) =>
      liked ? unlikePost(userId, postId) : likePost(userId, postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communityKeys.post(postId, userId) });
    },
  });
}

export function useCreateComment(postId: number, userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CommentCreateRequest) => createComment(userId, postId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communityKeys.comments(postId) });
    },
  });
}

export function useDeleteComment(postId: number, userId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(userId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communityKeys.comments(postId) });
    },
  });
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  updateComment,
  fetchColumns,
  fetchComments,
  fetchFeeds,
  fetchFreePosts,
  fetchNotices,
  fetchPost,
  fetchQnaPosts,
  likePost,
  unlikePost,
} from '../api/communityApi';
import type { CommentCreateRequest, PostCategory } from '../types';

export const communityKeys = {
  feeds: (page: number) => ['community', 'feeds', page] as const,
  columns: (page: number) => ['community', 'columns', page] as const,
  free: (page: number, category?: PostCategory) => ['community', 'free', page, category] as const,
  qna: (page: number) => ['community', 'qna', page] as const,
  notices: (page: number) => ['community', 'notices', page] as const,
  post: (postId: number) => ['community', 'post', postId] as const,
  comments: (postId: number) => ['community', 'comments', postId] as const,
};

export function useFeeds(page = 0) {
  return useQuery({ queryKey: communityKeys.feeds(page), queryFn: () => fetchFeeds(page) });
}

export function useColumns(page = 0) {
  return useQuery({ queryKey: communityKeys.columns(page), queryFn: () => fetchColumns(page) });
}

export function useFreePosts(page = 0, category?: PostCategory) {
  return useQuery({
    queryKey: communityKeys.free(page, category),
    queryFn: () => fetchFreePosts(page, 10, category),
  });
}

export function useQnaPosts(page = 0) {
  return useQuery({ queryKey: communityKeys.qna(page), queryFn: () => fetchQnaPosts(page) });
}

export function useNotices(page = 0) {
  return useQuery({ queryKey: communityKeys.notices(page), queryFn: () => fetchNotices(page) });
}

export function usePost(postId: number | undefined) {
  return useQuery({
    queryKey: communityKeys.post(postId!),
    queryFn: () => fetchPost(postId!),
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

export function useLikePost(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isLiked: boolean) =>
      isLiked ? unlikePost(postId) : likePost(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: communityKeys.post(postId) }),
  });
}

export function useCreateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CommentCreateRequest) => createComment(postId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: communityKeys.comments(postId) }),
  });
}

export function useDeleteComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: communityKeys.comments(postId) }),
  });
}

export function useUpdateComment(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: communityKeys.comments(postId) }),
  });
}

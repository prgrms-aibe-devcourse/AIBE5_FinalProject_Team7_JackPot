import { apiClient } from '@/shared/api/client';
import type {
  CommentCreateRequest,
  CommentTreeResponse,
  PostCreateRequest,
  PostDetailDto,
  PostSummaryResponse,
  PostUpdateRequest,
  SpringPage,
  PostCategory,
} from '../types';

export async function fetchColumns(page = 0, size = 10): Promise<SpringPage<PostSummaryResponse>> {
  const { data } = await apiClient.get<SpringPage<PostSummaryResponse>>('/community/columns', {
    params: { page, size },
  });
  return data;
}

export async function fetchFreePosts(
  page = 0,
  size = 10,
  category?: PostCategory,
): Promise<SpringPage<PostSummaryResponse>> {
  const { data } = await apiClient.get<SpringPage<PostSummaryResponse>>('/community/free', {
    params: { page, size, ...(category ? { category } : {}) },
  });
  return data;
}

export async function fetchQnaPosts(page = 0, size = 10): Promise<SpringPage<PostSummaryResponse>> {
  const { data } = await apiClient.get<SpringPage<PostSummaryResponse>>('/community/qna', {
    params: { page, size },
  });
  return data;
}

export async function fetchPost(postId: number, userId?: number): Promise<PostDetailDto> {
  const { data } = await apiClient.get<PostDetailDto>(`/posts/${postId}`, {
    params: userId != null ? { userId } : {},
  });
  return data;
}

export async function createPost(userId: number, body: PostCreateRequest): Promise<number> {
  const { data } = await apiClient.post<number>('/posts', body, { params: { userId } });
  return data;
}

export async function updatePost(
  userId: number,
  postId: number,
  body: PostUpdateRequest,
): Promise<PostDetailDto> {
  const { data } = await apiClient.patch<PostDetailDto>(`/posts/${postId}`, body, {
    params: { userId },
  });
  return data;
}

export async function deletePost(userId: number, postId: number): Promise<void> {
  await apiClient.delete(`/posts/${postId}`, { params: { userId } });
}

export async function likePost(userId: number, postId: number): Promise<void> {
  await apiClient.post(`/posts/${postId}/likes`, null, { params: { userId } });
}

export async function unlikePost(userId: number, postId: number): Promise<void> {
  await apiClient.delete(`/posts/${postId}/likes`, { params: { userId } });
}

export async function fetchComments(postId: number): Promise<CommentTreeResponse[]> {
  const { data } = await apiClient.get<CommentTreeResponse[]>(`/posts/${postId}/comments`);
  return data;
}

export async function createComment(
  userId: number,
  postId: number,
  body: CommentCreateRequest,
): Promise<void> {
  await apiClient.post(`/posts/${postId}/comments`, body, { params: { userId } });
}

export async function deleteComment(userId: number, commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`, { params: { userId } });
}

export const communityApi = {
  fetchColumns,
  fetchFreePosts,
  fetchQnaPosts,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  fetchComments,
  createComment,
  deleteComment,
};
import { apiClient } from '@/shared/api/client';
import type {
  CommentCreateRequest,
  CommentTreeResponse,
  ContentFeedResponse,
  PostCategory,
  PostCreateRequest,
  PostDetailDto,
  PostSummaryResponse,
  PostUpdateRequest,
  SpringPage,
} from '../types';

export async function fetchColumns(page = 0, size = 10): Promise<SpringPage<PostSummaryResponse>> {
  const { data } = await apiClient.get<SpringPage<PostSummaryResponse>>('/community/columns', {
    params: { page, size },
  });
  return data;
}

export async function fetchFeeds(page = 0, size = 20): Promise<SpringPage<ContentFeedResponse>> {
  const { data } = await apiClient.get<SpringPage<ContentFeedResponse>>('/feeds', {
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

export async function fetchNotices(page = 0, size = 10): Promise<SpringPage<PostSummaryResponse>> {
  const { data } = await apiClient.get<SpringPage<PostSummaryResponse>>('/community/notices', {
    params: { page, size },
  });
  return data;
}

/** 캐비넷 커뮤니티 탭 — 작성자별 글 (자유·칼럼·QnA 목록에서 필터) */
export async function fetchAuthorPosts(
  authorId: number,
  page = 0,
  size = 50,
): Promise<PostSummaryResponse[]> {
  const [free, columns, qna] = await Promise.all([
    fetchFreePosts(page, size),
    fetchColumns(page, size),
    fetchQnaPosts(page, size),
  ]);
  const merged = [...free.content, ...columns.content, ...qna.content];
  return merged
    .filter((post) => post.authorId === authorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// userId 파라미터 제거 — 인증은 Authorization 헤더로 처리
export async function fetchPost(postId: number): Promise<PostDetailDto> {
  const { data } = await apiClient.get<PostDetailDto>(`/posts/${postId}`);
  return data;
}

export async function createPost(body: PostCreateRequest): Promise<number> {
  const { data } = await apiClient.post<number>('/posts', body);
  return data;
}

export async function updatePost(
  postId: number,
  body: PostUpdateRequest,
): Promise<PostDetailDto> {
  const { data } = await apiClient.patch<PostDetailDto>(`/posts/${postId}`, body);
  return data;
}

export async function deletePost(postId: number): Promise<void> {
  await apiClient.delete(`/posts/${postId}`);
}

export async function likePost(postId: number): Promise<void> {
  await apiClient.post(`/posts/${postId}/likes`, null);
}

export async function unlikePost(postId: number): Promise<void> {
  await apiClient.delete(`/posts/${postId}/likes`);
}

export async function fetchComments(postId: number): Promise<CommentTreeResponse[]> {
  const { data } = await apiClient.get<CommentTreeResponse[]>(`/posts/${postId}/comments`);
  return data;
}

export async function createComment(
  postId: number,
  body: CommentCreateRequest,
): Promise<void> {
  await apiClient.post(`/posts/${postId}/comments`, body);
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}

export async function updateComment(commentId: number, content: string): Promise<void> {
  await apiClient.patch(`/comments/${commentId}`, { content });
}

// 커뮤니티 관련 모든 API 호출 함수 — 게시글·칼럼·댓글·좋아요 엔드포인트를 중앙 관리
import { apiClient } from '@/shared/api/client';
import type {
  CommentCreateRequest,
  CommentTreeResponse,
  WhiskeyColumnResponse,
  PostCategory,
  PostCreateRequest,
  PostDetailDto,
  PostSummaryResponse,
  PostUpdateRequest,
  SpringPage,
} from '../types';

// 주의: fetchColumns와 fetchWhiskeyColumns는 이름이 비슷하지만 완전히 다른 데이터를 조회한다.
// - fetchColumns: /community/columns → 유저가 작성한 COLUMN 타입 게시글 목록 (PostSummaryResponse)
// - fetchWhiskeyColumns: /columns → 크롤러가 수집한 외부 위스키 칼럼 목록 (WhiskeyColumnResponse)
// 혼동하면 타입 불일치 런타임 오류가 발생하므로 함수를 호출할 때 반환 타입을 반드시 확인할 것.
export async function fetchColumns(page = 0, size = 10): Promise<SpringPage<PostSummaryResponse>> {
  const { data } = await apiClient.get<SpringPage<PostSummaryResponse>>('/community/columns', {
    params: { page, size },
  });
  return data;
}

export async function fetchWhiskeyColumns(page = 0, size = 20): Promise<SpringPage<WhiskeyColumnResponse>> {
  const { data } = await apiClient.get<SpringPage<WhiskeyColumnResponse>>('/columns', {
    params: { page, size },
  });
  return data;
}

export async function fetchWhiskeyColumn(columnId: number): Promise<WhiskeyColumnResponse> {
  const { data } = await apiClient.get<WhiskeyColumnResponse>(`/columns/${columnId}`);
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

// 캐비넷 커뮤니티 탭 — 작성자별 글 (자유·칼럼·QnA 목록에서 필터)
// 한계: 이 함수는 클라이언트 사이드 필터링으로, 각 목록의 첫 페이지(size=50)만 가져와
// authorId로 필터한다. 작성자가 첫 50개 이후에 작성한 글은 누락될 수 있다.
// 정확한 구현을 위해서는 서버에서 authorId 기반 쿼리 API를 별도 제공해야 한다.
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
export async function fetchTopPosts(limit = 5): Promise<PostSummaryResponse[]> {
  const { data } = await apiClient.get<PostSummaryResponse[]>('/posts/top', { params: { limit } });
  return data;
}

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

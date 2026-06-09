// 커뮤니티 기능에서 사용하는 React Query 훅 모음 — 쿼리 키 관리 및 데이터 패칭 캡슐화
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  updateComment,
  fetchColumns,
  fetchComments,
  fetchWhiskeyColumn,
  fetchWhiskeyColumns,
  fetchFreePosts,
  fetchNotices,
  fetchPost,
  fetchQnaPosts,
  likePost,
  unlikePost,
} from '../api/communityApi';
import type { CommentCreateRequest, PostCategory } from '../types';

// communityKeys: 쿼리 키를 중앙 집중식으로 관리하는 객체.
// 배열 형태를 사용하는 이유는 React Query가 키의 prefix 기반으로 invalidate를 지원하기 때문이다.
// 예: queryClient.invalidateQueries({ queryKey: ['community', 'post'] })로
// 특정 게시글뿐 아니라 게시글 관련 전체 캐시를 무효화할 수 있다.
// 키 구조를 변경하면 캐시 무효화 로직도 함께 업데이트해야 한다.
export const communityKeys = {
  columns: (page: number) => ['community', 'columns', page] as const,
  column: (columnId: number) => ['community', 'column', columnId] as const,
  free: (page: number, category?: PostCategory) => ['community', 'free', page, category] as const,
  qna: (page: number) => ['community', 'qna', page] as const,
  notices: (page: number) => ['community', 'notices', page] as const,
  post: (postId: number) => ['community', 'post', postId] as const,
  comments: (postId: number) => ['community', 'comments', postId] as const,
};

export function useWhiskeyColumns(page = 0) {
  return useQuery({ queryKey: communityKeys.columns(page), queryFn: () => fetchWhiskeyColumns(page) });
}

// enabled: columnId != null 조건을 두는 이유:
// URL 파라미터가 없거나 파싱 전인 상태에서 undefined가 전달되면
// API 호출 시 /columns/undefined로 요청되어 404 오류가 발생하기 때문이다.
// columnId가 확정된 이후에만 쿼리를 실행한다.
export function useWhiskeyColumn(columnId: number | undefined) {
  return useQuery({
    queryKey: communityKeys.column(columnId!),
    queryFn: () => fetchWhiskeyColumn(columnId!),
    enabled: columnId != null,
  });
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

// usePost·useComments 모두 postId != null 조건을 확인하는 이유는 useWhiskeyColumn과 동일하다.
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

// 낙관적 업데이트(optimistic update)를 적용하지 않은 이유:
// 좋아요 상태는 서버의 실제 상태와 반드시 동기화되어야 한다.
// 낙관적 업데이트를 하면 실패 시 롤백 로직이 복잡해지고,
// 중복 클릭 방지(isLoading 체크)로도 UX가 충분히 자연스럽기 때문이다.
// onSuccess에서 invalidateQueries를 호출해 서버 상태를 다시 받아온다.
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

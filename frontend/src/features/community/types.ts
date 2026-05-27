export type PostType = 'NOTICE' | 'COLUMN' | 'QA' | 'FREE' | 'FEED';
export type PostCategory = 'F' | 'R' | 'L' | 'Q' | 'G' | 'B';

export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  F: '자유',
  R: '리뷰',
  L: '추천',
  Q: '질문',
  G: '잡담',
  B: '정보',
};

export interface PostSummaryResponse {
  id: number;
  authorId: number;
  postType: PostType;
  category: PostCategory;
  title: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface PostDetailDto {
  id: number;
  authorId: number;
  postType: PostType;
  category: PostCategory;
  title: string;
  context: string;
  likeCount: number;
  isLiked: boolean;
  isOwner: boolean;
  whiskeyIds: number[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentTreeResponse {
  id: number;
  userId: number | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentTreeResponse[];
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface PostCreateRequest {
  postType: PostType;
  category: PostCategory;
  title: string;
  context: string;
  whiskeyIds?: number[];
}

export interface PostUpdateRequest {
  title?: string;
  context?: string;
  category?: PostCategory;
  whiskeyIds?: number[];
}

export interface CommentCreateRequest {
  content: string;
  parentCommentId?: number | null;
}

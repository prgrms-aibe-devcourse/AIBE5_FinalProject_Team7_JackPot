// 커뮤니티 기능 전반에서 사용하는 타입 정의 — 유저 게시글(PostType)과 크롤링 칼럼(WhiskeyColumnResponse)을 분리 관리

// PostType: 유저가 작성하는 커뮤니티 게시글 유형.
// WhiskeyColumnResponse와 별도 도메인으로 분리한 이유는 두 데이터의 출처와 생명주기가 다르기 때문이다.
// 게시글은 주로 유저가 자유롭게 작성하지만, 칼럼은 관리자가 크롤링한데이터나, 출저가 분명한 글들을 위주로 다루기 때문이다.
export type PostType = 'NOTICE' | 'COLUMN' | 'QA' | 'FREE' | 'FEED';
export type PostCategory = 'F' | 'R' | 'L' | 'Q' | 'G' | 'B';

export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  F: '자유',
  R: '리뷰',
  L: '추천',
  Q: '질문',
  G: '정보',
  B: '입문',
};

export interface PostSummaryResponse {
  id: number;
  authorId: number;
  postType: PostType;
  category: PostCategory;
  title: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  thumbnailUrl?: string | null;
}

export interface PostDetailDto {
  id: number;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  postType: PostType;
  category: PostCategory;
  title: string;
  context: string;
  likeCount: number;
  viewCount: number;
  isLiked: boolean;
  isOwner: boolean;
  whiskeyIds: number[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// 댓글은 최대 2단계(댓글 → 대댓글)만 허용하는 구조.
// replies 배열 안에 또 replies가 있어도 UI는 2단계까지만 렌더링해야 한다.
// userId·nickname이 null인 경우는 탈퇴 또는 익명 처리된 계정을 의미한다.
export interface CommentTreeResponse {
  id: number;
  userId: number | null;       // 탈퇴 회원이면 null
  nickname: string | null;     // 탈퇴 또는 익명이면 null로 표시
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentTreeResponse[];
}

// WhiskeyColumnResponse: 외부 크롤러(블로그·유튜브)가 수집한 칼럼 데이터.
// PostSummaryResponse와 별도 타입으로 분리한 이유는 필드 구성이 완전히 다르고
// API 경로도 /community/columns(게시글)와 /columns(크롤링 칼럼)로 다르기 때문이다.
export interface WhiskeyColumnResponse {
  id: number;
  sourceType: 'BLOG' | 'YOUTUBE';
  title: string;
  url: string;
  thumbnailUrl: string | null;   // 썸네일을 제공하지 않는 소스도 있으므로 nullable
  description: string | null;   // 마크다운 본문 — 크롤러 파싱 실패 시 null
  whiskeyKeyword: string | null; // 연관 위스키 키워드 — 미태깅 시 null
  author: string | null;         // 저자 정보를 제공하지 않는 소스도 있으므로 nullable
  sourceName: string | null;     // 채널명 또는 블로그명 — 파싱 실패 시 null
  publishedAt: string | null;    // 원문 발행일 — 소스에 따라 없을 수 있어 nullable
  createdAt: string;
}

// SpringPage: Spring Data의 Page 응답 구조를 그대로 매핑.
// 주의: number 필드는 0-based 인덱스다 (첫 페이지 = 0).
// UI에서 페이지 번호를 표시할 때 +1 처리가 필요하다.
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // 현재 페이지 인덱스 (0부터 시작)
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

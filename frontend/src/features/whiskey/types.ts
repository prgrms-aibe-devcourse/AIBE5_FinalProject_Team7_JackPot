/** WH-02 WhiskeyDetailDto — API명세서_v2 */
export type TagCategory = 'nose' | 'taste' | 'finish';

export interface WhiskeyTagStat {
  tagId: number;
  name: string;
  category: TagCategory;
  imageUrl: string | null;
  count: number;
}

export interface TasteItem {
  key: 'body' | 'finish' | 'smoky' | 'spicy' | 'sweet';
  label: string;
  score: number;
}

export interface WhiskeyNoteSummary {
  noteCount: number;
  bodyScore: number;
  finishScore: number;
  smokyScore: number;
  spicyScore: number;
  sweetScore: number;
  tasteItems: TasteItem[];
}

export interface WhiskeyMyState {
  isPick: boolean;
  isWishlist: boolean;
  hasTastingNote: boolean;
  hasReview: boolean;
}

export interface WhiskeyDetail {
  id: number;
  name: string;
  type: string;
  imageUrl?: string | null;
  abv: number;
  ageYears: number;
  region: string;
  country: string;
  cask?: string | null;
  avgRating?: number;
  reviewCount?: number;
  description?: string | null;
  distillery?: string | null;
  noteSummary: WhiskeyNoteSummary | null;
  tastingTags: WhiskeyTagStat[];
  myState?: WhiskeyMyState;
}

/** WH-02-1 related-posts — PostSummaryResponse (backend camelCase) */
export interface RelatedColumnPost {
  id: number;
  authorId: number;
  postType: 'COLUMN' | 'NOTICE' | 'QA' | 'FREE' | 'FEED';
  category: string;
  title: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

/** GET /api/v1/whiskeys/{id}/reviews */
export interface WhiskeyReview {
  id: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  rating: number;
  publicText: string | null;
  hasAttachedNote: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 화면용 시음 요약 */
export type TastingAxisKey = TasteItem['key'];

export interface TastingAxisView {
  key: TastingAxisKey;
  label: string;
  score: number;
  tagLabels: string[];
}

export type TastingSummarySource = 'official' | 'userAvg';

/** WH-02 WhiskeyDetailDto — API명세서_v2 */
export type TagCategory = 'nose' | 'taste' | 'finish';

export interface WhiskeyTagStat {
  tagId: number;
  name: string;
  category: TagCategory;
  count: number;
}

export interface WhiskeyNoteScores {
  body_score: number | null;
  finish_score: number | null;
  smoky_score: number | null;
  spicy_score: number | null;
  sweet_score: number | null;
  memo?: string | null;
  noteCount?: number;
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
  etc_detail?: string | null;
  image_url?: string | null;
  abv: number;
  age_years: number;
  region: string;
  country: string;
  cask?: string | null;
  avgRating?: number;
  reviewCount?: number;
  description?: string | null;
  distillery?: string | null;
  officialNote: WhiskeyNoteScores | null;
  userAvgNote: WhiskeyNoteScores | null;
  tags: WhiskeyTagStat[];
  myState?: WhiskeyMyState;
}

/** WH-02-1 related-posts — Post[] 요약 */
export interface RelatedColumnPost {
  id: number;
  title: string;
  subtitle?: string | null;
  post_type: 'COLUMN' | 'NOTICE' | 'QA' | 'FREE' | 'FEED';
  like_count: number;
}

/** 화면용 N/P/F 시음 요약 (오피셜·사용자 평균 토글) */
export type TastingAxisKey = 'nose' | 'palate' | 'finish';

export interface TastingAxisView {
  key: TastingAxisKey;
  label: string;
  score: number;
  tagLabels: string[];
}

export type TastingSummarySource = 'official' | 'userAvg';

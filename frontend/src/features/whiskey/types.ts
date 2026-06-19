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

/**
 * 제품 소개·핵심 특징 — 백엔드 WhiskeyDescriptionDto (JSON 컬럼)
 * 각 맵은 라벨→설명문 순서쌍 (LinkedHashMap → JSON 객체 순서 보존)
 */
export interface WhiskeyDescription {
  introduction: Record<string, string>;
  feature: Record<string, string>;
}

/**
 * 공식 시음 노트 — 백엔드 WhiskeyOfficialNote (JSON 컬럼)
 * 항목명→설명 순서쌍 (LinkedHashMap → JSON 객체 순서 보존)
 */
export interface WhiskeyOfficialNote {
  note: Record<string, string>;
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
  nameEng?: string | null;
  type: string;
  brand?: string | null;
  imageUrl?: string | null;
  abv: number;
  ageYears: number;
  country: string;
  cask?: string | null;
  volume?: number | null;
  price?: number | null;
  costUrl?: string | null;
  costUrlSource?: string | null;
  avgRating?: number;
  reviewCount?: number;
  description?: WhiskeyDescription | null;
  note?: WhiskeyOfficialNote | null;
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
  whiskeyId?: number;
  whiskeyName?: string;
  whiskeyImageUrl?: string | null;
  nickname: string;
  profileImageUrl: string | null;
  rating: number;
  publicText: string | null;
  attachedNoteId: number | null;
  hasAttachedNote: boolean;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/v1/whiskeys/{id}/reviewstats — 리뷰 개수·평균 점수 */
export interface WhiskeyReviewStats {
  reviewCount: number;
  /** 리뷰 0건이면 null */
  avgRating: number | null;
}

/** 화면용 시음 요약 */
export type TastingAxisKey = TasteItem['key'];

export interface TastingAxisView {
  key: TastingAxisKey;
  label: string;
  score: number;
  tagLabels: string[];
}

export type TastingSummarySource = 'official' | 'userAvg' | 'myNote';

/**
 * WH-03 비슷한 위스키 추천 — 백엔드 → 프론트 응답 양식
 * 엔드포인트: GET /api/v1/whiskeys/{id}/similar
 * 응답: SimilarWhiskey[]  (래퍼 없이 raw 배열, 최대 3개 권장 / 현재 위스키 자신은 제외)
 *
 * 예시 응답:
 * [
 *   {
 *     "id": 2,
 *     "name": "Balvenie DoubleWood 12",
 *     "type": "single_malt",
 *     "imageUrl": null,
 *     "abv": 40,
 *     "region": "Speyside",
 *     "country": "Scotland",
 *     "ageYears": 12,
 *     "avgRating": 4.3,
 *     "score": 89,
 *     "reason": "꿀·바닐라 계열의 단맛과 오크 피니시가 비슷해요"
 *   }
 * ]
 */
export interface SimilarWhiskey {
  /** 위스키 ID — 상세 링크(/whiskey/{id})에 사용 */
  id: number;
  /** 위스키 이름 */
  name: string;
  /** 종류 코드: single_malt | blended | bourbon | rye … (화면에서 한글 라벨로 변환) */
  type: string;
  /** 대표 이미지 키/URL. 없으면 null → placeholder 표시 */
  imageUrl: string | null;
  /** 도수(%) */
  abv: number;
  /** 지역 (예: Speyside) */
  region: string;
  /** 국가 (예: Scotland) */
  country: string;
  /** 숙성 연수 (0이면 NAS) */
  ageYears: number;
  /** 평균 평점 (0~5 스케일) */
  avgRating: number;
  /** 유사도 점수 (0~100). 정렬·표시용, 선택적 의미 */
  score: number;
  /** 추천 이유 한 줄 (없으면 빈 문자열) */
  reason: string;
}

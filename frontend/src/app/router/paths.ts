/** svg/pages · 기능명세 v1.1 URL 기준 */
export const PATHS = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  /** OAuth provider callback — OAUTH_*_REDIRECT_URI와 동일 (예: /oauth/kakao/callback) */
  OAUTH_CALLBACK: '/oauth/:provider/callback',
  ONBOARDING: '/onboarding',
  SURVEY: '/survey',
  RECOMMEND: '/recommend',
  LOUNGE: '/lounge',
  SEARCH: '/search',
  WHISKEY_DETAIL: '/whiskey/:whiskeyId',
  WHISKEY_REVIEWS: '/whiskey/:whiskeyId/reviews',
  WRITE_REVIEW: '/whiskey/:whiskeyId/reviews/write',
  /** 12-cabinet-* (구 My Bar) */
  CABINET: '/cabinet',
  CABINET_FOLLOW: '/cabinet/follow',
  /** @deprecated `/cabinet` 로 리다이렉트 */
  MY_BAR: '/my-bar',
  MY_PAGE: '/me',
  USER_PROFILE: '/user/:userId',
  COMMUNITY: '/community',
  COMMUNITY_COLUMNS: '/community/columns',
  COMMUNITY_FREE: '/community/free',
  COMMUNITY_QNA: '/community/qna',
  COMMUNITY_NOTICES: '/community/notices',
  COMMUNITY_POST: '/community/posts/:postId',
  COMMUNITY_POST_NEW: '/community/posts/new',
  COMMUNITY_POST_EDIT: '/community/posts/:postId/edit',
  TASTING_NOTE: '/whiskey/:whiskeyId/note',
  NOTE_PICK: '/note/pick',
  TASTE_MATCH: '/discover/taste-match',
  ADMIN: '/admin',
  NOT_FOUND: '/error/404',
  SERVER_ERROR: '/error/500',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

export type CabinetSection = 'bar' | 'community';
export type CabinetTab = 'all' | 'wish' | 'pick' | 'note' | 'reviews';

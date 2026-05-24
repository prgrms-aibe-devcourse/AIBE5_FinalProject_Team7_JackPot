/** svg/pages · 기능명세 v1.1 URL 기준 */
export const PATHS = {
  LANDING: '/',
  LOGIN: '/login',
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
  TASTING_NOTE: '/whiskey/:whiskeyId/note',
  NOTE_PICK: '/note/pick',
  TASTE_MATCH: '/discover/taste-match',
  ADMIN: '/admin',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

export type CabinetSection = 'bar' | 'community';
export type CabinetTab = 'all' | 'wish' | 'pick' | 'note' | 'reviews';

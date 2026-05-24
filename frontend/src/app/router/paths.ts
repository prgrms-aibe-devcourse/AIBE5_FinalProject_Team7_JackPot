/** 화면목록(02) · 기능명세 URL 기준 — 팀 공통 상수 */
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

import type { RelatedColumnPost, WhiskeyDetail } from '../types';

export const MOCK_WHISKEY_DETAIL: WhiskeyDetail = {
  id: 1,
  name: 'Glenfiddich 12',
  type: 'single_malt',
  abv: 40,
  age_years: 12,
  region: 'Speyside',
  country: 'Scotland',
  cask: 'Ex-Bourbon',
  avgRating: 66.9,
  reviewCount: 128,
  description: '가벼운 배·사과 향, 바닐라·오크 마무리.',
  distillery: 'Glenfiddich',
  officialNote: {
    body_score: 64,
    finish_score: 62,
    smoky_score: 20,
    spicy_score: 35,
    sweet_score: 58,
    memo: 'Vanilla, caramel · Sweet, short',
  },
  userAvgNote: {
    body_score: 61,
    finish_score: 59,
    smoky_score: 28,
    spicy_score: 40,
    sweet_score: 55,
    memo: '사용자 평균 — 노트 첨부 리뷰 기반',
    noteCount: 128,
  },
  tags: [
    { tagId: 1, name: 'Old Wood', category: 'nose', count: 17 },
    { tagId: 2, name: 'Vanilla', category: 'nose', count: 15 },
    { tagId: 3, name: 'Solvent', category: 'nose', count: 14 },
    { tagId: 4, name: 'Honey', category: 'taste', count: 13 },
    { tagId: 5, name: '과일', category: 'taste', count: 12 },
    { tagId: 6, name: '오크', category: 'taste', count: 11 },
    { tagId: 7, name: '꽃', category: 'finish', count: 8 },
    { tagId: 8, name: '스모키', category: 'finish', count: 6 },
    { tagId: 9, name: 'New Wood', category: 'finish', count: 3 },
    { tagId: 10, name: '피트', category: 'finish', count: 3 },
    { tagId: 11, name: '토스트', category: 'taste', count: 3 },
    { tagId: 12, name: '고무', category: 'nose', count: 1 },
  ],
  myState: {
    isPick: false,
    isWishlist: false,
    hasTastingNote: false,
    hasReview: false,
  },
};

export const MOCK_RELATED_COLUMNS: RelatedColumnPost[] = [
  {
    id: 101,
    title: '싱글몰트 입문 가이드',
    subtitle: 'Glenfiddich vs Glenlivet',
    post_type: 'COLUMN',
    like_count: 86,
  },
  {
    id: 102,
    title: '스페이사이드 특징',
    subtitle: '부드러운 과일·꽃향의 고향',
    post_type: 'COLUMN',
    like_count: 54,
  },
];

export function getMockWhiskeyDetail(whiskeyId: string): WhiskeyDetail {
  const id = Number(whiskeyId);
  return {
    ...MOCK_WHISKEY_DETAIL,
    id: Number.isFinite(id) ? id : MOCK_WHISKEY_DETAIL.id,
  };
}

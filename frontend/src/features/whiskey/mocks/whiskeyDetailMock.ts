import type { RelatedColumnPost, WhiskeyDetail } from '../types';

export const MOCK_WHISKEY_DETAIL: WhiskeyDetail = {
  id: 1,
  name: 'Glenfiddich 12',
  type: 'single_malt',
  imageUrl: null,
  abv: 40,
  ageYears: 12,
  region: 'Speyside',
  country: 'Scotland',
  cask: 'Ex-Bourbon',
  avgRating: 66.9,
  reviewCount: 128,
  description: '가벼운 배·사과 향, 바닐라·오크 마무리.',
  distillery: 'Glenfiddich',
  noteSummary: {
    noteCount: 128,
    bodyScore: 61,
    finishScore: 59,
    smokyScore: 28,
    spicyScore: 40,
    sweetScore: 55,
    tasteItems: [
      { key: 'body', label: '바디', score: 61 },
      { key: 'finish', label: '피니시', score: 59 },
      { key: 'smoky', label: '스모키', score: 28 },
      { key: 'spicy', label: '스파이시', score: 40 },
      { key: 'sweet', label: '스위트', score: 55 },
    ],
  },
  tastingTags: [
    { tagId: 1, name: 'Old Wood', category: 'nose', imageUrl: '/vite.svg', count: 17 },
    { tagId: 2, name: 'Vanilla', category: 'nose', imageUrl: '/vite.svg', count: 15 },
    { tagId: 3, name: 'Solvent', category: 'nose', imageUrl: '/vite.svg', count: 14 },
    { tagId: 4, name: 'Honey', category: 'taste', imageUrl: '/vite.svg', count: 13 },
    { tagId: 5, name: '과일', category: 'taste', imageUrl: '/vite.svg', count: 12 },
    { tagId: 6, name: '오크', category: 'taste', imageUrl: '/vite.svg', count: 11 },
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

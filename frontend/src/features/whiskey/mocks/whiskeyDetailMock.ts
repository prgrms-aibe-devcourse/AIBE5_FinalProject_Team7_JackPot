import type { PageResponse } from '@/shared/api/types/common';
import type { RelatedColumnPost, WhiskeyDetail, WhiskeyReview } from '../types';

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
    bodyScore: 6.1,
    finishScore: 5.9,
    smokyScore: 2.8,
    spicyScore: 4,
    sweetScore: 5.5,
    tasteItems: [
      { key: 'body', label: '바디', score: 6.1 },
      { key: 'finish', label: '피니시', score: 5.9 },
      { key: 'smoky', label: '스모키', score: 2.8 },
      { key: 'spicy', label: '스파이시', score: 4 },
      { key: 'sweet', label: '단맛', score: 5.5 },
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
    authorId: 1,
    postType: 'COLUMN',
    category: 'F',
    title: '싱글몰트 입문 가이드',
    likeCount: 86,
    commentCount: 12,
    createdAt: '2025-01-01T00:00:00',
  },
  {
    id: 102,
    authorId: 2,
    postType: 'COLUMN',
    category: 'F',
    title: '스페이사이드 특징',
    likeCount: 54,
    commentCount: 7,
    createdAt: '2025-01-02T00:00:00',
  },
];

export const MOCK_WHISKEY_REVIEWS: PageResponse<WhiskeyReview> = {
  content: [
    {
      id: 1,
      userId: 1,
      nickname: '민구',
      profileImageUrl: null,
      rating: 4.5,
      publicText: '부드럽고 달콤한 과실향이 좋아요. 피니시도 꽤 길게 남습니다.',
      hasAttachedNote: false,
      createdAt: '2026-05-27T13:00:00',
      updatedAt: '2026-05-27T13:00:00',
    },
    {
      id: 2,
      userId: 2,
      nickname: 'WhiskyNote',
      profileImageUrl: null,
      rating: 4.0,
      publicText: '향은 풍부한데 생각보다 가볍게 넘어갑니다. 천천히 마시기 좋은 느낌이에요.',
      hasAttachedNote: false,
      createdAt: '2026-05-27T13:05:00',
      updatedAt: '2026-05-27T13:05:00',
    },
  ],
  page: 0,
  size: 5,
  totalElements: 2,
  totalPages: 1,
};

export function getMockWhiskeyDetail(whiskeyId: string): WhiskeyDetail {
  const id = Number(whiskeyId);
  return {
    ...MOCK_WHISKEY_DETAIL,
    id: Number.isFinite(id) ? id : MOCK_WHISKEY_DETAIL.id,
  };
}

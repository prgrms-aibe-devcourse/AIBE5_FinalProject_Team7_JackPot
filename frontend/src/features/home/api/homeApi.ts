import { apiClient } from '@/shared/api/client';

export interface LoungePost {
  postId: number;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  title: string;
  context: string;
  createdAt: string;
  postType: 'NOTICE' | 'COLUMN' | 'QA' | 'FREE' | 'FEED';
  category: 'F' | 'R' | 'L' | 'Q' | 'G' | 'B';
  likeCount: number;
  viewCount: number;
  commentCount: number;
  whiskeyNames: string[];
}

export interface LoungeTrendingWhiskey {
  whiskeyId: number;
  whiskeyName: string;
  mentionCount: number;
}

export interface LoungeSuggestedUser {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface LoungeToday {
  newPostCount: number;
  topPost: LoungePost | null;
  topWhiskeyName: string | null;
}

/**
 * 당신에게 추천하는 위스키 — 백엔드 WhiskeyRecommendationResponse
 * 주의: 백엔드 필드명이 `adv`(도수 ABV의 오타)이지만 JSON 키가 그대로 `adv`라 맞춰 둔다.
 */
export interface LoungeRecommendedWhiskey {
  id: number;
  name: string;
  type: string;
  imageUrl: string | null;
  adv: number | null;
  country: string;
  ageYears: number;
  avgRating: number;
  score: number;
  reason: string;
}

export type LoungeFeedTab = 'following' | 'popular' | 'latest';

const FEED_PATH: Record<LoungeFeedTab, string> = {
  following: '/lounge/feed',
  popular: '/lounge/popular',
  latest: '/lounge/latest',
};

export const homeApi = {
  getLoungeFeed: async (page = 0, size = 20): Promise<LoungePost[]> => {
    const res = await apiClient.get<LoungePost[]>('/lounge/feed', {
      params: { page, size },
    });
    return res.data;
  },
  getFeedByTab: async (tab: LoungeFeedTab, page = 0, size = 20): Promise<LoungePost[]> => {
    const res = await apiClient.get<LoungePost[]>(FEED_PATH[tab], {
      params: { page, size },
    });
    return res.data;
  },
  getTrendingWhiskeys: async (limit = 5): Promise<LoungeTrendingWhiskey[]> => {
    const res = await apiClient.get<LoungeTrendingWhiskey[]>('/lounge/trending-whiskeys', {
      params: { limit },
    });
    return res.data;
  },
  getSuggestedUsers: async (limit = 5): Promise<LoungeSuggestedUser[]> => {
    const res = await apiClient.get<LoungeSuggestedUser[]>('/lounge/suggested-users', {
      params: { limit },
    });
    return res.data;
  },
  getToday: async (): Promise<LoungeToday> => {
    const res = await apiClient.get<LoungeToday>('/lounge/today');
    return res.data;
  },
  // 당신에게 추천하는 위스키 (로그인 유저 맞춤 추천 목록)
  getRecommendedWhiskeys: async (): Promise<LoungeRecommendedWhiskey[]> => {
    const res = await apiClient.get<LoungeRecommendedWhiskey[]>('/lounge/recommend-whiskey');
    return res.data;
  },
};

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
};

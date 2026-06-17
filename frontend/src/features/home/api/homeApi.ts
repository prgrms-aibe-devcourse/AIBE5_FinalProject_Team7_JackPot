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

export const homeApi = {
  getLoungeFeed: async (page = 0, size = 20): Promise<LoungePost[]> => {
    const res = await apiClient.get<LoungePost[]>('/lounge/feed', {
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
};

import { apiClient } from '@/shared/api/client';

export interface LoungePost {
  postId: number;
  authorId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  title: string;
  context: string;
  createdAt: string;
}

export const homeApi = {
  getLoungeFeed: async (page = 0, size = 20): Promise<LoungePost[]> => {
    const res = await apiClient.get<LoungePost[]>('/lounge/feed', {
      params: { page, size },
    });
    return res.data;
  },
};

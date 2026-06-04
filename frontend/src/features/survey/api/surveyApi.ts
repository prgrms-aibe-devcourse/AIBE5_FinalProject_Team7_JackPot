import { apiClient } from '@/shared/api/client';

export interface SurveyApiRequest {
  sweetChoice: number; // 1-5
  bodyChoice: number;
  smokyChoice: number;
  spicyChoice: number;
  finishChoice: number;
  noseTags: number[]; // tag IDs
  tasteTags: number[];
}

export interface TagInfo {
  id: number;
  name: string;
  imageUrl: string;
}

export interface FlavorProfile {
  sweetScore: number; // 0-100
  bodyScore: number;
  smokyScore: number;
  spicyScore: number;
  finishScore: number;
  noseTags: TagInfo[];
  tasteTags: TagInfo[];
}

export interface WhiskeyRecommendation {
  rank: number;
  whiskeyId: number;
  whiskeyName: string;
  imageUrl: string;
  score: number;
  reason: string;
}

export interface SurveyResult {
  profile: FlavorProfile;
  userType: string;
  userTypeDescription: string;
  recommendations: WhiskeyRecommendation[];
}

export const surveyApi = {
  submit: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResult>('/taste/survey', payload);
    return data;
  },

  save: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResult>('/taste/survey/save', payload);
    return data;
  },

  getMyProfile: async (): Promise<SurveyResult> => {
    const { data } = await apiClient.get<SurveyResult>('/taste/survey/me');
    return data;
  },
};

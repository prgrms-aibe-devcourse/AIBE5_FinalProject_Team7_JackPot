import { apiClient } from '@/shared/api/client';

export interface SurveyApiRequest {
  sweetChoice: number; // 1-5
  bodyChoice: number;
  smokyChoice: number;
  spicyChoice: number;
  finishChoice: number;
  // 입문자: 태그 ID 목록
  noseTags?: number[];
  tasteTags?: number[];
  // 애호가: 태그 ID → 강도(1=좋아함, 2=매우 좋아함)
  noseTagWeights?: Record<number, 1 | 2>;
  tasteTagWeights?: Record<number, 1 | 2>;
  styleTags?: string[];
  explorationLevel?: 1 | 2 | 3;
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

/**
 * 추천 위스키 1건 — 백엔드 WhiskeyRecommendationResponse.
 * detail 페이지 '비슷한 위스키'(SimilarWhiskey)와 동일한 DTO.
 * rank 필드 없음 → 배열 순서가 곧 순위.
 */
export interface WhiskeyRecommendation {
  id: number;
  name: string;
  type: string;
  imageUrl: string | null;
  abv: number;
  region: string;
  country: string;
  ageYears: number;
  avgRating: number;
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

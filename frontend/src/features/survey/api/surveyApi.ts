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
  // 애호가 Q9 — 선호 숙성 연수 범위(소프트 필터). null이면 제한 없음
  ageMin?: number | null;
  ageMax?: number | null;
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

/**
 * 백엔드 원본 응답 — 풍미 프로필이 `summary` 키로 옴.
 * 프론트는 `profile`로 통일해서 쓰므로 normalizeSurveyResult로 매핑한다.
 */
interface SurveyResultRaw {
  summary: FlavorProfile;
  userType: string;
  userTypeDescription: string;
  recommendations: WhiskeyRecommendation[] | null;
}

export function normalizeSurveyResult(raw: SurveyResultRaw): SurveyResult {
  return {
    profile: raw.summary,
    userType: raw.userType,
    userTypeDescription: raw.userTypeDescription,
    recommendations: raw.recommendations ?? [],
  };
}

export const surveyApi = {
  submit: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResultRaw>('/taste/survey', payload);
    return normalizeSurveyResult(data);
  },

  save: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResultRaw>('/taste/survey/save', payload);
    return normalizeSurveyResult(data);
  },

  getMyProfile: async (): Promise<SurveyResult> => {
    const { data } = await apiClient.get<SurveyResultRaw>('/taste/survey/me');
    return normalizeSurveyResult(data);
  },
};

import { apiClient } from '@/shared/api/client';

/**
 * Survey 도메인 (SUR-02 / SUR-03)
 * - 취향 점수 5종(Sweet/Body/Smoky/Spicy/Finish) + 선호 향/맛 태그 제출
 * TODO: WhiskeyNote_API명세서_v2 확정 시 엔드포인트 검증
 */
export interface TasteSurveyPayload {
  sweetScore: number;
  bodyScore: number;
  smokyScore: number;
  spicyScore: number;
  finishScore: number;
  nose_tags: string[];
  taste_tags: string[];
}

export const surveyApi = {
  client: apiClient,

  // SUR-02/03: 취향 설문 제출
  submitTasteSurvey: async (payload: TasteSurveyPayload): Promise<void> => {
    await apiClient.post('/survey/taste', payload);
  },
};

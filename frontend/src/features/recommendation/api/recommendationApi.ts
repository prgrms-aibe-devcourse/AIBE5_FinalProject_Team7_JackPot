import { apiClient } from '@/shared/api/client';

/**
 * Recommendation 도메인 (REC-01 / REC-02)
 * - 설문 취향 점수(5종) + 향/맛 태그를 기반으로 한 추천 결과
 * TODO: WhiskeyNote_API명세서_v2 확정 시 서버 추천(REC-01) 연동.
 *       현재는 SurveyPage → navigate state 로 전달된 결과를 로컬 엔진으로 가공.
 */

/** 취향 점수 (각 1~9) */
export interface TasteScores {
  sweetScore: number;
  bodyScore: number;
  smokyScore: number;
  spicyScore: number;
  finishScore: number;
}

/** 설문 제출 결과(점수 + 선택 태그) — 결과 페이지로 전달되는 형태 */
export interface TasteResult extends TasteScores {
  nose_tags: string[];
  taste_tags: string[];
}

/** 추천 위스키 1건 */
export interface RecommendedWhiskey {
  id: number;
  name: string;
  reason: string;
  tags: string[];
}

export const recommendationApi = {
  client: apiClient,

  // REC-01: 취향 기반 추천 (서버 연동 예정)
  getTasteRecommendation: async (result: TasteResult): Promise<RecommendedWhiskey[]> => {
    const res = await apiClient.post('/recommendations/taste', result);
    return res.data.data as RecommendedWhiskey[];
  },
};

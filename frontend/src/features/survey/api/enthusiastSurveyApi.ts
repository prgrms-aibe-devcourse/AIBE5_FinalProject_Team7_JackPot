import { apiClient } from '@/shared/api/client';
import type { SurveyResult } from './surveyApi';

export interface EnthusiastSurveyRequest {
  bodyChoice: number;        // 1-5
  finishChoice: number;
  smokyChoice: number;
  spicyChoice: number;
  sweetChoice: number;
  styleTags: string[];                   // ["single_malt", "bourbon"]
  noseTags: Record<number, 1 | 2>;       // {tagId: intensity}
  tasteTags: Record<number, 1 | 2>;
  explorationLevel: 1 | 2 | 3;          // 1=보수형 2=균형형 3=탐험형
}

export const enthusiastSurveyApi = {
  submit: async (payload: EnthusiastSurveyRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResult>('/taste/survey/enthusiast', payload);
    return data;
  },

  save: async (payload: EnthusiastSurveyRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResult>('/taste/survey/enthusiast/save', payload);
    return data;
  },
};

import { apiClient } from '@/shared/api/client';
import type { SurveyApiRequest, SurveyResult } from './surveyApi';

export const enthusiastSurveyApi = {
  submit: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResult>('/taste/survey/enthusiast', payload);
    return data;
  },

  save: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post<SurveyResult>('/taste/survey/enthusiast/save', payload);
    return data;
  },
};

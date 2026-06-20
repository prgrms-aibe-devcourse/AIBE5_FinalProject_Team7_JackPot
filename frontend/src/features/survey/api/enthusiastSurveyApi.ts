import { apiClient } from '@/shared/api/client';
import { normalizeSurveyResult, type SurveyApiRequest, type SurveyResult } from './surveyApi';

export const enthusiastSurveyApi = {
  submit: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post('/taste/survey/enthusiast', payload);
    return normalizeSurveyResult(data);
  },

  save: async (payload: SurveyApiRequest): Promise<SurveyResult> => {
    const { data } = await apiClient.post('/taste/survey/enthusiast/save', payload);
    return normalizeSurveyResult(data);
  },
};

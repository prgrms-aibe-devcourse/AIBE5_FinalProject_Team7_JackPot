import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.SURVEY,
    Component: lazy(() => import('./pages/SurveyPage')),
    layout: 'guest',
    meta: {
      screenId: '04-survey',
      title: 'Survey · 취향 설문',
      phase: 'MVP',
      apiIds: ['SUR-02', 'SUR-03'],
    },
  },
];

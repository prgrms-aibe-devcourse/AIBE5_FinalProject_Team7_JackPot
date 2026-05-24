import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.USER_PROFILE,
    Component: lazy(() => import('./pages/UserProfilePage')),
    layout: 'app',
    meta: {
      screenId: '13b-cabinet-other-bar',
      title: '타인 캐비넷',
      phase: 'MVP',
      apiIds: ['CAB-01', 'FOL-01'],
    },
  },
];

import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.MY_PAGE,
    Component: lazy(() => import('./pages/MyPage')),
    layout: 'app',
    meta: {
      screenId: '13-mypage',
      title: 'My Page',
      phase: 'MVP',
      apiIds: ['USER-01', 'SET-01'],
    },
  },
];

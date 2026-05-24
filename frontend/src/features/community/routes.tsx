import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.COMMUNITY,
    Component: lazy(() => import('./pages/CommunityPage')),
    layout: 'app',
    meta: {
      screenId: '14-community',
      title: 'Community · 커뮤니티',
      phase: 'P2',
      apiIds: ['POST-01', 'FEED-01'],
    },
  },
];

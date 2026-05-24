import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.CABINET,
    Component: lazy(() => import('./pages/CabinetPage')),
    layout: 'app',
    meta: {
      screenId: '12-cabinet-me-bar',
      title: '캐비넷 · 본인 Bar',
      phase: 'MVP',
      apiIds: ['PICK-01', 'WISH-01', 'CAB-01'],
    },
  },
  {
    path: PATHS.CABINET_FOLLOW,
    Component: lazy(() => import('./pages/CabinetFollowPage')),
    layout: 'app',
    meta: {
      screenId: '12-cabinet-follow',
      title: '캐비넷 · 팔로우',
      phase: 'MVP',
      apiIds: ['FOL-01'],
    },
  },
  {
    path: PATHS.MY_BAR,
    Component: lazy(() => import('./pages/MyBarRedirect')),
    layout: 'app',
    meta: {
      screenId: '12-my-pick',
      title: 'My Bar redirect',
      phase: 'MVP',
    },
  },
];

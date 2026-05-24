import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.MY_BAR,
    Component: lazy(() => import('./pages/MyBarPage')),
    layout: 'app',
    meta: {
      screenId: '12-my-pick',
      title: 'My Bar · Pick/Wish/Note/Reviews',
      phase: 'MVP',
      apiIds: ['PICK-01', 'WISH-01'],
    },
  },
];

import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.ONBOARDING,
    Component: lazy(() => import('./pages/OnboardingPage')),
    layout: 'guest',
    meta: {
      screenId: '03-onboarding',
      title: 'Onboarding · 레벨',
      phase: 'MVP',
      apiIds: ['SUR-01'],
    },
  },
];

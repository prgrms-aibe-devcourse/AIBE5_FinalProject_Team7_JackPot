import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.LOGIN,
    Component: lazy(() => import('./pages/LoginPage')),
    layout: 'guest',
    meta: {
      screenId: '02-login',
      title: 'Login',
      phase: 'MVP',
      apiIds: ['AUTH-02'],
    },
  },
  {
    path: PATHS.REGISTER,
    Component: lazy(() => import('./pages/RegisterPage')),
    layout: 'guest',
    meta: {
      screenId: '02-register',
      title: 'Sign up',
      phase: 'MVP',
      apiIds: ['AUTH-01'],
    },
  },
];

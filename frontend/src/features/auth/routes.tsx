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
  // AUTH-03: /oauth/:provider/callback — OAUTH_*_REDIRECT_URI와 동일
  {
    path: PATHS.OAUTH_CALLBACK,
    Component: lazy(() => import('./pages/OauthCallbackPage')),
    layout: 'guest',
    meta: {
      screenId: '02-oauth-callback',
      title: 'OAuth callback',
      phase: 'MVP',
      apiIds: ['AUTH-03'],
    },
  },
];

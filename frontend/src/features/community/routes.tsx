import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.COMMUNITY,
    Component: lazy(() => import('./pages/CommunityPage')),
    layout: 'app',
    meta: { screenId: '14-community', title: 'Community · 커뮤니티', phase: 'P2' },
  },
  {
    path: PATHS.COMMUNITY_COLUMNS,
    Component: lazy(() => import('./pages/ColumnsPage')),
    layout: 'app',
    meta: { screenId: '14-community-columns', title: '칼럼', phase: 'P2' },
  },
  {
    path: PATHS.COMMUNITY_FREE,
    Component: lazy(() => import('./pages/FreeBoardPage')),
    layout: 'app',
    meta: { screenId: '14-community-free', title: '자유게시판', phase: 'P2' },
  },
  {
    path: PATHS.COMMUNITY_QNA,
    Component: lazy(() => import('./pages/QnaPage')),
    layout: 'app',
    meta: { screenId: '14-community-qna', title: 'Q&A', phase: 'P2' },
  },
  {
    path: PATHS.COMMUNITY_POST,
    Component: lazy(() => import('./pages/PostDetailPage')),
    layout: 'app',
    meta: { screenId: '14-community-post', title: '게시글 상세', phase: 'P2' },
  },
];

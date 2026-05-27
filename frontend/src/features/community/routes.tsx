import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.COMMUNITY,
    Component: lazy(() => import('./pages/CommunityPage')),
    layout: 'app',
    meta: { screenId: '14-community', title: 'Community · 커뮤니티', phase: 'P2', apiIds: ['POST-01'] },
  },
  {
    path: PATHS.COMMUNITY_COLUMNS,
    Component: lazy(() => import('./pages/ColumnsPage')),
    layout: 'app',
    meta: { screenId: '14-community-columns', title: '칼럼', phase: 'P2', apiIds: ['CMT-LIST-01'] },
  },
  {
    path: PATHS.COMMUNITY_FREE,
    Component: lazy(() => import('./pages/FreeBoardPage')),
    layout: 'app',
    meta: { screenId: '14-community-free', title: '자유게시판', phase: 'P2', apiIds: ['FREE-LIST-01'] },
  },
  {
    path: PATHS.COMMUNITY_NOTICES,
    Component: lazy(() => import('./pages/NoticePage')),
    layout: 'app',
    meta: { screenId: '14-community-notices', title: '공지·FAQ', phase: 'P2', apiIds: ['NOTICE-LIST-01'] },
  },
  {
    path: PATHS.COMMUNITY_POST_NEW,
    Component: lazy(() => import('./pages/PostFormPage')),
    layout: 'app',
    meta: { screenId: '14-community-post-new', title: '글쓰기', phase: 'P2', apiIds: ['POST-CREATE-01'] },
  },
  {
    path: PATHS.COMMUNITY_POST,
    Component: lazy(() => import('./pages/PostDetailPage')),
    layout: 'app',
    meta: { screenId: '14-community-post-detail', title: '게시글', phase: 'P2', apiIds: ['POST-DETAIL-01'] },
  },
];

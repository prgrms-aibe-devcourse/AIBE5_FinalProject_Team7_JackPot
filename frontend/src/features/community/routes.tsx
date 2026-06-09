// 커뮤니티 피처의 라우트 정의 — lazy import로 초기 번들 크기를 줄이고 페이지별 코드 분할 적용
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
    // 글쓰기는 단일 컴포넌트로 ?type= 쿼리 파라미터를 통해 게시판 유형을 구분
    path: PATHS.COMMUNITY_POST_NEW,
    Component: lazy(() => import('./pages/PostFormPage')),
    layout: 'app',
    meta: { screenId: '14-community-post-new', title: '글쓰기', phase: 'P2', apiIds: ['POST-CREATE-01'] },
  },
  {
    path: PATHS.COMMUNITY_COLUMN,
    Component: lazy(() => import('./pages/ColumnDetailPage')),
    layout: 'app',
    meta: { screenId: '14-community-column-detail', title: '칼럼 상세', phase: 'P2', apiIds: [] },
  },
  {
    // 칼럼·자유게시판 등 모든 게시글 상세를 하나의 라우트로 처리
    path: PATHS.COMMUNITY_POST,
    Component: lazy(() => import('./pages/PostDetailPage')),
    layout: 'app',
    meta: { screenId: '14-community-post-detail', title: '게시글', phase: 'P2', apiIds: ['POST-DETAIL-01'] },
  },
  {
    // 수정 라우트는 상세 라우트보다 구체적인 경로(:postId/edit)이므로 순서상 뒤에 와도 정상 매칭됨
    path: PATHS.COMMUNITY_POST_EDIT,
    Component: lazy(() => import('./pages/PostEditPage')),
    layout: 'app',
    meta: { screenId: '14-community-post-edit', title: '게시글 수정', phase: 'P2', apiIds: ['POST-UPDATE-01'] },
  },
];

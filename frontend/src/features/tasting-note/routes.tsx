import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.TASTING_NOTE,
    Component: lazy(() => import('./pages/TastingNotePage')),
    layout: 'app',
    meta: {
      screenId: '15-tasting-note',
      title: 'Tasting Note · 시음 노트',
      phase: 'P2',
      apiIds: ['NOTE-01', 'NOTE-03'],
    },
  },
  {
    path: PATHS.NOTE_PICK,
    Component: lazy(() => import('./pages/NotePickPage')),
    layout: 'app',
    meta: {
      screenId: '15b-note-pick',
      title: 'Note Pick · 노트 술 선택',
      phase: 'P2',
      apiIds: ['NOTE-04'],
    },
  },
];

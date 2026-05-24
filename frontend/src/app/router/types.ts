import type { ComponentType, LazyExoticComponent } from 'react';

export type RouteLayout = 'guest' | 'app';

export interface RouteMeta {
  screenId: string;
  title: string;
  phase: 'MVP' | 'P2' | 'MVP+';
  apiIds?: string[];
}

export interface FeatureRoute {
  path: string;
  Component: LazyExoticComponent<ComponentType<object>>;
  layout: RouteLayout;
  meta: RouteMeta;
}

import type { FeatureRoute } from './types';

type RouteModule = { routes: FeatureRoute[] };

// features 하위 routes.tsx 파일을 자동 수집 (feature 추가 시 중앙 registry 수정 불필요)
export function collectFeatureRoutes(): FeatureRoute[] {
  const modules = import.meta.glob<RouteModule>('../../features/*/routes.tsx', {
    eager: true,
  });

  return Object.values(modules).flatMap((module) => module.routes);
}

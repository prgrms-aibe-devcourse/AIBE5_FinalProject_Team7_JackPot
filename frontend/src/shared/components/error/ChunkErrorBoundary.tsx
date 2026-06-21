import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { PageLoader } from '@/shared/components/ui/PageLoader';

function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    error.message.includes('Failed to fetch dynamically imported module')
  );
}

const RELOAD_KEY = 'chunk_reload_attempted';

export function ChunkErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (!isChunkLoadError(error)) return;

    if (!sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1');
      window.location.reload();
    }
  }, [error]);

  if (isChunkLoadError(error)) {
    return <PageLoader label="페이지를 다시 불러오는 중..." />;
  }

  window.location.href = '/error/500';
  return null;
}

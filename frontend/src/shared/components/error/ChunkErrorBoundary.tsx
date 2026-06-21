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

  // ⚠️ [임시 디버그] 실제 렌더 에러를 확인하려고 redirect를 잠시 끔.
  // 원인 찾으면 아래 두 줄(console/pre)을 지우고, 그 밑 주석된 원래 코드를 복구할 것.
  console.error('[RENDER ERROR DEBUG]', error);
  return (
    <pre style={{ padding: 20, whiteSpace: 'pre-wrap', color: 'crimson', fontSize: 13 }}>
      {String((error as Error)?.stack ?? (error as Error)?.message ?? error)}
    </pre>
  );

  // window.location.href = '/error/500';
  // return null;
}

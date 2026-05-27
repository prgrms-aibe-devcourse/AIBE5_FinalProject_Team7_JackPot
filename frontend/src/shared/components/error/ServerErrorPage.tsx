import { ErrorPage } from './ErrorPage';

/**
 * 500 페이지
 * - API 서버 오류(5xx) 발생 시 표시
 * - axios interceptor에서 /error/500 으로 navigate 시 표시
 */
export default function ServerErrorPage() {
  return (
    <ErrorPage
      code={500}
      title="서버 오류가 발생했어요"
      message="잠시 후 다시 시도해 주세요."
    />
  );
}

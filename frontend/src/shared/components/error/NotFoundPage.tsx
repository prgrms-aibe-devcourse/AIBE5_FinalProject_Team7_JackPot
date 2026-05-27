import { ErrorPage } from './ErrorPage';

/**
 * 404 페이지
 * - 존재하지 않는 경로 접근 시 표시
 * - 라우터 path='*' 에 연결
 */
export default function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="페이지를 찾을 수 없어요"
      message="주소가 잘못됐거나 삭제된 페이지입니다."
    />
  );
}

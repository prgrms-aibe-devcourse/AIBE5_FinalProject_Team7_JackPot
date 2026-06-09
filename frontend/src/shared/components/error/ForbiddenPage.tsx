import { ErrorPage } from './ErrorPage';

export default function ForbiddenPage() {
  return (
    <ErrorPage
      code={403}
      title="이 위스키는 VIP 전용입니다"
      message="접근 권한이 없습니다. 다른 테이블을 이용해 주세요."
    />
  );
}

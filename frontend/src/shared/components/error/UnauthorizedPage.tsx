import { ErrorPage } from './ErrorPage';

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      code={401}
      title="이 바에 입장하려면 신분증이 필요합니다"
      message="로그인 후 이용해 주세요. 위스키는 성인만 즐길 수 있습니다."
    />
  );
}

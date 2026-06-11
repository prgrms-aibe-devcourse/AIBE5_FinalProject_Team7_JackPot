import { ErrorPage } from './ErrorPage';

export default function BannedUserPage() {
  return (
    <ErrorPage
      code={403}
      title="이용이 제한된 계정입니다"
      message="해당 사용자는 운영 정책에 따라 이용이 제한된 계정입니다."
    />
  );
}

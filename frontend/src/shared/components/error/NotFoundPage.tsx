import { ErrorPage } from './ErrorPage';

export default function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="이 페이지는 위스키처럼 증발해버렸습니다"
      message="주소가 잘못됐거나, 너무 많이 마셔서 길을 잃은 것 같아요."
    />
  );
}

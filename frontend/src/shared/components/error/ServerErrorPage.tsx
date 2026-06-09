import { ErrorPage } from './ErrorPage';

export default function ServerErrorPage() {
  return (
    <ErrorPage
      code={500}
      title="너무 많은 노트를 분석한 나머지 취해버렸습니다"
      message={<>Whiskey Note가 잠시 쉬어가고 있어요.<br />물 한 잔 마시고 다시 시도해 주세요.</>}
    />
  );
}

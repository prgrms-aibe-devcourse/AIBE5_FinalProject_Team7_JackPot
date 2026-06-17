import { ErrorPage } from './ErrorPage';

export default function BannedUserPage() {
  return (
    <ErrorPage
      code={403}
      title="잠시 휴식 중인 유저예요"
      message="위스키를 너무 많이 마셔서 그런지, 잠시 휴식을 취하고 있는 유저예요. 다음에 다시 방문해 주세요 🥃"
    />
  );
}

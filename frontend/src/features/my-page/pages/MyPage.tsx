import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function MyPage() {
  return (
    <PagePlaceholder
      screenId="13-mypage"
      title="My Page"
      phase="MVP"
      apiIds={['USER-01', 'SET-01']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

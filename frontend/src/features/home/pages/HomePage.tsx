import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function HomePage() {
  return (
    <PagePlaceholder
      screenId="06-home"
      title="Home · 라운지"
      phase="MVP"
      apiIds={['FEED-01', 'REC-03']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

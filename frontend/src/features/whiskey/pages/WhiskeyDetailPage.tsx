import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function WhiskeyDetailPage() {
  return (
    <PagePlaceholder
      screenId="09-detail"
      title="Whiskey Detail · 상세"
      phase="MVP"
      apiIds={['WH-02', 'TAG-01', 'NOTE-02']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

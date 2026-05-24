import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function TastingNotePage() {
  return (
    <PagePlaceholder
      screenId="15-tasting-note"
      title="Tasting Note · 시음 노트"
      phase="P2"
      apiIds={['NOTE-01', 'NOTE-03']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

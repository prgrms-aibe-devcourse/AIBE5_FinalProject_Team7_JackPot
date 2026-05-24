import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function AdminPage() {
  return (
    <PagePlaceholder
      screenId="admin"
      title="Admin · 운영"
      phase="P2"
      apiIds={['ADM-01']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

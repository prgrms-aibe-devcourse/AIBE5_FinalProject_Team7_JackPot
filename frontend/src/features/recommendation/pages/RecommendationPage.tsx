import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function RecommendationPage() {
  return (
    <PagePlaceholder
      screenId="05-recommendation"
      title="Recommendation · 추천"
      phase="MVP"
      apiIds={['REC-01', 'REC-02']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

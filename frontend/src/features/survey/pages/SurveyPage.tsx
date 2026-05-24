import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function SurveyPage() {
  return (
    <PagePlaceholder
      screenId="04-survey"
      title="Survey · 취향 설문"
      phase="MVP"
      apiIds={['SUR-02', 'SUR-03']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

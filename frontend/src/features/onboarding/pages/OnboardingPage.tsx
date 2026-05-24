import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function OnboardingPage() {
  return (
    <PagePlaceholder
      screenId="03-onboarding"
      title="Onboarding · 레벨"
      phase="MVP"
      apiIds={['SUR-01']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

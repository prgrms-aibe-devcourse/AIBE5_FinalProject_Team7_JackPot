import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function LoginPage() {
  return (
    <PagePlaceholder
      screenId="02-login"
      title="Login / Sign up"
      phase="MVP"
      apiIds={['AUTH-01', 'AUTH-02']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

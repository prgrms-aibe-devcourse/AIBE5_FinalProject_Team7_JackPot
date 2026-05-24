import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function UserProfilePage() {
  return (
    <PagePlaceholder
      screenId="13b-user-profile"
      title="User Profile · 타인 캐비넷"
      phase="MVP"
      apiIds={['CAB-01', 'FOL-01']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

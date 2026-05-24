import { PagePlaceholder } from '@/shared/components/ui/PagePlaceholder';

export default function MyBarPage() {
  return (
    <PagePlaceholder
      screenId="12-my-pick"
      title="My Bar · Pick/Wish/Note/Reviews"
      phase="MVP"
      apiIds={['PICK-01', 'WISH-01']}
      description="와이어프레임 · 기능명세 기준 플레이스홀더 — 이 feature 폴더에서 UI/API 연동 구현"
    />
  );
}

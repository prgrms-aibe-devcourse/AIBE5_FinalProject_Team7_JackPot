import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

export default function TasteMatchPage() {
  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>Taste Match</strong></p>
      <h1 className="wf-title">취향 비슷한 유저</h1>
      {[
        { name: 'GlassOfWhisky', match: '94%' },
        { name: 'peat_lover', match: '89%' },
      ].map((u) => (
        <div key={u.name} className="wf-box wf-panel wf-taste-match-card">
          <div>
            <strong>{u.name}</strong>
            <p className="wf-text-sm">매칭 {u.match}</p>
          </div>
          <Button variant="ghost" className="wf-taste-match-profile-btn">프로필</Button>
        </div>
      ))}
    </WireframePage>
  );
}

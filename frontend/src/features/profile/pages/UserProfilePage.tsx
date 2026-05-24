import { Link, useParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

export default function UserProfilePage() {
  const { userId } = useParams();
  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>@{userId ?? 'user'}</strong></p>
      <div className="wf-box wf-panel" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="wf-topnav__avatar wf-placeholder" style={{ width: 64, height: 64 }} />
        <div>
          <h1 className="wf-title" style={{ fontSize: 20 }}>z-imaging</h1>
          <p className="wf-text-sm">애호가 · 팔로워 48</p>
          <Button style={{ marginTop: 8, height: 36, width: 100 }}>팔로우</Button>
        </div>
      </div>
      <p className="wf-section-title">Cabinet · My Pick</p>
      <div className="wf-grid-4">
        {['Macallan 12', 'Springbank 10', 'Hibiki', 'Redbreast 12'].map((name) => (
          <Link key={name} to="/whiskey/1" className="wf-box wf-card--web" style={{ textDecoration: 'none' }}>
            <div className="wf-card__thumb wf-placeholder" style={{ height: 100 }} />
            <div style={{ padding: 10, fontSize: 13 }}>{name}</div>
          </Link>
        ))}
      </div>
      <p className="wf-section-title">커뮤니티 글</p>
      <div className="wf-box" style={{ padding: 14 }}>스모키 위스키 입문 추천</div>
    </WireframePage>
  );
}

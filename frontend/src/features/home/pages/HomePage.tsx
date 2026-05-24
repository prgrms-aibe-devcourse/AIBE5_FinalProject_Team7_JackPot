import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

const POPULAR = ['라프로익 10', '야마자키 12', '부커스', '아드벡 10'];

export default function HomePage() {
  return (
    <WireframePage scroll>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="wf-box wf-hero wf-box--accent">
          <div>
            <p className="wf-text-label">오늘의 추천</p>
            <h2 className="wf-hero__title" style={{ fontSize: 24 }}>글렌피딕 12년</h2>
            <span className="wf-match">취향 매칭 92%</span>
          </div>
          <Button to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', '1')}>상세 보기</Button>
        </div>
        <div className="wf-box wf-panel">
          <p className="wf-section-title">My Flavor</p>
          <div className="wf-chips" style={{ marginTop: 8 }}>
            <span className="wf-chip wf-chip--on">과일</span>
            <span className="wf-chip wf-chip--on">바닐라</span>
          </div>
        </div>
      </div>
      <p className="wf-section-title">최근 리뷰</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="wf-box" style={{ padding: 14 }}>
          <span className="wf-text-sm">GlassOfWhisky · 킬호만 로크 고름 </span>
          <strong style={{ color: 'var(--wf-accent)' }}> 87점</strong>
        </div>
        <div className="wf-box" style={{ padding: 14 }}>
          <span className="wf-text-sm">z-imaging · 글렌알라키 2003 </span>
          <strong style={{ color: 'var(--wf-accent)' }}> 88점</strong>
        </div>
      </div>
      <p className="wf-section-title">인기 위스키</p>
      <div className="wf-grid-4">
        {POPULAR.map((name) => (
          <Link key={name} to="/whiskey/1" className="wf-box wf-card--web" style={{ textDecoration: 'none' }}>
            <div className="wf-card__thumb wf-placeholder" style={{ height: 100 }} />
            <div style={{ padding: 10, fontSize: 13 }}>{name}</div>
          </Link>
        ))}
      </div>
      <p className="wf-section-title" style={{ marginTop: 8 }}>취향 비슷한 유저</p>
      <Button variant="ghost" to={PATHS.TASTE_MATCH}>Taste Match 보기</Button>
    </WireframePage>
  );
}

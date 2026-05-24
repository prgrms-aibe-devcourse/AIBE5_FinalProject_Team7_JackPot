import { PATHS } from '@/app/router/paths';
import { Button } from '@/shared/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="wf-page wf-page--guest-landing">
      <div className="wf-layout-split" style={{ padding: '0 40px', flex: 1 }}>
        <div className="wf-landing-hero wf-box wf-box--accent">
          <h1 className="wf-hero__title">당신의 취향에 맞는<br />위스키를 찾아보세요</h1>
          <p className="wf-subtitle">AI 큐레이션 · 시음 기록 · 커뮤니티 리뷰</p>
          <Button to={PATHS.LOGIN} block style={{ width: 200, marginTop: 24 }}>무료로 시작하기</Button>
        </div>
        <div className="wf-placeholder" style={{ height: 360, borderRadius: 'var(--wf-radius)' }} aria-hidden />
      </div>
      <div className="wf-stat-row" style={{ padding: '0 40px 32px' }}>
        <div className="wf-box wf-stat"><div className="wf-stat__val">설문</div><div className="wf-stat__label">맞춤 추천</div></div>
        <div className="wf-box wf-stat"><div className="wf-stat__val">리뷰</div><div className="wf-stat__label">커뮤니티</div></div>
        <div className="wf-box wf-stat"><div className="wf-stat__val">My Bar</div><div className="wf-stat__label">위시·My Pick</div></div>
      </div>
    </div>
  );
}

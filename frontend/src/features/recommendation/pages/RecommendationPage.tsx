import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';

const CARDS = ['글렌피딕 12', 'Balvenie 14', 'Macallan 12'];

export default function RecommendationPage() {
  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page">
        <div className="wf-page__inner wf-page__inner--scroll">
          <div className="wf-box wf-panel">
            <p className="wf-section-title">취향 요약</p>
            <p className="wf-text-sm">과일 · 바닐라 · 부드러운 바디</p>
            <div className="wf-chips" style={{ marginTop: 8 }}>
              <span className="wf-chip wf-chip--on">과일</span>
              <span className="wf-chip wf-chip--on">바닐라</span>
            </div>
          </div>
          <p className="wf-section-title">추천 위스키</p>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
            {CARDS.map((name, i) => (
              <div key={name} className="wf-box wf-card--web" style={{ minWidth: 180 }}>
                <div className="wf-card__thumb wf-placeholder" style={{ height: 120 }} />
                <div style={{ padding: 12 }}>
                  <p className="wf-card__title">{name}</p>
                  <Button to={`/whiskey/${i+1}`} style={{ marginTop: 8, height: 36 }}>상세</Button>
                </div>
              </div>
            ))}
          </div>
          <Button to={PATHS.LOUNGE}>홈으로</Button>
        </div>
      </div>
    </>
  );
}

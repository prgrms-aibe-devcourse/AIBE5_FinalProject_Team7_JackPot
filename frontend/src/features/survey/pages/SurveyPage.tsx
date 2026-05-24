import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';

export default function SurveyPage() {
  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-guest-center">
        <div className="wf-box wf-auth-box" style={{ maxWidth: 520 }}>
          <p className="wf-text-label">Step 2 / 4</p>
          <h2 className="wf-title">선호하는 향은?</h2>
          <div className="wf-chips" style={{ marginTop: 16 }}>
            {['과일','시트러스','베리','꽃','바닐라','스모키'].map((c) => (
              <span key={c} className="wf-chip">{c}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <Button variant="ghost" style={{ flex: 1 }}>이전</Button>
            <Button style={{ flex: 1 }} to={PATHS.RECOMMEND}>다음</Button>
          </div>
        </div>
      </div>
    </>
  );
}

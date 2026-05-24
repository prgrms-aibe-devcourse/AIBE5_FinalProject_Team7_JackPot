import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';

export default function OnboardingPage() {
  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-guest-center">
        <div className="wf-box wf-auth-box" style={{ maxWidth: 480 }}>
          <h2 className="wf-title">위스키 경험 수준</h2>
          <p className="wf-subtitle">맞춤 설문을 위해 선택해 주세요</p>
          <div className="wf-chips" style={{ marginTop: 20 }}>
            <span className="wf-chip wf-chip--on">입문자</span>
            <span className="wf-chip">애호가</span>
          </div>
          <Button block style={{ marginTop: 24 }} to={PATHS.SURVEY}>다음</Button>
        </div>
      </div>
    </>
  );
}

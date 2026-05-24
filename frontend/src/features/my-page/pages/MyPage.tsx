import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

export default function MyPage() {
  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>마이페이지</strong></p>
      <div className="wf-box wf-panel" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div className="wf-topnav__avatar wf-placeholder" style={{ width: 64, height: 64 }} />
        <div>
          <h1 className="wf-title" style={{ fontSize: 20 }}>
            GlassOfWhisky
          </h1>
          <p className="wf-text-sm">입문자 · 팔로워 12 · 팔로잉 8</p>
        </div>
      </div>
      <p className="wf-section-title">설정</p>
      <div className="wf-box" style={{ padding: 14 }}>
        프로필 수정
      </div>
      <div className="wf-box" style={{ padding: 14, marginTop: 8 }}>
        취향 설문 다시하기
      </div>
      <Button variant="ghost" to={PATHS.MY_BAR} style={{ marginTop: 16 }}>
        My Bar로 이동
      </Button>
    </WireframePage>
  );
}

import { WireframePage } from '@/shared/components/layout/WireframePage';

const BOARDS = ['칼럼', '질문', '토론', '취향 공유'];

export default function CommunityPage() {
  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">홈 / <strong>커뮤니티</strong></p>
      <h1 className="wf-title">Community</h1>
      <div className="wf-chips">
        {BOARDS.map((b, i) => (
          <span key={b} className={`wf-chip${i === 0 ? ' wf-chip--on' : ''}`}>{b}</span>
        ))}
      </div>
      {['입문자 위스키 3선', '피트 vs 스모키 차이', 'My Bar 정리 팁'].map((title) => (
        <div key={title} className="wf-box" style={{ padding: 16, marginTop: 12 }}>
          <strong>{title}</strong>
          <p className="wf-text-sm" style={{ marginTop: 6 }}>GlassOfWhisky · ♥ 24</p>
        </div>
      ))}
    </WireframePage>
  );
}

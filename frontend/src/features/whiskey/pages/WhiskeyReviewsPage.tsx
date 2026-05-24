import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

const REVIEWS = [
  { user: 'GlassOfWhisky', score: 87, note: '부드럽고 과일향이 좋아요' },
  { user: 'z-imaging', score: 88, note: '입문용으로 추천' },
];

export default function WhiskeyReviewsPage() {
  const { whiskeyId } = useParams();
  const detailPath = PATHS.WHISKEY_DETAIL.replace(':whiskeyId', whiskeyId ?? '1');

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb"><Link to={detailPath}>글렌피딕 12년</Link> / <strong>리뷰</strong></p>
      <div className="wf-box wf-panel" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div><span className="wf-text-label">Nose</span><strong> 4.1</strong></div>
        <div><span className="wf-text-label">Palate</span><strong> 4.2</strong></div>
        <div><span className="wf-text-label">Finish</span><strong> 4.0</strong></div>
        <Button to={PATHS.WRITE_REVIEW.replace(':whiskeyId', whiskeyId ?? '1')}>리뷰 쓰기</Button>
      </div>
      {REVIEWS.map((r) => (
        <div key={r.user} className="wf-box" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{r.user}</strong>
            <span style={{ color: 'var(--wf-accent)' }}>{r.score}점</span>
          </div>
          <p className="wf-text-sm" style={{ marginTop: 8 }}>{r.note}</p>
        </div>
      ))}
    </WireframePage>
  );
}

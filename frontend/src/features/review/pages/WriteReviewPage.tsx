import { useParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function WriteReviewPage() {
  const { whiskeyId } = useParams();
  return (
    <WireframePage>
      <div className="wf-box wf-panel" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2 className="wf-title">리뷰 작성</h2>
        <p className="wf-text-sm">위스키 ID: {whiskeyId}</p>
        {['Nose','Palate','Finish'].map((label) => (
          <div key={label} style={{ marginTop: 16 }}>
            <p className="wf-text-label">{label}</p>
            <div className="wf-input">슬라이더 (0–100)</div>
          </div>
        ))}
        <Input placeholder="한줄 코멘트" style={{ marginTop: 16 }} />
        <Button block style={{ marginTop: 16 }}>등록</Button>
      </div>
    </WireframePage>
  );
}

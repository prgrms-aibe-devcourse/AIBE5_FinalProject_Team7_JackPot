import { useParams } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export default function TastingNotePage() {
  const { whiskeyId } = useParams();
  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">상세 / <strong>시음 노트</strong></p>
      <h1 className="wf-title">Tasting Note</h1>
      <p className="wf-text-sm">위스키 #{whiskeyId} · 비공개</p>
      <Input placeholder="향 노트" style={{ marginTop: 16 }} />
      <Input placeholder="맛 노트" style={{ marginTop: 10 }} />
      <Input placeholder="피니시" style={{ marginTop: 10 }} />
      <div className="wf-chips" style={{ marginTop: 16 }}>
        {['사과', '바닐라', '오크'].map((t) => (
          <span key={t} className="wf-chip wf-chip--on">{t}</span>
        ))}
      </div>
      <Button block style={{ marginTop: 16 }}>저장</Button>
    </WireframePage>
  );
}

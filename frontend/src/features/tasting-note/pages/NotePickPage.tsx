import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

export default function NotePickPage() {
  return (
    <WireframePage scroll>
      <h1 className="wf-title">노트 작성 · 위스키 선택</h1>
      {['글렌피딕 12', '라프로익 10'].map((name, i) => (
        <div key={name} className="wf-card wf-box" style={{ padding: 16, marginTop: 12 }}>
          <div className="wf-card__title">{name}</div>
          <Button to={PATHS.TASTING_NOTE.replace(':whiskeyId', String(i + 1))} style={{ marginTop: 8, height: 36 }}>
            선택
          </Button>
        </div>
      ))}
    </WireframePage>
  );
}

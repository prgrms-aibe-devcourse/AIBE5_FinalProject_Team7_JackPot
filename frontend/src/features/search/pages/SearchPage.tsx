import { Link } from 'react-router-dom';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

const FILTERS = ['전체', '싱글몰트', '블렌디드', '스코틀랜드', '일본', '40% 이하', '40–50%'];
const RESULTS = [
  { id: '1', name: '글렌피딕 12년', meta: '스페이사이드 · 40% · ₩89,000', rating: '★★★★☆ 4.2 (128)' },
  { id: '2', name: '글렌피딕 15년', meta: '스페이사이드 · 40%', rating: '★★★★☆ 4.0 (86)' },
];

export default function SearchPage() {
  return (
    <WireframePage>
      <p className="wf-breadcrumb">홈 / <strong>검색</strong></p>
      <div className="wf-layout-sidebar">
        <aside className="wf-sidebar">
          <p className="wf-text-label">필터</p>
          {FILTERS.slice(0,5).map((f,i) => (
            <div key={f} className={`wf-box${i===0?' active':''}`}>{f}</div>
          ))}
          <p className="wf-text-label" style={{ marginTop: 12 }}>도수</p>
          {FILTERS.slice(5).map((f) => (
            <div key={f} className="wf-box">{f}</div>
          ))}
        </aside>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <p className="wf-text-sm">결과 24건</p>
          {RESULTS.map((r) => (
            <Link key={r.id} to={`/whiskey/${r.id}`} className="wf-card wf-box wf-card--clickable" style={{ padding: 16, textDecoration: 'none' }}>
              <div className="wf-card__thumb wf-placeholder" style={{ width: 72, height: 96 }} />
              <div className="wf-card__body">
                <div className="wf-card__title">{r.name}</div>
                <div className="wf-card__meta">{r.meta}</div>
                <div className="wf-stars">{r.rating}</div>
                <Button variant="ghost" style={{ height: 32, width: 100, marginTop: 8 }}>♡ 위시</Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WireframePage>
  );
}

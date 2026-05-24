import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { Button } from '@/shared/components/ui/Button';

export default function WhiskeyDetailPage() {
  const { whiskeyId } = useParams();
  const reviewPath = PATHS.WHISKEY_REVIEWS.replace(':whiskeyId', whiskeyId ?? '1');

  return (
    <WireframePage scroll>
      <p className="wf-breadcrumb">검색 / <strong>글렌피딕 12년</strong></p>
      <div className="wf-tabs">
        <span className="wf-tab-item wf-tab-item--on">정보</span>
        <Link to={reviewPath} className="wf-tab-item" style={{ textDecoration: 'none', color: 'inherit' }}>리뷰 (128)</Link>
        <Link to={PATHS.TASTING_NOTE.replace(':whiskeyId', whiskeyId ?? '1')} className="wf-tab-item" style={{ textDecoration: 'none', color: 'inherit' }}>개인 노트</Link>
      </div>
      <div className="wf-layout-detail">
        <div>
          <div className="wf-placeholder" style={{ height: 320, borderRadius: 'var(--wf-radius)' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <Button variant="ghost" style={{ flex: 1 }}>♡ 위시리스트</Button>
            <Button style={{ flex: 1 }}>★ My Pick에 추가</Button>
            <Button variant="ghost" style={{ flex: 1 }} to={PATHS.WRITE_REVIEW.replace(':whiskeyId', whiskeyId ?? '1')}>리뷰 쓰기</Button>
          </div>
          <p className="wf-text-xs" style={{ marginTop: 6 }}>위시=마시고 싶음 · My Pick=맛있어서 추천하는 술</p>
          <div className="wf-grid2" style={{ marginTop: 16 }}>
            {[
              ['숙성', '12년'],
              ['도수', '40%'],
              ['가격', '₩89,000'],
              ['캐스크', '버번'],
            ].map(([k, v]) => (
              <div key={k} className="wf-box wf-grid2__item"><div className="wf-text-xs">{k}</div><div>{v}</div></div>
            ))}
          </div>
        </div>
        <div>
          <h1 className="wf-title">Glenfiddich 12</h1>
          <p className="wf-text-sm">싱글몰트 · 스코틀랜드 · 스페이사이드</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--wf-accent)', margin: '12px 0' }}>
            4.2 <span className="wf-text-sm" style={{ fontWeight: 400 }}>/ 128 리뷰</span>
          </p>
          <div className="wf-radar wf-box" style={{ height: 200, margin: '16px 0' }}>
            <div className="wf-radar__shape" />
          </div>
          <div className="wf-box wf-panel">
            <p className="wf-section-title">제조·풍미</p>
            <p className="wf-text-sm" style={{ marginTop: 8 }}>증류소 Glenfiddich · 맥아 100%<br />향: 사과·배, 꽃, 허니 · 맛: 부드러운 단맛, 오크</p>
          </div>
          <p className="wf-text-label">추천 이유</p>
          <p className="wf-text-sm">입문자 설문(과일·부드러움)과 92% 일치</p>
        </div>
      </div>
    </WireframePage>
  );
}

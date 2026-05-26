import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { WireframePage } from '@/shared/components/layout/WireframePage';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { Button } from '@/shared/components/ui/Button';
import { RelatedColumns } from '../components/RelatedColumns';
import { TastingSummaryPanel } from '../components/TastingSummaryPanel';
import { TastingTagsBubble } from '../components/TastingTagsBubble';
import { useRelatedColumns, useWhiskeyDetail } from '../hooks/useWhiskeyDetail';
import type { TastingSummarySource } from '../types';
import { buildTastingAxes, hasOfficialNote } from '../utils/tastingSummary';

function formatType(type: string): string {
  const map: Record<string, string> = {
    single_malt: '싱글몰트',
    blended: '블렌디드',
    bourbon: '버번',
    rye: '라이',
  };
  return map[type] ?? type;
}

export default function WhiskeyDetailPage() {
  const { whiskeyId } = useParams();
  const id = whiskeyId ?? '1';
  const reviewPath = PATHS.WHISKEY_REVIEWS.replace(':whiskeyId', id);
  const notePath = PATHS.TASTING_NOTE.replace(':whiskeyId', id);

  const { data: detail, isLoading, isError } = useWhiskeyDetail(id);
  const { data: relatedPosts = [], isLoading: columnsLoading } = useRelatedColumns(id);

  const [summarySource, setSummarySource] = useState<TastingSummarySource>('official');

  const effectiveSource = useMemo(() => {
    if (!detail) return summarySource;
    if (summarySource === 'official' && !hasOfficialNote(detail)) return 'userAvg';
    return summarySource;
  }, [detail, summarySource]);

  const tastingAxes = useMemo(
    () => (detail ? buildTastingAxes(detail) : []),
    [detail],
  );

  if (isLoading) {
    return (
      <WireframePage scroll>
        <PageLoader label="위스키 정보 불러오는 중…" />
      </WireframePage>
    );
  }

  if (isError || !detail) {
    return (
      <WireframePage scroll>
        <p className="wf-text-sm">위스키 정보를 불러오지 못했습니다.</p>
      </WireframePage>
    );
  }

  const ageLabel = detail.ageYears > 0 ? `${detail.ageYears}년` : 'NAS';
  const metaLine = [
    formatType(detail.type),
    detail.country,
    `${detail.abv}%`,
    '700ml',
  ].join(' · ');

  return (
    <WireframePage scroll>
      <header className="wf-detail-hero">
        <h1 className="wf-title wf-detail-hero__title">{detail.name}</h1>
        <p className="wf-text-sm">{metaLine}</p>
        <p className="wf-detail-hero__rating">
          종합 {detail.noteSummary?.bodyScore ?? '—'} / 100
          <span className="wf-text-sm"> · {detail.noteSummary?.noteCount ?? 0} 노트</span>
        </p>
      </header>

      <div className="wf-tabs">
        <span className="wf-tab-item wf-tab-item--on">정보</span>
        <Link to={reviewPath} className="wf-tab-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          리뷰
        </Link>
        <Link to={notePath} className="wf-tab-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          개인 노트
        </Link>
      </div>

      <div className="wf-layout-detail-v2">
        <aside className="wf-detail-sidebar">
          <div className="wf-placeholder wf-detail-sidebar__image" aria-hidden />
          <div className="wf-detail-sidebar__actions">
            <Button variant="ghost" style={{ width: '100%' }}>
              ♡ 위시리스트
            </Button>
            <Button style={{ width: '100%' }}>★ My Pick</Button>
            <Button variant="ghost" style={{ width: '100%' }} to={PATHS.WRITE_REVIEW.replace(':whiskeyId', id)}>
              리뷰 작성
            </Button>
            <Button variant="ghost" style={{ width: '100%' }} to={notePath}>
              📝 My Note 작성
            </Button>
          </div>
          <p className="wf-text-xs">위시=마시고 싶음 · My Pick=맛있어서 추천하는 술</p>
          <div className="wf-grid2">
            {[
              ['숙성', ageLabel],
              ['도수', `${detail.abv}%`],
              ['지역', detail.region],
              ['캐스크', detail.cask ?? '—'],
            ].map(([k, v]) => (
              <div key={k} className="wf-box wf-grid2__item">
                <div className="wf-text-xs">{k}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </aside>

        <main className="wf-detail-main">
          <section className="wf-detail-info">
            <h2 className="wf-section-title">제품 정보</h2>
            {detail.description && <p className="wf-text-sm">{detail.description}</p>}
            <p className="wf-text-sm wf-detail-info__meta">
              증류소 · {detail.distillery ?? detail.name} · {detail.region} · 캐스크 {detail.cask ?? '—'}
            </p>
          </section>

          <TastingSummaryPanel
            axes={tastingAxes}
            source={effectiveSource}
            hasOfficial={hasOfficialNote(detail)}
            onSourceChange={setSummarySource}
            reviewPath={reviewPath}
          />

          <RelatedColumns posts={relatedPosts} isLoading={columnsLoading} />
        </main>

        <aside className="wf-detail-aside">
          <TastingTagsBubble tags={detail.tastingTags} />
        </aside>
      </div>
    </WireframePage>
  );
}

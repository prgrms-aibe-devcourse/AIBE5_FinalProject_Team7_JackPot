import { Link } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import type { SimilarWhiskey } from '../types';

const TYPE_LABEL: Record<string, string> = {
  single_malt: '싱글몰트',
  blended: '블렌디드',
  bourbon: '버번',
  rye: '라이',
};

interface RelatedWhiskeysProps {
  items: SimilarWhiskey[];
  isLoading?: boolean;
}

function formatSimilarityScore(score: number) {
  const percent = score <= 1 ? score * 100 : score;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
}

export function RelatedWhiskeys({ items, isLoading }: RelatedWhiskeysProps) {
  // 추천 결과 없음(대상 위스키 노트캐시 없음 등) → 섹션 자체를 숨김
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="wf-detail-columns wf-detail-panel" aria-label="비슷한 위스키 추천">
      <div className="wf-detail-section-head">
        <h2 className="wf-section-title">비슷한 위스키 추천</h2>
      </div>

      {isLoading ? (
        <div className="wf-related-whiskeys">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="wf-box wf-related-whiskeys__card wf-related-whiskeys__card--loading">
              <div className="wf-card__thumb wf-placeholder" />
              <div className="wf-card__body">
                <span />
                <span />
                <span />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="wf-detail-state">
          <p className="wf-card__title">추천할 위스키가 아직 없습니다.</p>
          <p className="wf-card__meta">향과 맛 데이터가 쌓이면 가까운 취향의 위스키를 보여드릴게요.</p>
        </div>
      ) : (
        <div className="wf-related-whiskeys">
          {items.map((w) => {
            const img = resolveMediaUrl(w.imageUrl);
            return (
              <Link
                key={w.id}
                to={PATHS.WHISKEY_DETAIL.replace(':whiskeyId', String(w.id))}
                className="wf-box wf-card--web wf-related-whiskeys__card"
              >
                {img ? (
                  <img
                    src={img}
                    alt={w.name}
                    className="wf-card__thumb"
                  />
                ) : (
                  <div className="wf-card__thumb wf-placeholder" aria-hidden />
                )}
                <div className="wf-card__body">
                  <p className="wf-card__title">{w.name}</p>
                  <p className="wf-related-whiskeys__meta">
                    {[TYPE_LABEL[w.type] ?? w.type, w.region].filter(Boolean).join(' · ')}
                  </p>
                  <p className="wf-related-whiskeys__rating">
                    <span className="wf-stars">★</span> {(w.avgRating ?? 0).toFixed(1)}
                    {w.score > 0 && (
                      <span className="wf-related-whiskeys__score">· 유사도 {formatSimilarityScore(w.score)}</span>
                    )}
                  </p>
                  {w.reason && (
                    <p className="wf-related-whiskeys__reason">{w.reason}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

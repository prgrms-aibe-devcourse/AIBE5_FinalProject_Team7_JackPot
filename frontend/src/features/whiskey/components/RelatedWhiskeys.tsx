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

export function RelatedWhiskeys({ items, isLoading }: RelatedWhiskeysProps) {
  return (
    <section className="wf-detail-columns" aria-label="비슷한 위스키 추천">
      <h2 className="wf-section-title">비슷한 위스키 추천</h2>

      {isLoading ? (
        <p className="wf-text-sm">추천 위스키를 불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="wf-text-sm">추천할 위스키가 아직 없습니다.</p>
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
                    {(TYPE_LABEL[w.type] ?? w.type)} · {w.region}
                  </p>
                  <p className="wf-related-whiskeys__rating">
                    <span className="wf-stars">★</span> {w.avgRating.toFixed(1)}
                    {w.score > 0 && (
                      <span className="wf-related-whiskeys__score">· 유사도 {(w.score * 100).toFixed(2)}%</span>
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

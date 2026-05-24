import { Link } from 'react-router-dom';
import type { TastingAxisView, TastingSummarySource } from '../types';

interface TastingSummaryPanelProps {
  axes: TastingAxisView[];
  source: TastingSummarySource;
  hasOfficial: boolean;
  onSourceChange: (source: TastingSummarySource) => void;
  reviewPath: string;
}

export function TastingSummaryPanel({
  axes,
  source,
  hasOfficial,
  onSourceChange,
  reviewPath,
}: TastingSummaryPanelProps) {
  return (
    <section className="wf-detail-tasting" aria-label="시음 요약">
      <h2 className="wf-section-title">시음 요약</h2>
      <div className="wf-detail-tasting__toggle">
        <button
          type="button"
          className={`wf-chip ${source === 'official' ? 'wf-chip--on' : ''}`}
          disabled={!hasOfficial}
          onClick={() => onSourceChange('official')}
        >
          오피셜
        </button>
        <button
          type="button"
          className={`wf-chip ${source === 'userAvg' ? 'wf-chip--on' : ''}`}
          onClick={() => onSourceChange('userAvg')}
        >
          사용자 평균
        </button>
      </div>
      <p className="wf-text-xs wf-detail-tasting__note">
        노트 첨부 리뷰 기반 · 오피셜 없으면 평균 고정
      </p>

      {axes.length === 0 ? (
        <p className="wf-text-sm">시음 데이터가 아직 없습니다.</p>
      ) : (
        <ul className="wf-detail-tasting__axes">
          {axes.map((axis) => (
            <li key={axis.key} className="wf-detail-tasting__axis">
              <div className="wf-detail-tasting__axis-head">
                <span className="wf-detail-tasting__axis-label">{axis.label}</span>
                <span className="wf-detail-tasting__axis-score">{axis.score}</span>
              </div>
              <div className="wf-detail-tasting__bar-track" aria-hidden>
                <div
                  className="wf-detail-tasting__bar-fill"
                  style={{ width: `${Math.min(axis.score, 100)}%` }}
                />
              </div>
              {axis.tagLabels.length > 0 && (
                <p className="wf-text-sm wf-detail-tasting__tags">{axis.tagLabels.join(', ')}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link to={reviewPath} className="wf-detail-tasting__reviews-link wf-text-sm">
        리뷰 탭 →
      </Link>
    </section>
  );
}

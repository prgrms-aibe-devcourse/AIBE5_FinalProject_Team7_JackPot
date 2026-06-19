import type { TastingAxisView, TastingSummarySource } from '../types';

const CHART_SIZE = 340;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 112;
const SCORE_MAX = 10;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

interface TastingSummaryPanelProps {
  axes: TastingAxisView[];
  source: TastingSummarySource;
  hasOfficial: boolean;
  /** 공식 시음 노트 (항목명→설명). 오피셜 탭에서 표시 */
  officialNote?: Record<string, string> | null;
  onSourceChange: (source: TastingSummarySource) => void;
}

function axisPoint(index: number, total: number, ratio: number) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: CHART_CENTER + Math.cos(angle) * CHART_RADIUS * ratio,
    y: CHART_CENTER + Math.sin(angle) * CHART_RADIUS * ratio,
  };
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function displayLabel(axis: TastingAxisView) {
  if (axis.key === 'sweet') return '단맛';
  return axis.label;
}

function normalizeScore(score: number) {
  const tenPointScore = score > SCORE_MAX ? score / 10 : score;
  return Math.min(Math.max(tenPointScore, 0), SCORE_MAX);
}

function formatScore(score: number) {
  const normalized = normalizeScore(score);
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1);
}

export function TastingSummaryPanel({
  axes,
  source,
  hasOfficial,
  officialNote,
  onSourceChange,
}: TastingSummaryPanelProps) {
  const officialNoteEntries = Object.entries(officialNote ?? {});
  const showOfficialNote = source === 'official' && officialNoteEntries.length > 0;

  return (
    <section className="wf-detail-tasting wf-detail-panel" aria-label="시음 요약">
      <div className="wf-detail-section-head">
        <div>
          <h2 className="wf-section-title">시음 요약</h2>
          <p className="wf-text-xs wf-detail-tasting__note">
            노트 첨부 리뷰 기반 · 오피셜 없으면 평균 고정
          </p>
        </div>
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
      </div>

      {source === 'official' ? null : axes.length === 0 ? (
        <div className="wf-detail-state">
          <p className="wf-card__title">시음 데이터가 아직 없습니다.</p>
          <p className="wf-card__meta">첫 리뷰와 노트를 남기면 이 위스키의 맛 지도가 채워집니다.</p>
        </div>
      ) : (
        <div className="wf-detail-tasting__radar">
          <svg
            className="wf-detail-tasting__radar-chart"
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
            role="img"
            aria-label="시음 요약 오각형 그래프"
          >
            {GRID_LEVELS.map((level) => (
              <polygon
                key={level}
                points={pointsToString(axes.map((_, index) => axisPoint(index, axes.length, level)))}
                className="wf-detail-tasting__radar-grid"
              />
            ))}
            {axes.map((_, index) => {
              const end = axisPoint(index, axes.length, 1);
              return (
                <line
                  key={index}
                  x1={CHART_CENTER}
                  y1={CHART_CENTER}
                  x2={end.x}
                  y2={end.y}
                  className="wf-detail-tasting__radar-axis"
                />
              );
            })}
            <polygon
              points={pointsToString(
                axes.map((axis, index) => axisPoint(index, axes.length, normalizeScore(axis.score) / SCORE_MAX)),
              )}
              className="wf-detail-tasting__radar-fill"
            />
            {axes.map((axis, index) => {
              const point = axisPoint(index, axes.length, 1.24);
              const scorePoint = axisPoint(index, axes.length, normalizeScore(axis.score) / SCORE_MAX);
              return (
                <g key={axis.key}>
                  <circle cx={scorePoint.x} cy={scorePoint.y} r="4" className="wf-detail-tasting__radar-dot" />
                  <text
                    x={point.x}
                    y={point.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="wf-detail-tasting__radar-label"
                  >
                    {displayLabel(axis)}
                  </text>
                  <text
                    x={point.x}
                    y={point.y + 16}
                    textAnchor="middle"
                  dominantBaseline="middle"
                  className="wf-detail-tasting__radar-score"
                >
                    {formatScore(axis.score)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {source === 'official' && (
        showOfficialNote ? (
          <div className="wf-detail-official-note">
            {officialNoteEntries.map(([label, text]) => (
              <div key={label} className="wf-detail-official-note__row">
                <p className="wf-text-label">{label}</p>
                <p className="wf-text-sm">{text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="wf-detail-state">
            <p className="wf-card__title">오피셜 노트가 아직 없습니다.</p>
          </div>
        )
      )}
    </section>
  );
}

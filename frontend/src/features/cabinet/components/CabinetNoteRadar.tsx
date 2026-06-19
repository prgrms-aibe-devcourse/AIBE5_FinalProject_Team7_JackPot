import type { MyTastingNote } from '@/features/tasting-note/api/noteApi';

const CHART_SIZE = 220;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 72;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const SCORE_MAX = 10;

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

function normalizeScore(score: number | null) {
  if (score == null) return 0;
  return Math.min(Math.max(score, 0), SCORE_MAX);
}

function buildNoteAxes(note: MyTastingNote) {
  return [
    { key: 'body', label: '바디', score: normalizeScore(note.bodyScore) },
    { key: 'finish', label: '피니시', score: normalizeScore(note.finishScore) },
    { key: 'smoky', label: '스모키', score: normalizeScore(note.smokyScore) },
    { key: 'spicy', label: '스파이시', score: normalizeScore(note.spicyScore) },
    { key: 'sweet', label: '단맛', score: normalizeScore(note.sweetScore) },
  ];
}

interface CabinetNoteRadarProps {
  note: MyTastingNote;
}

export function CabinetNoteRadar({ note }: CabinetNoteRadarProps) {
  const axes = buildNoteAxes(note);

  return (
    <svg className="wf-attached-note__radar" viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label="시음 노트 점수 그래프">
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={pointsToString(axes.map((_, index) => axisPoint(index, axes.length, level)))}
          className="wf-attached-note__radar-grid"
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
            className="wf-attached-note__radar-axis"
          />
        );
      })}
      <polygon
        points={pointsToString(axes.map((axis, index) => axisPoint(index, axes.length, axis.score / SCORE_MAX)))}
        className="wf-attached-note__radar-fill"
      />
      {axes.map((axis, index) => {
        const labelPoint = axisPoint(index, axes.length, 1.28);
        return (
          <g key={axis.key}>
            <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" className="wf-attached-note__radar-label">
              {axis.label}
            </text>
            <text x={labelPoint.x} y={labelPoint.y + 14} textAnchor="middle" dominantBaseline="middle" className="wf-attached-note__radar-score">
              {axis.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

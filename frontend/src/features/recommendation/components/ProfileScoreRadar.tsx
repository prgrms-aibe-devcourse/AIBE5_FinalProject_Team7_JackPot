const CHART_SIZE = 240;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 78;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

export const PROFILE_RADAR_AXES = [
  { key: 'bodyScore', label: '바디' },
  { key: 'finishScore', label: '피니시' },
  { key: 'smokyScore', label: '스모키' },
  { key: 'spicyScore', label: '스파이시' },
  { key: 'sweetScore', label: '단맛' },
] as const;

export type ProfileRadarKey = (typeof PROFILE_RADAR_AXES)[number]['key'];

export interface ProfileRadarScores {
  bodyScore: number;
  finishScore: number;
  smokyScore: number;
  spicyScore: number;
  sweetScore: number;
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

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

interface ProfileScoreRadarProps {
  scores: ProfileRadarScores;
}

/** 취향 프로필 5축 레이더 (0~100%) */
export function ProfileScoreRadar({ scores }: ProfileScoreRadarProps) {
  const axes = PROFILE_RADAR_AXES.map((axis) => ({
    ...axis,
    score: clampPercent(scores[axis.key]),
  }));

  return (
    <svg
      className="wf-reco-radar"
      viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
      role="img"
      aria-label="취향 5축 그래프"
    >
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={pointsToString(axes.map((_, index) => axisPoint(index, axes.length, level)))}
          className="wf-reco-radar__grid"
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
            className="wf-reco-radar__axis"
          />
        );
      })}
      <polygon
        points={pointsToString(
          axes.map((axis, index) => axisPoint(index, axes.length, axis.score / 100)),
        )}
        className="wf-reco-radar__fill"
      />
      {axes.map((axis, index) => {
        const labelPoint = axisPoint(index, axes.length, 1.28);
        return (
          <g key={axis.key}>
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="wf-reco-radar__label"
            >
              {axis.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

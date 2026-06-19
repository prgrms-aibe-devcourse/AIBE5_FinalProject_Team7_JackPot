import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTastingNote, type MyTastingNote, type TastingNoteTag } from '@/features/tasting-note/api/noteApi';

const CHART_SIZE = 220;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 70;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const SCORE_MAX = 10;

type TagFilter = 'nose' | 'taste';

interface AttachedNotePanelProps {
  noteId: number;
  /** 리뷰 피드 등 상위에서 이미 Note 라벨이 있을 때 헤더 생략 */
  embedded?: boolean;
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

function normalizeScore(score: number | null) {
  if (score == null) return 0;
  return Math.min(Math.max(score, 0), SCORE_MAX);
}

function buildAxes(note: MyTastingNote) {
  return [
    { key: 'body', label: '바디', score: normalizeScore(note.bodyScore) },
    { key: 'finish', label: '피니시', score: normalizeScore(note.finishScore) },
    { key: 'smoky', label: '스모키', score: normalizeScore(note.smokyScore) },
    { key: 'spicy', label: '스파이시', score: normalizeScore(note.spicyScore) },
    { key: 'sweet', label: '단맛', score: normalizeScore(note.sweetScore) },
  ];
}

function tagCategoryLabel(category: TagFilter) {
  return category === 'nose' ? '향 태그' : '맛 태그';
}

function NoteRadar({ note }: { note: MyTastingNote }) {
  const axes = buildAxes(note);

  return (
    <svg className="wf-attached-note__radar" viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} role="img" aria-label="첨부 노트 점수 그래프">
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
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="wf-attached-note__radar-label"
            >
              {axis.label}
            </text>
            <text
              x={labelPoint.x}
              y={labelPoint.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="wf-attached-note__radar-score"
            >
              {axis.score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function NoteTags({ tags }: { tags: TastingNoteTag[] }) {
  const [filter, setFilter] = useState<TagFilter>('nose');
  const filteredTags = useMemo(
    () => tags.filter((tag) => tag.category === filter),
    [filter, tags],
  );

  return (
    <div className="wf-attached-note__tags">
      <div className="wf-attached-note__tag-tabs" role="group" aria-label="첨부 노트 태그 종류">
        {(['nose', 'taste'] as const).map((category) => (
          <button
            key={category}
            type="button"
            className={`wf-attached-note__tag-tab${filter === category ? ' wf-attached-note__tag-tab--on' : ''}`}
            onClick={() => setFilter(category)}
          >
            {tagCategoryLabel(category)}
          </button>
        ))}
      </div>
      {filteredTags.length ? (
        <div className="wf-attached-note__tag-list">
          {filteredTags.map((tag) => (
            <span key={tag.id} className="wf-attached-note__tag-chip">
              {tag.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="wf-text-sm wf-attached-note__empty">{tagCategoryLabel(filter)}가 없습니다.</p>
      )}
    </div>
  );
}

export function AttachedNotePanel({ noteId, embedded = false }: AttachedNotePanelProps) {
  const { data: note, isLoading, isError } = useQuery({
    queryKey: ['tasting-note', 'attached', noteId],
    queryFn: () => fetchTastingNote(noteId),
  });

  if (isLoading) {
    return <div className="wf-attached-note wf-box">첨부 노트를 불러오는 중입니다.</div>;
  }

  if (isError || !note) {
    return <div className="wf-attached-note wf-box">첨부 노트를 불러오지 못했습니다.</div>;
  }

  return (
    <section
      className={`wf-attached-note${embedded ? ' wf-attached-note--embedded' : ' wf-box'}`}
      aria-label={embedded ? '첨부 노트' : '첨부된 노트'}
    >
      {!embedded ? (
        <div>
          <p className="wf-text-label">첨부된 노트</p>
          <h3 className="wf-attached-note__title">{note.whiskeyName}</h3>
        </div>
      ) : null}
      <div className="wf-attached-note__body">
        <NoteRadar note={note} />
        <div className="wf-attached-note__content">
          <p className="wf-text-sm wf-attached-note__memo">
            {note.memo || '작성된 메모가 없습니다.'}
          </p>
          <NoteTags tags={note.tags ?? []} />
        </div>
      </div>
    </section>
  );
}

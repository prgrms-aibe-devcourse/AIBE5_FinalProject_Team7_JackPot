import { useMemo, useState } from 'react';
import type { WhiskeyTagStat } from '../types';

const MIN_RADIUS = 22;
const MAX_RADIUS = 36;
const TAG_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'nose', label: '향' },
  { value: 'taste', label: '맛' },
] as const;

type TagFilter = (typeof TAG_FILTERS)[number]['value'];

function heatColor(ratio: number): string {
  if (ratio >= 0.66) return '#4A9B6E';
  if (ratio >= 0.45) return '#6B8B58';
  if (ratio >= 0.25) return '#8B7D52';
  return '#9B5A5A';
}

function bubbleSize(count: number, maxCount: number): number {
  if (maxCount <= 0) return MIN_RADIUS;
  const ratio = count / maxCount;
  return MIN_RADIUS + ratio * (MAX_RADIUS - MIN_RADIUS);
}

interface TastingTagsBubbleProps {
  tags: WhiskeyTagStat[];
  onTagClick?: (tag: WhiskeyTagStat) => void;
}

export function TastingTagsBubble({ tags, onTagClick }: TastingTagsBubbleProps) {
  const [selectedFilter, setSelectedFilter] = useState<TagFilter>('all');
  const sorted = useMemo(() => {
    return [...tags]
      .filter((tag) => selectedFilter === 'all' || tag.category === selectedFilter)
      .sort((a, b) => b.count - a.count);
  }, [selectedFilter, tags]);
  const maxCount = sorted[0]?.count ?? 1;

  return (
    <section className="wf-detail-tags wf-box wf-box--solid" aria-label="Tasting tags">
      <h2 className="wf-section-title">TASTING TAGS</h2>
      <div className="wf-detail-tags__filters" role="group" aria-label="태그 종류 선택">
        {TAG_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`wf-detail-tags__filter-button ${
              selectedFilter === filter.value ? 'wf-detail-tags__filter-button--active' : ''
            }`}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="wf-text-sm wf-detail-tags__empty">아직 등록된 My Note 태그가 없습니다.</p>
      ) : (
        <ul className="wf-detail-tags__grid">
          {sorted.map((tag) => {
            const ratio = tag.count / maxCount;
            const radius = bubbleSize(tag.count, maxCount);
            return (
              <li key={tag.tagId}>
                <button
                  type="button"
                  className="wf-detail-tags__bubble"
                  style={{
                    width: radius * 2,
                    height: radius * 2,
                    backgroundColor: heatColor(ratio),
                  }}
                  onClick={() => onTagClick?.(tag)}
                  title={`${tag.name} (${tag.count})`}
                >
                  {tag.imageUrl ? (
                    <img src={tag.imageUrl} alt="" className="wf-detail-tags__image" />
                  ) : null}
                  <span className="wf-detail-tags__count">{tag.count}</span>
                </button>
                <span className="wf-detail-tags__name">{tag.name}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="wf-detail-tags__legend" aria-hidden>
        <span className="wf-text-xs">적음</span>
        <span className="wf-detail-tags__legend-bar wf-detail-tags__legend-bar--low" />
        <span className="wf-detail-tags__legend-bar wf-detail-tags__legend-bar--mid" />
        <span className="wf-detail-tags__legend-bar wf-detail-tags__legend-bar--high" />
        <span className="wf-text-xs">많음</span>
      </div>
    </section>
  );
}

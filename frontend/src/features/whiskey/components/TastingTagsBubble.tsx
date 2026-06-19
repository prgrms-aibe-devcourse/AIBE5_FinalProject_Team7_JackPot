import { useMemo, useState } from 'react';
import { getTagTooltip } from '../constants/tagDescriptions';
import type { WhiskeyTagStat } from '../types';

const MIN_RADIUS = 42;
const MAX_RADIUS = 78;
const TAG_FILTERS = [
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
  const [selectedFilter, setSelectedFilter] = useState<TagFilter>('nose');
  const sorted = useMemo(() => {
    return [...tags]
      .filter((tag) => tag.category === selectedFilter)
      .sort((a, b) => b.count - a.count);
  }, [selectedFilter, tags]);
  const maxCount = sorted[0]?.count ?? 1;
  const hasIcons = sorted.some((tag) => Boolean(tag.imageUrl));
  const emptyLabel = selectedFilter === 'nose' ? '향 태그가 아직 없습니다.' : '맛 태그가 아직 없습니다.';

  return (
    <section className="wf-detail-tags wf-box wf-box--solid" aria-label="Tasting tags">
      <div className="wf-detail-tags__head">
        <h2 className="wf-section-title">TASTING TAGS</h2>
        <div
          className="wf-tabs wf-detail-tags__toggle"
          data-active={selectedFilter}
          role="tablist"
          aria-label="태그 종류 선택"
        >
          <span className="wf-tabs__pill" aria-hidden="true" />
          {TAG_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={selectedFilter === filter.value}
              className={`wf-tab-item${selectedFilter === filter.value ? ' wf-tab-item--on' : ''}`}
              onClick={() => setSelectedFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="wf-text-sm wf-detail-tags__empty">{emptyLabel}</p>
      ) : (
        <ul className={`wf-detail-tags__grid${hasIcons ? ' wf-detail-tags__grid--icons' : ''}`}>
          {sorted.map((tag) => {
            const ratio = tag.count / maxCount;
            const radius = bubbleSize(tag.count, maxCount);
            const tooltip = getTagTooltip(tag.name);

            return (
              <li key={tag.tagId} className="wf-detail-tags__item">
                <div className="wf-detail-tags__item-wrap">
                  <button
                    type="button"
                    className={`wf-detail-tags__bubble${tag.imageUrl ? ' wf-detail-tags__bubble--icon' : ''}`}
                    style={
                      tag.imageUrl
                        ? { width: radius * 2, height: radius * 2 }
                        : {
                            width: radius * 2,
                            height: radius * 2,
                            backgroundColor: heatColor(ratio),
                          }
                    }
                    onClick={() => onTagClick?.(tag)}
                    aria-describedby={tooltip ? `tag-tooltip-${tag.tagId}` : undefined}
                  >
                    {tag.imageUrl ? (
                      <img src={tag.imageUrl} alt={tag.name} className="wf-detail-tags__image" />
                    ) : (
                      <span className="wf-detail-tags__count">{tag.count}</span>
                    )}
                  </button>

                  {tooltip ? (
                    <div
                      id={`tag-tooltip-${tag.tagId}`}
                      className="wf-detail-tags__tooltip"
                      role="tooltip"
                    >
                      <p className="wf-detail-tags__tooltip-title">
                        {tooltip.englishName} / {tag.name}
                      </p>
                      <p className="wf-detail-tags__tooltip-desc">{tooltip.description}</p>
                      <p className="wf-detail-tags__tooltip-examples">
                        <span className="wf-detail-tags__tooltip-label">예시</span>
                        {tooltip.examples}
                      </p>
                    </div>
                  ) : null}
                </div>
                <span className="wf-detail-tags__name">
                  {tag.name}
                  <span className="wf-detail-tags__name-count">({tag.count})</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

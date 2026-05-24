import type {
  TagCategory,
  TastingAxisKey,
  TastingAxisView,
  TastingSummarySource,
  WhiskeyDetail,
  WhiskeyNoteScores,
  WhiskeyTagStat,
} from '../types';

const AXIS_META: Record<TastingAxisKey, { label: string; categories: TagCategory[] }> = {
  nose: { label: '코 Nose', categories: ['nose'] },
  palate: { label: '맛 Palate', categories: ['taste'] },
  finish: { label: '완료 Finish', categories: ['finish'] },
};

function scoreForAxis(note: WhiskeyNoteScores, axis: TastingAxisKey): number {
  if (axis === 'nose') {
    const values = [note.sweet_score, note.smoky_score].filter((v): v is number => v != null);
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }
  if (axis === 'palate') {
    return note.body_score ?? 0;
  }
  return note.finish_score ?? 0;
}

function topTagLabels(tags: WhiskeyTagStat[], categories: TagCategory[], limit = 2): string[] {
  return tags
    .filter((tag) => categories.includes(tag.category))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((tag) => tag.name);
}

export function buildTastingAxes(
  detail: WhiskeyDetail,
  source: TastingSummarySource,
): TastingAxisView[] {
  const note = source === 'official' ? detail.officialNote : detail.userAvgNote;
  if (!note) return [];

  return (Object.keys(AXIS_META) as TastingAxisKey[]).map((key) => ({
    key,
    label: AXIS_META[key].label,
    score: scoreForAxis(note, key),
    tagLabels: topTagLabels(detail.tags, AXIS_META[key].categories),
  }));
}

export function hasOfficialNote(detail: WhiskeyDetail): boolean {
  return detail.officialNote != null;
}

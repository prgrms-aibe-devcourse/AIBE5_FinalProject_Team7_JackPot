import type {
  TastingAxisKey,
  TastingAxisView,
  WhiskeyDetail,
} from '../types';

export function buildTastingAxes(detail: WhiskeyDetail): TastingAxisView[] {
  if (!detail.noteSummary) return [];

  return detail.noteSummary.tasteItems.map((item) => ({
    key: item.key as TastingAxisKey,
    label: item.label,
    score: item.score,
    tagLabels: [],
  }));
}

export function hasOfficialNote(_detail: WhiskeyDetail): boolean {
  return false;
}

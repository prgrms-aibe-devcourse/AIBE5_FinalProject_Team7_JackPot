const WHISKEY_TYPE_LABELS: Record<string, string> = {
  single_malt: '싱글몰트',
  blended: '블렌디드',
  bourbon: '버번',
  rye: '라이',
  etc: '기타',
};

export function formatWhiskeyType(type?: string | null): string {
  if (!type) return '';
  return WHISKEY_TYPE_LABELS[type] ?? type;
}

/** Pick/위시 호버 등 — `싱글몰트 · 40%` 형식 */
export function formatWhiskeySpec(type?: string | null, abv?: number | string | null): string {
  const typeLabel = formatWhiskeyType(type);
  const abvRaw = abv == null || abv === '' ? '' : String(abv).replace(/%$/, '').trim();
  const abvLabel = abvRaw && abvRaw !== '-' ? `${abvRaw}%` : '';
  return [typeLabel, abvLabel].filter(Boolean).join(' · ');
}

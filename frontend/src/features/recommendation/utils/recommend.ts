import type { RecommendedWhiskey, TasteResult } from '../api/recommendationApi';

/**
 * 로컬 추천 엔진 (서버 REC-01 연동 전 임시)
 * - 취향 점수 5종과 위스키 프로필의 거리(유클리드)로 가장 가까운 3종 선정
 * - 매칭이 강한 축을 근거로 간단한 추천 이유 문장 생성
 */

interface WhiskeyProfile {
  sweet: number;
  body: number;
  smoky: number;
  spicy: number;
  finish: number;
}

interface CatalogEntry {
  id: number;
  name: string;
  profile: WhiskeyProfile;
  tags: string[];
}

/** 취향 점수 키 ↔ 프로필 키 ↔ 표현 문구 */
const DIMS = [
  { key: 'sweetScore', pkey: 'sweet', high: '달콤한 단맛', low: '드라이하고 담백한 풍미' },
  { key: 'bodyScore', pkey: 'body', high: '묵직한 바디', low: '가벼운 바디' },
  { key: 'smokyScore', pkey: 'smoky', high: '스모키한 피트 향', low: '스모키함이 절제된 풍미' },
  { key: 'spicyScore', pkey: 'spicy', high: '알싸한 스파이시함', low: '순하고 부드러운 풍미' },
  { key: 'finishScore', pkey: 'finish', high: '길게 남는 여운', low: '짧고 깔끔한 피니시' },
] as const;

const CATALOG: CatalogEntry[] = [
  { id: 1, name: '글렌피딕 12', profile: { sweet: 5, body: 4, smoky: 1, spicy: 3, finish: 4 }, tags: ['사과', '배', '바닐라'] },
  { id: 2, name: '글렌모렌지 10', profile: { sweet: 6, body: 3, smoky: 1, spicy: 4, finish: 5 }, tags: ['시트러스', '바닐라', '꿀'] },
  { id: 3, name: '발베니 더블우드 12', profile: { sweet: 7, body: 6, smoky: 1, spicy: 4, finish: 6 }, tags: ['꿀', '바닐라', '오크'] },
  { id: 4, name: '맥캘란 12 셰리', profile: { sweet: 8, body: 7, smoky: 2, spicy: 5, finish: 7 }, tags: ['베리', '캐러멜', '초콜릿'] },
  { id: 5, name: '글렌드로낙 12', profile: { sweet: 8, body: 7, smoky: 2, spicy: 6, finish: 7 }, tags: ['베리', '캐러멜', '견과류'] },
  { id: 6, name: '탈리스커 10', profile: { sweet: 4, body: 7, smoky: 7, spicy: 8, finish: 7 }, tags: ['후추', '연기', '짠맛'] },
  { id: 7, name: '라가불린 16', profile: { sweet: 4, body: 8, smoky: 9, spicy: 6, finish: 9 }, tags: ['연기', '오크', '가죽'] },
  { id: 8, name: '아드벡 10', profile: { sweet: 3, body: 7, smoky: 9, spicy: 7, finish: 8 }, tags: ['연기', '시트러스', '후추'] },
];

function distance(user: TasteResult, w: CatalogEntry): number {
  return DIMS.reduce((sum, d) => {
    const diff = user[d.key] - w.profile[d.pkey];
    return sum + diff * diff;
  }, 0);
}

function buildReason(user: TasteResult, w: CatalogEntry): string {
  const hits: { pull: number; word: string }[] = [];
  for (const d of DIMS) {
    const u = user[d.key];
    const p = w.profile[d.pkey];
    if (u >= 7 && p >= 6) hits.push({ pull: u + p, word: d.high });
    else if (u <= 3 && p <= 4) hits.push({ pull: 20 - u - p, word: d.low });
  }
  hits.sort((a, b) => b.pull - a.pull);
  const top = hits.slice(0, 2).map((h) => h.word);

  const picked = new Set([...user.nose_tags, ...user.taste_tags]);
  const overlap = w.tags.filter((t) => picked.has(t));

  let reason = top.length
    ? `${top.join(' · ')} 취향에 잘 맞는 한 잔이에요.`
    : '균형 잡힌 취향에 두루 어울리는 한 잔이에요.';
  if (overlap.length) {
    reason += ` 고르신 ${overlap.slice(0, 2).join('·')} 노트도 느낄 수 있어요.`;
  }
  return reason;
}

/** 취향 결과 → 추천 위스키 3종 */
export function buildRecommendations(user: TasteResult): RecommendedWhiskey[] {
  return [...CATALOG]
    .sort((a, b) => distance(user, a) - distance(user, b))
    .slice(0, 3)
    .map((w) => ({ id: w.id, name: w.name, reason: buildReason(user, w), tags: w.tags }));
}

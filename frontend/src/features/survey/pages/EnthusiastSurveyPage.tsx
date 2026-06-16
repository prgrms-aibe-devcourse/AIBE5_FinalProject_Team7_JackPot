import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { enthusiastSurveyApi } from '../api/enthusiastSurveyApi';
import type { SurveyApiRequest } from '../api/surveyApi';
import '../survey.css';

/* ───────── Q1~Q5 점수형 문항 정의 ───────── */

interface ScoreOption { text: string }
interface ScoreQuestion {
  key: 'bodyScore' | 'finishScore' | 'smokyScore' | 'spicyScore' | 'sweetScore';
  short: string;
  title: string;
  options: ScoreOption[];
}

const SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    key: 'bodyScore',
    short: 'Body',
    title: 'Q1. 선호하는 바디감은 어느 쪽에 가까우신가요?',
    options: [
      { text: '라이트 바디 (섬세하고 드라이한 스타일)' },
      { text: '라이트~미디엄 바디' },
      { text: '미디엄 바디 (균형 잡힌 무게감)' },
      { text: '미디엄~풀 바디' },
      { text: '풀 바디 (오일리하고 묵직한 마우스필)' },
    ],
  },
  {
    key: 'finishScore',
    short: 'Finish',
    title: 'Q2. 피니시는 어떤 스타일을 선호하시나요?',
    options: [
      { text: '숏 피니시 (깔끔한 마무리)' },
      { text: '숏~미디엄 피니시' },
      { text: '미디엄 피니시' },
      { text: '미디엄~롱 피니시' },
      { text: '롱 피니시 (복합적인 여운이 오래 지속)' },
    ],
  },
  {
    key: 'smokyScore',
    short: 'Smoky',
    title: 'Q3. 피트(스모키) 캐릭터는 어느 정도를 선호하시나요?',
    options: [
      { text: '언피티드만 선호' },
      { text: '아주 은은한 피트 정도' },
      { text: '라이트~미디엄 피트' },
      { text: '미디엄~헤비 피트' },
      { text: '헤비 피트 (아일라 스타일을 적극 선호)' },
    ],
  },
  {
    key: 'spicyScore',
    short: 'Spicy',
    title: 'Q4. 스파이시한 캐릭터는 어떤 편이 좋으신가요?',
    options: [
      { text: '거의 없는 편' },
      { text: '은은한 향신료 정도' },
      { text: '적당한 페퍼 노트' },
      { text: '존재감 있는 스파이스' },
      { text: '라이 위스키 수준의 강렬한 스파이스' },
    ],
  },
  {
    key: 'sweetScore',
    short: 'Sweet',
    title: 'Q5. 달콤함과 드라이함 중 어디에 더 끌리시나요?',
    options: [
      { text: '매우 드라이' },
      { text: '약간 드라이' },
      { text: '균형형' },
      { text: '달콤한 편' },
      { text: '셰리/버번 스타일의 풍부한 단맛' },
    ],
  },
];

/* ───────── Q6 스타일 선택 ───────── */

interface StyleItem { key: string; label: string }
interface StyleGroup { group: string; styles: StyleItem[] }

const STYLE_GROUPS: StyleGroup[] = [
  {
    group: 'Scotch',
    styles: [
      { key: 'single_malt',     label: '싱글 몰트' },
      { key: 'blended_malt',    label: '블렌디드 몰트' },
      { key: 'blended_scotch',  label: '블렌디드 스카치' },
    ],
  },
  {
    group: 'American',
    styles: [
      { key: 'bourbon',   label: '버번' },
      { key: 'rye',       label: '라이' },
      { key: 'tennessee', label: '테네시' },
    ],
  },
  {
    group: '기타',
    styles: [
      { key: 'irish',     label: '아이리시' },
      { key: 'japanese',  label: '일본 위스키' },
      { key: 'canadian',  label: '캐나다 위스키' },
      { key: 'others',    label: '기타' },
    ],
  },
];

/* ───────── Q7 Nose 태그 ───────── */

interface TagItem { id: number; name: string }
interface TagGroup { group: string; tags: TagItem[] }

const NOSE_GROUPS: TagGroup[] = [
  { group: '과일', tags: [
    { id: 200, name: '사과' }, { id: 201, name: '배' },
    { id: 1,   name: '시트러스' }, { id: 202, name: '열대과일' },
    { id: 2,   name: '베리' }, { id: 203, name: '건과일' },
  ]},
  { group: '달콤', tags: [
    { id: 7,   name: '꿀' }, { id: 8,   name: '바닐라' },
    { id: 9,   name: '캐러멜' }, { id: 204, name: '토피' },
    { id: 10,  name: '초콜릿' },
  ]},
  { group: '곡물·식물', tags: [
    { id: 205, name: '몰트' }, { id: 5,   name: '곡물' },
    { id: 4,   name: '허브' }, { id: 206, name: '플로럴' },
  ]},
  { group: '오크·향신료', tags: [
    { id: 15,  name: '오크' }, { id: 13,  name: '시나몬' },
    { id: 12,  name: '후추' }, { id: 207, name: '정향' },
    { id: 16,  name: '가죽' }, { id: 208, name: '담배' },
  ]},
  { group: '피트', tags: [
    { id: 209, name: '연기' }, { id: 210, name: '바다' },
    { id: 211, name: '요오드' }, { id: 212, name: '약품향' },
    { id: 18,  name: '흙내음' },
  ]},
];

/* ───────── Q8 Taste 태그 ───────── */

const TASTE_GROUPS: TagGroup[] = [
  { group: '과일', tags: [
    { id: 101, name: '시트러스' }, { id: 213, name: '사과' },
    { id: 102, name: '베리' }, { id: 214, name: '건포도' },
    { id: 215, name: '열대과일' },
  ]},
  { group: '달콤', tags: [
    { id: 106, name: '꿀' }, { id: 107, name: '바닐라' },
    { id: 108, name: '캐러멜' }, { id: 109, name: '초콜릿' },
    { id: 216, name: '토피' },
  ]},
  { group: '기타', tags: [
    { id: 105, name: '견과류' }, { id: 110, name: '커피' },
    { id: 217, name: '몰트' }, { id: 103, name: '허브' },
    { id: 111, name: '오크' }, { id: 218, name: '스파이스' },
    { id: 112, name: '피트' }, { id: 114, name: '소금기' },
    { id: 219, name: '가죽' },
  ]},
];

/* ───────── Q9 탐험 성향 ───────── */

const EXPLORATION_OPTIONS = [
  { level: 1 as const, label: '아니요, 평소 좋아하는 취향 위주로 추천해주세요.', sub: '보수형 · λ=0.9' },
  { level: 2 as const, label: '비슷한 스타일이면 좋아요.',                        sub: '균형형 · λ=0.7' },
  { level: 3 as const, label: '네, 평소 취향과 다른 위스키도 추천받고 싶어요.',   sub: '탐험형 · λ=0.5' },
];

/* ───────── Nav 스텝 ───────── */

const NAV_STEPS = [
  ...SCORE_QUESTIONS.map((q, i) => ({ id: `q-${q.key}`, label: `Q${i + 1}` })),
  { id: 'q-style',       label: 'Q6' },
  { id: 'q-nose',        label: 'Q7' },
  { id: 'q-taste',       label: 'Q8' },
  { id: 'q-exploration', label: 'Q9' },
];
const TOTAL_STEPS = NAV_STEPS.length;

/* ───────── 페이지 ───────── */

export default function EnthusiastSurveyPage() {
  const navigate = useNavigate();

  const [scores, setScores] = useState<Partial<Record<ScoreQuestion['key'], number>>>({});
  const [styleTags, setStyleTags]   = useState<string[]>([]);
  // intensity: 태그별 강도 1(좋아함) / 2(매우 좋아함), 없으면 미선택
  const [noseTags,   setNoseTags]   = useState<Record<number, 1 | 2>>({});
  const [tasteTags,  setTasteTags]  = useState<Record<number, 1 | 2>>({});
  const [exploration, setExploration] = useState<1 | 2 | 3 | null>(null);
  const [activeId, setActiveId]       = useState<string>('q-bodyScore');
  const [submitting, setSubmitting]   = useState(false);

  const answeredCount = SCORE_QUESTIONS.filter((q) => scores[q.key] != null).length;
  const allScored     = answeredCount === SCORE_QUESTIONS.length;
  const showStyle     = allScored;
  const showNose      = showStyle && styleTags.length > 0;
  const showTaste     = showNose  && Object.keys(noseTags).length > 0;
  const showExplore   = showTaste && Object.keys(tasteTags).length > 0;
  const canSubmit     = showExplore && exploration != null;

  const completedCount =
    answeredCount +
    (styleTags.length > 0                   ? 1 : 0) +
    (Object.keys(noseTags).length > 0       ? 1 : 0) +
    (Object.keys(tasteTags).length > 0      ? 1 : 0) +
    (exploration != null                    ? 1 : 0);
  const progressPercent = Math.round((completedCount / TOTAL_STEPS) * 100);

  const doneIds = new Set<string>();
  SCORE_QUESTIONS.forEach((q) => { if (scores[q.key] != null) doneIds.add(`q-${q.key}`); });
  if (styleTags.length > 0)              doneIds.add('q-style');
  if (Object.keys(noseTags).length > 0)  doneIds.add('q-nose');
  if (Object.keys(tasteTags).length > 0) doneIds.add('q-taste');
  if (exploration != null)               doneIds.add('q-exploration');

  const availIds = new Set<string>(['q-bodyScore']);
  SCORE_QUESTIONS.forEach((q, i) => {
    if (i > 0 && scores[SCORE_QUESTIONS[i - 1].key] != null) availIds.add(`q-${q.key}`);
  });
  if (allScored)    availIds.add('q-style');
  if (showNose)     availIds.add('q-nose');
  if (showTaste)    availIds.add('q-taste');
  if (showExplore)  availIds.add('q-exploration');

  const blockRefs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );
    Object.values(blockRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [answeredCount, allScored, showNose, showTaste, showExplore]);

  const setScore = (key: ScoreQuestion['key'], choice: number) =>
    setScores((prev) => ({ ...prev, [key]: choice }));

  const toggleStyle = (key: string) =>
    setStyleTags((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );

  // 클릭 사이클: 미선택 → +1 → +2 → 미선택
  const cycleTag = (
    map: Record<number, 1 | 2>,
    setMap: (v: Record<number, 1 | 2>) => void,
    id: number,
  ) => {
    const cur = map[id];
    if (cur == null) {
      setMap({ ...map, [id]: 1 });
    } else if (cur === 1) {
      setMap({ ...map, [id]: 2 });
    } else {
      const next = { ...map };
      delete next[id];
      setMap(next);
    }
  };

  const goTo = (id: string) =>
    blockRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload: SurveyApiRequest = {
        bodyChoice:       scores.bodyScore!,
        finishChoice:     scores.finishScore!,
        smokyChoice:      scores.smokyScore!,
        spicyChoice:      scores.spicyScore!,
        sweetChoice:      scores.sweetScore!,
        styleTags,
        noseTagWeights:   noseTags,
        tasteTagWeights:  tasteTags,
        explorationLevel: exploration!,
      };
      const result = await enthusiastSurveyApi.submit(payload);
      navigate(PATHS.RECOMMEND, { state: { result, payload, surveyType: 'enthusiast' } });
    } catch {
      alert('결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 태그 버튼 스타일 helper ── */
  const tagClass = (intensity: 1 | 2 | undefined) => {
    if (intensity == null) return 'wf-chip';
    if (intensity === 1)   return 'wf-chip wf-chip--on';
    return 'wf-chip wf-chip--on wf-chip--strong';
  };
  const tagLabel = (name: string, intensity: 1 | 2 | undefined) => {
    if (intensity == null) return name;
    if (intensity === 1)   return `${name} +1`;
    return `${name} +2`;
  };

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />

      <div className="wf-page wf-survey-scroll">
        <div className="wf-survey-layout">
          <main className="wf-survey-main">
            <header className="wf-survey-intro">
              <div>
                <p className="wf-text-label">애호가 설문</p>
                <h1 className="wf-title wf-survey-intro__title">위스키 애호가 취향 분석</h1>
                <p className="wf-subtitle wf-survey-intro__subtitle">
                  총 9문항 / 2~3분 소요 · 정교한 취향 기반 추천을 받아보세요.
                </p>
              </div>
              <div className="wf-survey-progress" aria-label={`설문 진행률 ${progressPercent}%`}>
                <div className="wf-survey-progress__label">
                  <span>진행률</span>
                  <strong>{completedCount}/{TOTAL_STEPS}</strong>
                </div>
                <div className="wf-survey-progress__track">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </header>

            {/* Q1~Q5 점수형 단일 선택 */}
            {SCORE_QUESTIONS.map((q, idx) => {
              const visible = idx === 0 || scores[SCORE_QUESTIONS[idx - 1].key] != null;
              if (!visible) return null;
              return (
                <section
                  key={q.key}
                  id={`q-${q.key}`}
                  ref={(el) => { blockRefs.current[`q-${q.key}`] = el; }}
                  className="wf-box wf-survey-q"
                >
                  <div className="wf-survey-q__head">
                    <span className="wf-survey-q__step">{q.short}</span>
                    <h2 className="wf-title">{q.title}</h2>
                  </div>
                  <div className="wf-survey-opts">
                    {q.options.map((opt, oi) => {
                      const choice = oi + 1;
                      const on = scores[q.key] === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          className={`wf-opt${on ? ' wf-opt--on' : ''}`}
                          onClick={() => setScore(q.key, choice)}
                        >
                          <span className="wf-opt__ordinal">{choice}</span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Q6 스타일 선택 (복수 선택) */}
            {showStyle && (
              <section
                id="q-style"
                ref={(el) => { blockRefs.current['q-style'] = el; }}
                className="wf-box wf-survey-q"
              >
                <p className="wf-text-label">style_tags · 복수 선택</p>
                <h2 className="wf-title wf-survey-q__h2">Q6. 평소 선호하는 위스키 스타일을 선택해주세요.</h2>
                {STYLE_GROUPS.map((g) => (
                  <div key={g.group} className="wf-survey-tag-group">
                    <p className="wf-text-sm wf-survey-tag-label">{g.group}</p>
                    <div className="wf-chips">
                      {g.styles.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          className={`wf-chip${styleTags.includes(s.key) ? ' wf-chip--on' : ''}`}
                          onClick={() => toggleStyle(s.key)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Q7 Nose 태그 + 강도 */}
            {showNose && (
              <section
                id="q-nose"
                ref={(el) => { blockRefs.current['q-nose'] = el; }}
                className="wf-box wf-survey-q"
              >
                <p className="wf-text-label">nose_tags · 복수 선택 + 선호도</p>
                <h2 className="wf-title wf-survey-q__h2">Q7. Nose에서 선호하는 노트를 선택해주세요.</h2>
                <p className="wf-text-sm wf-survey-tag-label" style={{ marginBottom: 12 }}>
                  한 번 클릭 = 좋아함(+1) · 두 번 클릭 = 매우 좋아함(+2) · 세 번 클릭 = 해제
                </p>
                {NOSE_GROUPS.map((g) => (
                  <div key={g.group} className="wf-survey-tag-group">
                    <p className="wf-text-sm wf-survey-tag-label">{g.group}</p>
                    <div className="wf-chips">
                      {g.tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          className={tagClass(noseTags[tag.id])}
                          onClick={() => cycleTag(noseTags, setNoseTags, tag.id)}
                        >
                          {tagLabel(tag.name, noseTags[tag.id])}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Q8 Taste 태그 + 강도 */}
            {showTaste && (
              <section
                id="q-taste"
                ref={(el) => { blockRefs.current['q-taste'] = el; }}
                className="wf-box wf-survey-q"
              >
                <p className="wf-text-label">taste_tags · 복수 선택 + 선호도</p>
                <h2 className="wf-title wf-survey-q__h2">Q8. Palate에서 선호하는 노트를 선택해주세요.</h2>
                <p className="wf-text-sm wf-survey-tag-label" style={{ marginBottom: 12 }}>
                  한 번 클릭 = 좋아함(+1) · 두 번 클릭 = 매우 좋아함(+2) · 세 번 클릭 = 해제
                </p>
                {TASTE_GROUPS.map((g) => (
                  <div key={g.group} className="wf-survey-tag-group">
                    <p className="wf-text-sm wf-survey-tag-label">{g.group}</p>
                    <div className="wf-chips">
                      {g.tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          className={tagClass(tasteTags[tag.id])}
                          onClick={() => cycleTag(tasteTags, setTasteTags, tag.id)}
                        >
                          {tagLabel(tag.name, tasteTags[tag.id])}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Q9 탐험 성향 */}
            {showExplore && (
              <section
                id="q-exploration"
                ref={(el) => { blockRefs.current['q-exploration'] = el; }}
                className="wf-box wf-survey-q"
              >
                <p className="wf-text-label">exploration_level · 단일 선택</p>
                <h2 className="wf-title wf-survey-q__h2">Q9. 새로운 스타일을 탐험해보고 싶으신가요?</h2>
                <div className="wf-survey-opts">
                  {EXPLORATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      className={`wf-opt${exploration === opt.level ? ' wf-opt--on' : ''}`}
                      onClick={() => setExploration(opt.level)}
                    >
                      <span className="wf-opt__ordinal">{opt.level}</span>
                      <span>
                        {opt.label}
                        <small style={{ display: 'block', opacity: 0.6, fontSize: '0.8em', marginTop: 2 }}>
                          {opt.sub}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {canSubmit && (
              <Button block className="wf-survey-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '분석 중...' : '결과 확인하기'}
              </Button>
            )}
          </main>

          {/* 우측 sticky 네비 */}
          <nav className="wf-survey-nav" aria-label="설문 문항 이동">
            <p className="wf-survey-nav__title">문항</p>
            <ul className="wf-survey-nav__list">
              {NAV_STEPS.map((step) => {
                const reachable = availIds.has(step.id);
                const done      = doneIds.has(step.id);
                const active    = activeId === step.id;
                const cls = [
                  'wf-survey-nav__item',
                  done   ? 'wf-survey-nav__item--done'   : '',
                  active ? 'wf-survey-nav__item--active' : '',
                  reachable ? '' : 'wf-survey-nav__item--locked',
                ].filter(Boolean).join(' ');
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      className={cls}
                      disabled={!reachable}
                      onClick={() => goTo(step.id)}
                    >
                      {step.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

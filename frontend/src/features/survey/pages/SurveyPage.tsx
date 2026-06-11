import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { surveyApi, type SurveyApiRequest } from '../api/surveyApi';

/* ───────── 설문 정의 ───────── */

interface ScoreOption {
  text: string;
}
interface ScoreQuestion {
  key: 'sweetScore' | 'bodyScore' | 'smokyScore' | 'spicyScore' | 'finishScore';
  short: string;
  title: string;
  options: ScoreOption[];
}

const SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    key: 'sweetScore',
    short: 'Sweet',
    title: 'Q1. 평소 어떤 디저트를 더 좋아하세요?',
    options: [
      { text: '크래커, 참크래커 같은 담백한 과자' },
      { text: '버터쿠키, 마들렌' },
      { text: '카스테라, 롤케이크' },
      { text: '초코쿠키, 브라우니' },
      { text: '캐러멜 케이크, 진한 초콜릿 디저트' },
    ],
  },
  {
    key: 'bodyScore',
    short: 'Body',
    title: 'Q2. 새로운 술을 마신다면 어떤 스타일에 더 끌리나요?',
    options: [
      { text: '가볍고 부담 없는 스타일' },
      { text: '깔끔하고 산뜻한 스타일' },
      { text: '균형 잡힌 스타일' },
      { text: '진하고 풍부한 스타일' },
      { text: '묵직하고 강렬한 스타일' },
    ],
  },
  {
    key: 'smokyScore',
    short: 'Smoky',
    title: 'Q3. 고기 굽는 냄새나 캠핑 모닥불 냄새는?',
    options: [
      { text: '정말 싫다' },
      { text: '별로 좋아하지 않는다' },
      { text: '있으면 나쁘지 않다' },
      { text: '꽤 좋아한다' },
      { text: '그 냄새 때문에 캠핑이 좋다' },
    ],
  },
  {
    key: 'spicyScore',
    short: 'Spicy',
    title: 'Q4. 시나몬, 생강차, 후추향은?',
    options: [
      { text: '싫다' },
      { text: '별로 안 좋아한다' },
      { text: '괜찮다' },
      { text: '좋아한다' },
      { text: '정말 좋아한다' },
    ],
  },
  {
    key: 'finishScore',
    short: 'Finish',
    title: 'Q5. 맛있는 음식을 먹고 난 뒤',
    options: [
      { text: '깔끔하게 끝나는 게 좋다' },
      { text: '약간의 여운 정도는 좋다' },
      { text: '적당한 여운이 좋다' },
      { text: '꽤 오래 남아도 좋다' },
      { text: '오래오래 기억에 남는 여운이 좋다' },
    ],
  },
];

interface TagItem {
  id: number;
  name: string;
}
interface TagGroup {
  group: string;
  tags: TagItem[];
}

const NOSE_GROUPS: TagGroup[] = [
  { group: '과일·꽃', tags: [
    { id: 1, name: '시트러스' },
    { id: 2, name: '베리류' },
    { id: 3, name: '꽃' },
  ]},
  { group: '달콤', tags: [
    { id: 7, name: '꿀' },
    { id: 8, name: '바닐라' },
    { id: 9, name: '캐러멜' },
    { id: 10, name: '초콜릿' },
  ]},
  { group: '허브·식물', tags: [
    { id: 4, name: '허브' },
    { id: 5, name: '곡물' },
    { id: 6, name: '견과류' },
    { id: 11, name: '커피' },
  ]},
  { group: '나무·향신료', tags: [
    { id: 15, name: '오크' },
    { id: 12, name: '후추' },
    { id: 13, name: '계피' },
  ]},
  { group: '개성 있는 향', tags: [
    { id: 17, name: '피트' },
    { id: 18, name: '흙' },
    { id: 16, name: '가죽' },
  ]},
];

const TASTE_GROUPS: TagGroup[] = [
  { group: '과일', tags: [
    { id: 101, name: '시트러스' },
    { id: 102, name: '베리류' },
  ]},
  { group: '달콤', tags: [
    { id: 106, name: '꿀' },
    { id: 107, name: '바닐라' },
    { id: 108, name: '캐러멜' },
    { id: 109, name: '초콜릿' },
  ]},
  { group: '기타', tags: [
    { id: 105, name: '견과류' },
    { id: 110, name: '커피' },
    { id: 103, name: '허브' },
    { id: 111, name: '오크' },
    { id: 112, name: '피트' },
    { id: 114, name: '짠맛' },
  ]},
];

/** 우측 네비 스텝 (Q1~Q7) */
const NAV_STEPS = [
  ...SCORE_QUESTIONS.map((q, i) => ({ id: `q-${q.key}`, label: `Q${i + 1}` })),
  { id: 'q-nose', label: 'Q6' },
  { id: 'q-taste', label: 'Q7' },
];

/* ───────── 페이지 ───────── */

export default function SurveyPage() {
  const navigate = useNavigate();

  const [scores, setScores] = useState<Partial<Record<ScoreQuestion['key'], number>>>({});
  const [noseTags, setNoseTags] = useState<number[]>([]);
  const [tasteTags, setTasteTags] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<string>('q-sweetScore');
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = SCORE_QUESTIONS.filter((q) => scores[q.key] != null).length;
  const allScored = answeredCount === SCORE_QUESTIONS.length;
  const showNose = allScored;
  const showTaste = showNose && noseTags.length > 0;
  const canSubmit = showTaste && tasteTags.length > 0;

  // 완료 / 도달 가능 스텝 집합
  const doneIds = new Set<string>();
  SCORE_QUESTIONS.forEach((q) => { if (scores[q.key] != null) doneIds.add(`q-${q.key}`); });
  if (noseTags.length > 0) doneIds.add('q-nose');
  if (tasteTags.length > 0) doneIds.add('q-taste');

  const availIds = new Set<string>(['q-sweetScore']);
  SCORE_QUESTIONS.forEach((q, i) => {
    if (i > 0 && scores[SCORE_QUESTIONS[i - 1].key] != null) availIds.add(`q-${q.key}`);
  });
  if (allScored) availIds.add('q-nose');
  if (showTaste) availIds.add('q-taste');

  // 스크롤 위치 → 우측 네비 현재 항목 하이라이트
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
  }, [answeredCount, allScored, showTaste]);

  // choice 1~5 저장
  const setScore = (key: ScoreQuestion['key'], choice: number) =>
    setScores((prev) => ({ ...prev, [key]: choice }));

  const toggleTag = (list: number[], set: (v: number[]) => void, id: number) =>
    set(list.includes(id) ? list.filter((t) => t !== id) : [...list, id]);

  const goTo = (id: string) =>
    blockRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const payload: SurveyApiRequest = {
        sweetChoice: scores.sweetScore!,
        bodyChoice: scores.bodyScore!,
        smokyChoice: scores.smokyScore!,
        spicyChoice: scores.spicyScore!,
        finishChoice: scores.finishScore!,
        noseTags,
        tasteTags,
      };
      const result = await surveyApi.submit(payload);
      navigate(PATHS.RECOMMEND, { state: { result, payload } });
    } catch {
      alert('결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />

      <div className="wf-page wf-survey-scroll">
        <div className="wf-survey-layout">
          {/* 본문 */}
          <main className="wf-survey-main">
            <header className="wf-survey-intro">
              <p className="wf-text-label">설문조사</p>
              <h1 className="wf-title wf-survey-intro__title">나의 위스키 취향 알아보기</h1>
              <p className="wf-subtitle wf-survey-intro__subtitle">
                7개 문항에 답하면 취향에 맞는 위스키를 추천해 드려요.
              </p>
            </header>

            {/* Q1~Q5: 점수형 단일 선택 — 순차 노출 */}
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
                  <h2 className="wf-title">{q.title}</h2>
                  <div className="wf-survey-opts">
                    {q.options.map((opt, oi) => {
                      const choice = oi + 1; // 1~5
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

            {/* Q6: 좋아하는 향 (복수 선택) */}
            {showNose && (
              <section
                id="q-nose"
                ref={(el) => { blockRefs.current['q-nose'] = el; }}
                className="wf-box wf-survey-q"
              >
                <p className="wf-text-label">nose_tags · 복수 선택</p>
                <h2 className="wf-title wf-survey-q__h2">Q6. 좋아하는 향을 골라주세요</h2>
                {NOSE_GROUPS.map((g) => (
                  <div key={g.group} className="wf-survey-tag-group">
                    <p className="wf-text-sm wf-survey-tag-label">{g.group}</p>
                    <div className="wf-chips">
                      {g.tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          className={`wf-chip${noseTags.includes(tag.id) ? ' wf-chip--on' : ''}`}
                          onClick={() => toggleTag(noseTags, setNoseTags, tag.id)}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Q7: 좋아하는 맛 (복수 선택) */}
            {showTaste && (
              <section
                id="q-taste"
                ref={(el) => { blockRefs.current['q-taste'] = el; }}
                className="wf-box wf-survey-q"
              >
                <p className="wf-text-label">taste_tags · 복수 선택</p>
                <h2 className="wf-title wf-survey-q__h2">Q7. 좋아하는 맛을 골라주세요</h2>
                {TASTE_GROUPS.map((g) => (
                  <div key={g.group} className="wf-survey-tag-group">
                    <p className="wf-text-sm wf-survey-tag-label">{g.group}</p>
                    <div className="wf-chips">
                      {g.tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          className={`wf-chip${tasteTags.includes(tag.id) ? ' wf-chip--on' : ''}`}
                          onClick={() => toggleTag(tasteTags, setTasteTags, tag.id)}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {canSubmit && (
              <Button block className="wf-survey-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '분석 중...' : '저장'}
              </Button>
            )}
          </main>

          {/* 우측 sticky 네비 */}
          <nav className="wf-survey-nav" aria-label="설문 문항 이동">
            <p className="wf-survey-nav__title">문항</p>
            <ul className="wf-survey-nav__list">
              {NAV_STEPS.map((step) => {
                const reachable = availIds.has(step.id);
                const done = doneIds.has(step.id);
                const active = activeId === step.id;
                const cls = [
                  'wf-survey-nav__item',
                  done ? 'wf-survey-nav__item--done' : '',
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

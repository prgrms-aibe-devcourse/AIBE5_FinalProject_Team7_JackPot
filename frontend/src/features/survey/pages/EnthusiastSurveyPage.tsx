import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/components/ui/Toast';
import { enthusiastSurveyApi } from '../api/enthusiastSurveyApi';
import type { SurveyApiRequest } from '../api/surveyApi';
import { useTags } from '../hooks/useTags';
import { SurveySidebar } from '../components/SurveySidebar';
import '../survey.css';

/* ───────── Q1~Q5 점수형 문항 정의 ───────── */

interface ScoreOption { text: string }
interface ScoreQuestion {
  key: 'bodyScore' | 'finishScore' | 'smokyScore' | 'spicyScore' | 'sweetScore';
  title: string;
  options: ScoreOption[];
}

const SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    key: 'bodyScore',
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


/* ───────── Q9 숙성 연수 선호 ───────── */

const AGE_OPTIONS = [
  { key: 'any',    label: '숙성 연수는 상관없어요', sub: '전체에서 추천',   min: null, max: null },
  { key: 'entry',  label: '엔트리급이 좋아요',       sub: 'NAS · 8년 이하', min: null, max: 8 },
  { key: 'middle', label: '적당히 숙성된 게 좋아요',  sub: '9~15년',         min: 9,    max: 15 },
  { key: 'old',    label: '오래 숙성된 게 좋아요',    sub: '16년 이상',      min: 16,   max: null },
] as const;

/* ───────── Nav 스텝 ───────── */

const NAV_STEPS = [
  ...SCORE_QUESTIONS.map((q, i) => ({ id: `q-${q.key}`, label: `Q${i + 1}` })),
  { id: 'q-style',       label: 'Q6' },
  { id: 'q-age',         label: 'Q7' },
  { id: 'q-nose',        label: 'Q8' },
  { id: 'q-taste',       label: 'Q9' },
];
const TOTAL_STEPS = NAV_STEPS.length;

/* ───────── 페이지 ───────── */

export default function EnthusiastSurveyPage() {
  const navigate = useNavigate();

  const [scores, setScores] = useState<Partial<Record<ScoreQuestion['key'], number>>>({});
  const [styleTags, setStyleTags] = useState<string[]>([]);
  // 단순 선택/해제 (가중치 없음)
  const [noseTags,  setNoseTags]  = useState<number[]>([]);
  const [tasteTags, setTasteTags] = useState<number[]>([]);
  const [agePref, setAgePref] = useState<string | null>(null);
  const [activeId, setActiveId]       = useState<string>('q-bodyScore');
  const [submitting, setSubmitting]   = useState(false);

  // 향/맛 태그는 서버에서 조회 (프론트 하드코딩 제거)
  const { data: noseTagList = [], isLoading: noseLoading } = useTags('nose');
  const { data: tasteTagList = [], isLoading: tasteLoading } = useTags('taste');

  const answeredCount = SCORE_QUESTIONS.filter((q) => scores[q.key] != null).length;
  const allScored     = answeredCount === SCORE_QUESTIONS.length;
  const showStyle     = allScored;
  const showAge       = showStyle && styleTags.length > 0;
  const showNose      = showAge && agePref != null;
  // Q8(향)·Q9(맛)은 숙성 연수를 고르면 동시에 등장
  const showTaste     = showNose;
  const canSubmit     = showNose && noseTags.length > 0 && tasteTags.length > 0;

  const completedCount =
    answeredCount +
    (styleTags.length > 0  ? 1 : 0) +
    (noseTags.length > 0   ? 1 : 0) +
    (tasteTags.length > 0  ? 1 : 0) +
    (agePref != null       ? 1 : 0);
  const progressPercent = Math.round((completedCount / TOTAL_STEPS) * 100);

  const doneIds = new Set<string>();
  SCORE_QUESTIONS.forEach((q) => { if (scores[q.key] != null) doneIds.add(`q-${q.key}`); });
  if (styleTags.length > 0) doneIds.add('q-style');
  if (noseTags.length > 0)  doneIds.add('q-nose');
  if (tasteTags.length > 0) doneIds.add('q-taste');
  if (agePref != null)      doneIds.add('q-age');

  const availIds = new Set<string>(['q-bodyScore']);
  SCORE_QUESTIONS.forEach((q, i) => {
    if (i > 0 && scores[SCORE_QUESTIONS[i - 1].key] != null) availIds.add(`q-${q.key}`);
  });
  if (allScored)    availIds.add('q-style');
  if (showAge)      availIds.add('q-age');
  if (showNose)     availIds.add('q-nose');
  if (showTaste)    availIds.add('q-taste');

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
  }, [answeredCount, allScored, showStyle, showAge, showNose]);

  // 점수 선택 후 다음 문항으로 자동 스크롤 (마지막 점수 → 스타일)
  const setScore = (key: ScoreQuestion['key'], choice: number) => {
    setScores((prev) => ({ ...prev, [key]: choice }));
    const idx = SCORE_QUESTIONS.findIndex((q) => q.key === key);
    const nextId = idx < SCORE_QUESTIONS.length - 1
      ? `q-${SCORE_QUESTIONS[idx + 1].key}`
      : 'q-style';
    window.setTimeout(() => goTo(nextId), 120);
  };

  // 숙성 연수 선택(단일) 후 향/맛으로 스크롤
  const chooseAge = (key: string) => {
    setAgePref(key);
    window.setTimeout(() => goTo('q-nose'), 120);
  };

  const toggleStyle = (key: string) =>
    setStyleTags((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );

  const toggleTag = (list: number[], set: (v: number[]) => void, id: number) =>
    set(list.includes(id) ? list.filter((t) => t !== id) : [...list, id]);

  const goTo = (id: string) =>
    blockRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const ageOpt = AGE_OPTIONS.find((o) => o.key === agePref);
      const payload: SurveyApiRequest = {
        bodyChoice:       scores.bodyScore!,
        finishChoice:     scores.finishScore!,
        smokyChoice:      scores.smokyScore!,
        spicyChoice:      scores.spicyScore!,
        sweetChoice:      scores.sweetScore!,
        styleTags,        // 더미: 현재 추천엔 미반영 (UI 표시용)
        noseTags,
        tasteTags,
        ageMin: ageOpt?.min ?? null,
        ageMax: ageOpt?.max ?? null,
      };
      const result = await enthusiastSurveyApi.submit(payload);
      navigate(PATHS.RECOMMEND, { state: { result, payload, surveyType: 'enthusiast' } });
    } catch {
      toast('결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopNav />

      <div className="wf-page wf-survey-scroll">
        <div className="wf-survey-layout">
          <main className="wf-survey-main">
            <header className="wf-survey-intro">
              <p className="wf-survey-intro__eyebrow">애호가 설문</p>
              <h1 className="wf-title wf-survey-intro__title">위스키 애호가 취향 분석</h1>
              <p className="wf-subtitle wf-survey-intro__subtitle">
                총 9문항 / 2~3분 소요 · 정교한 취향 기반 추천을 받아보세요.
              </p>
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
                  <h2 className="wf-title wf-survey-q__title">{q.title}</h2>
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
                          {opt.text}
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
                <h2 className="wf-title wf-survey-q__title">Q6. 평소 선호하는 위스키 스타일을 선택해주세요.</h2>
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

            {/* Q7 숙성 연수 선호 */}
            {showAge && (
              <section
                id="q-age"
                ref={(el) => { blockRefs.current['q-age'] = el; }}
                className="wf-box wf-survey-q"
              >
                <h2 className="wf-title wf-survey-q__title">Q7. 어느 정도 숙성된 위스키를 선호하세요?</h2>
                <div className="wf-survey-opts">
                  {AGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`wf-opt${agePref === opt.key ? ' wf-opt--on' : ''}`}
                      onClick={() => chooseAge(opt.key)}
                    >
                      <span>
                        {opt.label}
                        <small className="wf-survey-opt__sub">{opt.sub}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Q8 Nose 태그 */}
            {showNose && (
              <section
                id="q-nose"
                ref={(el) => { blockRefs.current['q-nose'] = el; }}
                className="wf-box wf-survey-q"
              >
                <h2 className="wf-title wf-survey-q__title">Q8. 좋아하는 향을 골라주세요</h2>
                {noseLoading ? (
                  <p className="wf-text-sm">향 목록을 불러오는 중…</p>
                ) : (
                  noseTagList.map((g) => (
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
                  ))
                )}
              </section>
            )}

            {/* Q9 Taste 태그 */}
            {showTaste && (
              <section
                id="q-taste"
                ref={(el) => { blockRefs.current['q-taste'] = el; }}
                className="wf-box wf-survey-q"
              >
                <h2 className="wf-title wf-survey-q__title">Q9. 좋아하는 맛을 골라주세요</h2>
                {tasteLoading ? (
                  <p className="wf-text-sm">맛 목록을 불러오는 중…</p>
                ) : (
                  tasteTagList.map((g) => (
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
                  ))
                )}
              </section>
            )}

            {canSubmit && (
              <Button block className="wf-survey-submit wf-survey-submit--cta" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '분석 중...' : '결과 확인하기'}
              </Button>
            )}
          </main>

          <SurveySidebar
            progressPercent={progressPercent}
            completedCount={completedCount}
            totalSteps={TOTAL_STEPS}
            steps={NAV_STEPS}
            availIds={availIds}
            doneIds={doneIds}
            activeId={activeId}
            onGoTo={goTo}
          />
        </div>
      </div>
    </>
  );
}

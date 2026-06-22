import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/components/ui/Toast';
import { surveyApi, type SurveyApiRequest } from '../api/surveyApi';
import { useTags } from '../hooks/useTags';
import { SurveySidebar } from '../components/SurveySidebar';
import '../survey.css';

/* ───────── 설문 정의 ───────── */

interface ScoreOption {
  text: string;
}
interface ScoreQuestion {
  key: 'sweetScore' | 'bodyScore' | 'smokyScore' | 'spicyScore' | 'finishScore';
  title: string;
  options: ScoreOption[];
}

const SCORE_QUESTIONS: ScoreQuestion[] = [
  {
    key: 'sweetScore',
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

/** 우측 네비 스텝 (Q1~Q7) */
const NAV_STEPS = [
  ...SCORE_QUESTIONS.map((q, i) => ({ id: `q-${q.key}`, label: `Q${i + 1}` })),
  { id: 'q-nose', label: 'Q6' },
  { id: 'q-taste', label: 'Q7' },
];

/* ───────── 페이지 ───────── */

export default function SurveyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // OnboardingPage에서 입문자 선택 후 넘어온 경우 타입 선택 화면 스킵
  const [typeChosen, setTypeChosen] = useState(searchParams.get('type') === 'beginner');
  const [scores, setScores] = useState<Partial<Record<ScoreQuestion['key'], number>>>({});
  const [noseTags, setNoseTags] = useState<number[]>([]);
  const [tasteTags, setTasteTags] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<string>('q-sweetScore');
  const [submitting, setSubmitting] = useState(false);

  // 향/맛 태그는 서버에서 조회 (프론트 하드코딩 제거)
  const { data: noseTagList = [], isLoading: noseLoading } = useTags('nose');
  const { data: tasteTagList = [], isLoading: tasteLoading } = useTags('taste');

  const answeredCount = SCORE_QUESTIONS.filter((q) => scores[q.key] != null).length;
  const allScored = answeredCount === SCORE_QUESTIONS.length;
  const showNose = allScored;
  // Q6(향)·Q7(맛)은 점수 문항을 모두 마치면 동시에 등장
  const showTaste = showNose;
  const canSubmit = showNose && noseTags.length > 0 && tasteTags.length > 0;
  const completedCount = answeredCount + (noseTags.length > 0 ? 1 : 0) + (tasteTags.length > 0 ? 1 : 0);
  const progressPercent = Math.round((completedCount / NAV_STEPS.length) * 100);

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

  // choice 1~5 저장 후 다음 문항으로 자동 스크롤
  // (Q5 → Q6은 스크롤하지만, Q6 → Q7 사이에는 스크롤하지 않음 — toggleTag는 스크롤 없음)
  const setScore = (key: ScoreQuestion['key'], choice: number) => {
    setScores((prev) => ({ ...prev, [key]: choice }));
    const idx = SCORE_QUESTIONS.findIndex((q) => q.key === key);
    const nextId =
      idx < SCORE_QUESTIONS.length - 1
        ? `q-${SCORE_QUESTIONS[idx + 1].key}`
        : 'q-nose';
    // 다음 문항이 렌더된 뒤 스크롤되도록 약간의 지연
    window.setTimeout(() => goTo(nextId), 120);
  };

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
          {/* 본문 */}
          <main className="wf-survey-main">
            <header className="wf-survey-intro">
              <p className="wf-survey-intro__eyebrow">설문조사</p>
              <h1 className="wf-title wf-survey-intro__title">나의 위스키 취향 알아보기</h1>
              <p className="wf-subtitle wf-survey-intro__subtitle">
                {typeChosen
                  ? '7개 문항에 답하면 취향에 맞는 위스키를 추천해 드려요.'
                  : '먼저 위스키 경험 수준을 선택해 주세요.'}
              </p>
            </header>

            {/* 타입 선택: 입문자 / 애호가 */}
            {!typeChosen && (
              <section className="wf-box wf-survey-q wf-survey-type-select">
                <h2 className="wf-title wf-survey-q__title">위스키 경험 수준을 선택해 주세요</h2>
                <div className="wf-survey-type-options">
                  <button
                    type="button"
                    className="wf-survey-type-option"
                    onClick={() => setTypeChosen(true)}
                  >
                    <strong>입문자</strong>
                    <em>향과 맛을 쉽게 고르는 짧은 설문 · 7개 문항</em>
                  </button>
                  <button
                    type="button"
                    className="wf-survey-type-option"
                    onClick={() => navigate(PATHS.SURVEY_ENTHUSIAST)}
                  >
                    <strong>애호가</strong>
                    <em>캐스크, 피트, 피니시까지 세밀한 취향 반영 · 9개 문항</em>
                  </button>
                </div>
              </section>
            )}

            {/* Q1~Q5: 점수형 단일 선택 — 순차 노출 */}
            {typeChosen && SCORE_QUESTIONS.map((q, idx) => {
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
                      const choice = oi + 1; // 1~5
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

            {/* Q6: 좋아하는 향 (복수 선택) */}
            {typeChosen && showNose && (
              <section
                id="q-nose"
                ref={(el) => { blockRefs.current['q-nose'] = el; }}
                className="wf-box wf-survey-q"
              >
                <h2 className="wf-title wf-survey-q__title">Q6. 좋아하는 향을 골라주세요</h2>
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

            {/* Q7: 좋아하는 맛 (복수 선택) */}
            {typeChosen && showTaste && (
              <section
                id="q-taste"
                ref={(el) => { blockRefs.current['q-taste'] = el; }}
                className="wf-box wf-survey-q"
              >
                <h2 className="wf-title wf-survey-q__title">Q7. 좋아하는 맛을 골라주세요</h2>
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

            {typeChosen && canSubmit && (
              <Button block className="wf-survey-submit wf-survey-submit--cta" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '분석 중...' : '결과 확인하기'}
              </Button>
            )}
          </main>

          {typeChosen ? (
            <SurveySidebar
              progressPercent={progressPercent}
              completedCount={completedCount}
              totalSteps={NAV_STEPS.length}
              steps={NAV_STEPS}
              availIds={availIds}
              doneIds={doneIds}
              activeId={activeId}
              onGoTo={goTo}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { toast } from '@/shared/components/ui/Toast';
import { isLoggedIn } from '@/shared/lib/authSession';
import { surveyApi, type SurveyResult, type SurveyApiRequest } from '@/features/survey/api/surveyApi';
import { enthusiastSurveyApi } from '@/features/survey/api/enthusiastSurveyApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { saveResultImage } from '../utils/exportImage';
import { ProfileScoreRadar, type ProfileRadarScores } from '../components/ProfileScoreRadar';
import '../recommendation.css';

const SCORE_META: { key: keyof SurveyResult['profile']; ko: string; low: string; high: string }[] = [
  { key: 'sweetScore', ko: '단맛', low: '드라이', high: '달콤' },
  { key: 'bodyScore', ko: '바디', low: '가벼움', high: '묵직함' },
  { key: 'smokyScore', ko: '스모키', low: '없음', high: '강한 피트' },
  { key: 'spicyScore', ko: '스파이시', low: '순함', high: '알싸함' },
  { key: 'finishScore', ko: '피니시', low: '짧음', high: '긴 여운' },
];

type ScoreKey = 'sweetScore' | 'bodyScore' | 'smokyScore' | 'spicyScore' | 'finishScore';

function tagLine(tags: Array<{ name: string }>) {
  return tags.map((t) => t.name).join(' · ');
}

interface LocationState {
  result: SurveyResult;
  payload: SurveyApiRequest;
  surveyType?: 'beginner' | 'enthusiast';
}

export default function RecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState | null);

  const result = state?.result ?? null;
  const payload = state?.payload ?? null;
  const surveyType = state?.surveyType ?? 'beginner';

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // 설문 페이지 하단에서 넘어올 때 스크롤 위치가 유지되는 문제 방지
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const scrollParent = document.querySelector('.wf-page__inner--scroll');
    if (scrollParent instanceof HTMLElement) {
      scrollParent.scrollTop = 0;
    }
  }, []);

  const handleApply = async () => {
    if (!payload) return;
    if (!isLoggedIn()) {
      navigate(PATHS.LOGIN, { state: { from: PATHS.RECOMMEND } });
      return;
    }
    setApplying(true);
    try {
      if (surveyType === 'enthusiast') {
        await enthusiastSurveyApi.save(payload);
      } else {
        await surveyApi.save(payload);
      }
      setApplied(true);
    } catch {
      toast('저장 중 문제가 발생했어요. 다시 시도해 주세요.', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveImage = () => {
    if (!result) return;
    try {
      saveResultImage(result);
    } catch {
      toast('이미지 저장 중 문제가 발생했어요. 다시 시도해 주세요.', 'error');
    }
  };

  if (!result) {
    return (
      <>
        <TopNav />
        <div className="wf-page wf-reco-page">
          <div className="wf-reco-wrap wf-reco-empty">
            <p className="wf-reco-empty__eyebrow">추천 결과</p>
            <h1 className="wf-reco-empty__title">설문 결과가 없어요</h1>
            <p className="wf-reco-empty__desc">
              설문을 완료하면 취향에 맞는 위스키를 추천해 드려요.
            </p>
            <div className="wf-reco-empty__actions">
              <Button to={PATHS.SURVEY} className="wf-reco-btn--cta">입문자 설문</Button>
              <Button to={PATHS.SURVEY_ENTHUSIAST} variant="ghost">애호가 설문</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const { profile, userType, userTypeDescription, recommendations } = result;

  const radarScores: ProfileRadarScores = {
    sweetScore: profile.sweetScore,
    bodyScore: profile.bodyScore,
    smokyScore: profile.smokyScore,
    spicyScore: profile.spicyScore,
    finishScore: profile.finishScore,
  };

  return (
    <>
      <TopNav />
      <div className="wf-page wf-reco-page">
        <div className="wf-reco-wrap">
          <header className="wf-reco-intro">
            <p className="wf-reco-intro__eyebrow">추천 결과</p>
            <h1 className="wf-reco-intro__title">{userType}</h1>
            {userTypeDescription ? (
              <p className="wf-reco-intro__subtitle">{userTypeDescription}</p>
            ) : null}
          </header>

          <div className="wf-box wf-reco-profile">
            <div className="wf-reco-scores-layout">
              <div className="wf-reco-scores-radar">
                <ProfileScoreRadar scores={radarScores} />
              </div>
              <div className="wf-reco-scores-bars">
                {SCORE_META.map((m) => {
                  const v = profile[m.key as ScoreKey] as number;
                  return (
                    <div key={m.key} className="wf-reco-score-item">
                      <div className="wf-score-row__head">
                        <span className="wf-score-row__label">{m.ko}</span>
                        <span className="wf-score-row__val">{v}%</span>
                      </div>
                      <div className="wf-score-bar">
                        <div className="wf-score-bar__fill" style={{ width: `${v}%` }} />
                      </div>
                      <div className="wf-score-row__ends">
                        <span>{m.low}</span>
                        <span>{m.high}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {profile.noseTags.length > 0 && (
              <div className="wf-reco-tags-section">
                <p className="wf-reco-tags-label">좋아하는 향</p>
                <p className="wf-reco-tags-text">{tagLine(profile.noseTags)}</p>
              </div>
            )}
            {profile.tasteTags.length > 0 && (
              <div className="wf-reco-tags-section wf-reco-tags-section--taste">
                <p className="wf-reco-tags-label">좋아하는 맛</p>
                <p className="wf-reco-tags-text">{tagLine(profile.tasteTags)}</p>
              </div>
            )}
          </div>

          <section className="wf-reco-list">
            <h2 className="wf-reco-section-title">추천 위스키</h2>
            <div className="wf-result-recos">
              {recommendations.map((w) => {
                const img = resolveMediaUrl(w.imageUrl);
                return (
                  <Link
                    key={w.id}
                    to={`/whiskey/${w.id}`}
                    className="wf-reco-whiskey-row"
                  >
                    <div className={`wf-reco-whiskey-row__thumb${img ? '' : ' wf-placeholder'}`}>
                      {img && <img src={img} alt="" />}
                    </div>
                    <div className="wf-reco-whiskey-row__body">
                      <p className="wf-reco-whiskey-row__name">{w.name}</p>
                      <p className="wf-reco-whiskey-row__meta">
                        평점 {w.avgRating.toFixed(1)}
                      </p>
                      {w.reason ? (
                        <p className="wf-reco-whiskey-row__reason">{w.reason}</p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="wf-reco-actions">
            <Button
              block
              className="wf-reco-btn--cta"
              onClick={handleApply}
              disabled={applied || applying}
            >
              {applied ? '취향 저장됨' : applying ? '저장 중...' : '내 취향으로 저장'}
            </Button>
            <div className="wf-reco-actions-row">
              <Button variant="ghost" className="wf-reco-action-btn" onClick={handleSaveImage}>
                결과 이미지 저장
              </Button>
              <Button variant="ghost" className="wf-reco-action-btn" to={PATHS.SURVEY}>
                다시 설문하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

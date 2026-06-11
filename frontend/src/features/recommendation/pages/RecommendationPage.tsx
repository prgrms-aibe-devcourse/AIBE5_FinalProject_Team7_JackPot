import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { isLoggedIn } from '@/shared/lib/authSession';
import { surveyApi, type SurveyResult, type SurveyApiRequest } from '@/features/survey/api/surveyApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { saveResultImage } from '../utils/exportImage';
import '../recommendation.css';

const SCORE_META: { key: keyof SurveyResult['profile']; ko: string; en: string; low: string; high: string }[] = [
  { key: 'sweetScore', ko: '단맛', en: 'Sweet', low: '드라이', high: '달콤' },
  { key: 'bodyScore', ko: '바디', en: 'Body', low: '가벼움', high: '묵직함' },
  { key: 'smokyScore', ko: '스모키', en: 'Smoky', low: '없음', high: '강한 피트' },
  { key: 'spicyScore', ko: '스파이시', en: 'Spicy', low: '순함', high: '알싸함' },
  { key: 'finishScore', ko: '피니시', en: 'Finish', low: '짧음', high: '긴 여운' },
];

type ScoreKey = 'sweetScore' | 'bodyScore' | 'smokyScore' | 'spicyScore' | 'finishScore';

interface LocationState {
  result: SurveyResult;
  payload: SurveyApiRequest;
}

export default function RecommendationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState | null);

  const result = state?.result ?? null;
  const payload = state?.payload ?? null;

  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!payload) return;
    if (!isLoggedIn()) {
      navigate(PATHS.LOGIN, { state: { from: PATHS.RECOMMEND } });
      return;
    }
    setApplying(true);
    try {
      await surveyApi.save(payload);
      setApplied(true);
    } catch {
      alert('저장 중 문제가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveImage = () => {
    if (!result) return;
    try {
      saveResultImage(result);
    } catch {
      alert('이미지 저장 중 문제가 발생했어요. 다시 시도해 주세요.');
    }
  };

  if (!result) {
    return (
      <>
        <TopNav searchPlaceholder="Whiskey Note" />
        <div className="wf-page">
          <div className="wf-page__inner wf-reco-empty">
            <p className="wf-subtitle">설문 결과가 없어요.</p>
            <Button to={PATHS.SURVEY} className="wf-reco-empty-btn">설문 시작하기</Button>
          </div>
        </div>
      </>
    );
  }

  const { profile, userType, userTypeDescription, recommendations } = result;

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page">
        <div className="wf-page__inner wf-page__inner--scroll">
          <div className="wf-reco-wrap">
            {/* 취향 분석 노트 */}
            <div className="wf-box wf-panel wf-result-note">
              <p className="wf-text-label">Taste Profile</p>
              <h1 className="wf-title wf-reco-main-title">당신의 취향 분석 결과입니다</h1>
              <p className="wf-subtitle wf-reco-main-subtitle">
                설문 응답을 바탕으로 5가지 풍미 축과 선호 노트를 정리했어요.
              </p>

              {/* 유저 타입 */}
              <div className="wf-reco-type-card">
                <p className="wf-reco-type-name">{userType}</p>
                <p className="wf-text-sm wf-reco-type-desc">{userTypeDescription}</p>
              </div>

              <div className="wf-result-scores">
                {SCORE_META.map((m) => {
                  const v = profile[m.key as ScoreKey] as number;
                  return (
                    <div key={m.key} className="wf-score-row">
                      <div className="wf-score-row__head">
                        <span className="wf-score-row__label">
                          {m.ko} <span className="wf-score-row__en">{m.en}</span>
                        </span>
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

              {profile.noseTags.length > 0 && (
                <div className="wf-reco-tags-section">
                  <p className="wf-text-sm wf-reco-tags-label">좋아하는 향 (nose)</p>
                  <div className="wf-chips">
                    {profile.noseTags.map((t) => (
                      <span key={t.id} className="wf-chip wf-chip--on">{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.tasteTags.length > 0 && (
                <div className="wf-reco-tags-section wf-reco-tags-section--taste">
                  <p className="wf-text-sm wf-reco-tags-label">좋아하는 맛 (taste)</p>
                  <div className="wf-chips">
                    {profile.tasteTags.map((t) => (
                      <span key={t.id} className="wf-chip wf-chip--on">{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 추천 위스키 */}
            <p className="wf-section-title wf-reco-section-title">당신에게 어울리는 위스키 3</p>
            <div className="wf-result-recos">
              {recommendations.map((w, i) => {
                const img = resolveMediaUrl(w.imageUrl);
                return (
                  <div key={w.id} className="wf-box wf-reco-card">
                    <div className={`wf-reco-card__thumb${img ? '' : ' wf-placeholder'}`}>
                      {img && (
                        <img
                          src={img}
                          alt={w.name}
                        />
                      )}
                      <span className="wf-reco-card__rank">{i + 1}</span>
                    </div>
                    <div className="wf-reco-card__body">
                      <p className="wf-card__title">{w.name}</p>
                      <p className="wf-text-xs wf-reco-card-meta">
                        매칭 점수 {Math.round(w.score * 100)}% · ★ {w.avgRating.toFixed(1)}
                      </p>
                      <p className="wf-text-sm wf-reco-card-reason">{w.reason}</p>
                      <Button to={`/whiskey/${w.id}`} className="wf-reco-card-btn">상세 보기</Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="wf-reco-actions">
              <Button block onClick={handleApply} disabled={applied || applying}>
                {applied ? '✓ 내 추천에 반영됨' : applying ? '저장 중...' : '내 추천 알고리즘에 반영하기'}
              </Button>
              <div className="wf-reco-actions-row">
                <Button variant="ghost" className="wf-reco-action-btn" onClick={handleSaveImage}>이미지로 저장</Button>
                <Button variant="ghost" className="wf-reco-action-btn" to={PATHS.SURVEY}>다시 검사하기</Button>
                <Button className="wf-reco-action-btn" to={PATHS.LOUNGE}>홈으로</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

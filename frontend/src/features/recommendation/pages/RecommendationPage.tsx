import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import { isLoggedIn } from '@/shared/lib/authSession';
import { surveyApi, type SurveyResult, type SurveyApiRequest } from '@/features/survey/api/surveyApi';
import { resolveMediaUrl } from '@/shared/lib/mediaUrl';
import { saveResultImage } from '../utils/exportImage';

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
          <div className="wf-page__inner" style={{ textAlign: 'center', paddingTop: 80 }}>
            <p className="wf-subtitle">설문 결과가 없어요.</p>
            <Button to={PATHS.SURVEY} style={{ marginTop: 20 }}>설문 시작하기</Button>
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
          <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
            {/* 취향 분석 노트 */}
            <div className="wf-box wf-panel wf-result-note">
              <p className="wf-text-label">Taste Profile</p>
              <h1 className="wf-title" style={{ marginTop: 4 }}>당신의 취향 분석 결과입니다</h1>
              <p className="wf-subtitle" style={{ marginTop: 6 }}>
                설문 응답을 바탕으로 5가지 풍미 축과 선호 노트를 정리했어요.
              </p>

              {/* 유저 타입 */}
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--wf-surface2)', borderRadius: 8, borderLeft: '3px solid var(--wf-accent)' }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--wf-accent)' }}>{userType}</p>
                <p className="wf-text-sm" style={{ marginTop: 4, lineHeight: 1.6 }}>{userTypeDescription}</p>
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
                <div style={{ marginTop: 18 }}>
                  <p className="wf-text-sm" style={{ marginBottom: 8 }}>좋아하는 향 (nose)</p>
                  <div className="wf-chips">
                    {profile.noseTags.map((t) => (
                      <span key={t.id} className="wf-chip wf-chip--on">{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.tasteTags.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p className="wf-text-sm" style={{ marginBottom: 8 }}>좋아하는 맛 (taste)</p>
                  <div className="wf-chips">
                    {profile.tasteTags.map((t) => (
                      <span key={t.id} className="wf-chip wf-chip--on">{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 추천 위스키 */}
            <p className="wf-section-title" style={{ marginTop: 28 }}>당신에게 어울리는 위스키 3</p>
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
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                      )}
                      <span className="wf-reco-card__rank">{i + 1}</span>
                    </div>
                    <div className="wf-reco-card__body">
                      <p className="wf-card__title">{w.name}</p>
                      <p className="wf-text-xs" style={{ color: 'var(--wf-muted)', marginTop: 4 }}>
                        매칭 점수 {Math.round(w.score * 100)}% · ★ {w.avgRating.toFixed(1)}
                      </p>
                      <p className="wf-text-sm" style={{ lineHeight: 1.6, marginTop: 8 }}>{w.reason}</p>
                      <Button to={`/whiskey/${w.id}`} style={{ marginTop: 12, height: 38 }}>상세 보기</Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button block onClick={handleApply} disabled={applied || applying}>
                {applied ? '✓ 내 추천에 반영됨' : applying ? '저장 중...' : '내 추천 알고리즘에 반영하기'}
              </Button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" style={{ flex: 1 }} onClick={handleSaveImage}>이미지로 저장</Button>
                <Button variant="ghost" style={{ flex: 1 }} to={PATHS.SURVEY}>다시 검사하기</Button>
                <Button style={{ flex: 1 }} to={PATHS.LOUNGE}>홈으로</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

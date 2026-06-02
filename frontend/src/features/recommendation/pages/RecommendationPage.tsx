import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import type { TasteResult } from '../api/recommendationApi';
import { buildRecommendations } from '../utils/recommend';
import { saveResultImage } from '../utils/exportImage';

/** 점수 축 메타 (결과 표시용) */
const SCORE_META: { key: keyof TasteResult; ko: string; en: string; low: string; high: string }[] = [
  { key: 'sweetScore', ko: '단맛', en: 'Sweet', low: '드라이', high: '달콤' },
  { key: 'bodyScore', ko: '바디', en: 'Body', low: '가벼움', high: '묵직함' },
  { key: 'smokyScore', ko: '스모키', en: 'Smoky', low: '없음', high: '강한 피트' },
  { key: 'spicyScore', ko: '스파이시', en: 'Spicy', low: '순함', high: '알싸함' },
  { key: 'finishScore', ko: '피니시', en: 'Finish', low: '짧음', high: '긴 여운' },
];

/** API 미연결 / 직접 진입 시 사용할 샘플(목) 취향 데이터 */
const MOCK_RESULT: TasteResult = {
  sweetScore: 7,
  bodyScore: 6,
  smokyScore: 3,
  spicyScore: 4,
  finishScore: 6,
  nose_tags: ['바닐라', '꿀', '오크'],
  taste_tags: ['바닐라', '캐러멜', '견과류'],
};

export default function RecommendationPage() {
  const location = useLocation();
  const stateResult = (location.state as { result?: TasteResult } | null)?.result ?? null;

  // 설문에서 넘어온 결과가 없으면(=API 미연결/직접 진입) 동일 사양을 목데이터로 렌더
  const isPreview = stateResult == null;
  const result = stateResult ?? MOCK_RESULT;

  const recommendations = useMemo(() => buildRecommendations(result), [result]);

  const [applied, setApplied] = useState(false);

  // 목 처리: API 없이 내 취향 프로필을 로컬에 저장(추천 알고리즘 반영 가정)
  const handleApply = () => {
    try {
      localStorage.setItem('tasteProfile', JSON.stringify(result));
    } catch {
      // 저장 실패해도 UX는 반영 처리
    }
    setApplied(true);
  };

  const handleSaveImage = () => {
    try {
      saveResultImage(result, recommendations);
    } catch {
      alert('이미지 저장 중 문제가 발생했어요. 다시 시도해 주세요.');
    }
  };

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
              {isPreview && (
                <p className="wf-text-xs" style={{ marginTop: 8, color: 'var(--wf-accent)' }}>
                  * 미리보기 — 샘플 취향 데이터로 표시 중입니다. 설문을 완료하면 내 결과로 채워져요.
                </p>
              )}

              <div className="wf-result-scores">
                {SCORE_META.map((m) => {
                  const v = result[m.key] as number;
                  return (
                    <div key={m.key} className="wf-score-row">
                      <div className="wf-score-row__head">
                        <span className="wf-score-row__label">
                          {m.ko} <span className="wf-score-row__en">{m.en}</span>
                        </span>
                        <span className="wf-score-row__val">{v} / 9</span>
                      </div>
                      <div className="wf-score-bar">
                        <div className="wf-score-bar__fill" style={{ width: `${(v / 9) * 100}%` }} />
                      </div>
                      <div className="wf-score-row__ends">
                        <span>{m.low}</span>
                        <span>{m.high}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {result.nose_tags.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <p className="wf-text-sm" style={{ marginBottom: 8 }}>좋아하는 향 (nose)</p>
                  <div className="wf-chips">
                    {result.nose_tags.map((t) => (
                      <span key={t} className="wf-chip wf-chip--on">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.taste_tags.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p className="wf-text-sm" style={{ marginBottom: 8 }}>좋아하는 맛 (taste)</p>
                  <div className="wf-chips">
                    {result.taste_tags.map((t) => (
                      <span key={t} className="wf-chip wf-chip--on">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 추천 위스키 */}
            <p className="wf-section-title" style={{ marginTop: 28 }}>당신에게 어울리는 위스키 3</p>
            <div className="wf-result-recos">
              {recommendations.map((w, i) => (
                <div key={w.id} className="wf-box wf-reco-card">
                  <div className="wf-reco-card__thumb wf-placeholder">
                    <span className="wf-reco-card__rank">{i + 1}</span>
                  </div>
                  <div className="wf-reco-card__body">
                    <p className="wf-card__title">{w.name}</p>
                    <div className="wf-chips" style={{ margin: '8px 0' }}>
                      {w.tags.map((t) => (
                        <span key={t} className="wf-chip">{t}</span>
                      ))}
                    </div>
                    <p className="wf-text-sm" style={{ lineHeight: 1.6 }}>{w.reason}</p>
                    <Button to={`/whiskey/${w.id}`} style={{ marginTop: 12, height: 38 }}>상세 보기</Button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button block onClick={handleApply} disabled={applied}>
                {applied ? '✓ 내 추천에 반영됨' : '내 추천 알고리즘에 반영하기'}
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

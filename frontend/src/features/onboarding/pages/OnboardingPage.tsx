import { useState } from 'react';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import '../onboarding.css';

const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner',
    title: '입문자',
    description: '향과 맛을 쉽게 고르는 짧은 설문으로 시작할게요.',
  },
  {
    id: 'enthusiast',
    title: '애호가',
    description: '캐스크, 피트, 피니시처럼 더 섬세한 취향까지 반영해요.',
  },
] as const;

export default function OnboardingPage() {
  const [experience, setExperience] = useState<(typeof EXPERIENCE_OPTIONS)[number]['id']>('beginner');

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <div className="wf-page wf-onboarding-page">
        <section className="wf-box wf-onboarding-shell" aria-label="온보딩">
          <div className="wf-onboarding-visual" aria-hidden="true">
            <div className="wf-onboarding-visual__image" />
            <div className="wf-onboarding-visual__glass">
              <span />
              <strong>Taste Profile</strong>
              <em>Sweet · Body · Smoke</em>
            </div>
          </div>

          <div className="wf-onboarding-content">
            <p className="wf-text-label">Start your note</p>
            <h1 className="wf-title wf-onboarding-title">위스키 경험 수준</h1>
            <p className="wf-subtitle wf-onboarding-subtitle">
              지금 익숙한 정도를 알려주면 설문 문항과 추천 흐름을 더 자연스럽게 맞출게요.
            </p>

            <div className="wf-onboarding-options" role="radiogroup" aria-label="위스키 경험 수준">
              {EXPERIENCE_OPTIONS.map((option) => {
                const selected = experience === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`wf-onboarding-option${selected ? ' wf-onboarding-option--on' : ''}`}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setExperience(option.id)}
                  >
                    <span className="wf-onboarding-option__mark" />
                    <span>
                      <strong>{option.title}</strong>
                      <em>{option.description}</em>
                    </span>
                  </button>
                );
              })}
            </div>

            <Button block className="wf-onboarding-cta" to={PATHS.SURVEY}>
              설문 시작하기
            </Button>
            <p className="wf-onboarding-footnote">약 2분 · 7개 문항 · 결과는 바로 확인</p>
          </div>
        </section>
      </div>
    </>
  );
}

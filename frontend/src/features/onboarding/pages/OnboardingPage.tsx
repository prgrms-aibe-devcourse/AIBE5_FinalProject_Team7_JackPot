import { useEffect, useState } from 'react';
import { PATHS } from '@/app/router/paths';
import { TopNav } from '@/shared/components/layout/TopNav';
import { Button } from '@/shared/components/ui/Button';
import '../onboarding.css';

const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner',
    title: '입문자',
    description: '향과 맛을 쉽게 고르는 짧은 설문으로\n시작할게요.',
  },
  {
    id: 'enthusiast',
    title: '애호가',
    description: '캐스크, 피트, 피니시처럼 더 섬세한 취향까지\n반영해요.',
  },
] as const;

const ONBOARDING_VIDEO_URL = 'https://www.youtube.com/embed/UrEHWclh7Co?rel=0&modestbranding=1&playsinline=1';

const ONBOARDING_FEATURES = [
  {
    label: 'Survey',
    title: '취향 설문',
    description: '향, 맛, 피트감, 가격대까지 가볍게 답하면 지금 마시기 좋은 위스키를 정리해요.',
    meta: '7개 문항 · 바로 결과 확인',
    to: PATHS.SURVEY,
    action: '설문 시작',
  },
  {
    label: 'Community',
    title: '커뮤니티',
    description: '테이스팅 노트와 추천 이야기를 나누며 다른 취향의 선택지도 자연스럽게 발견해요.',
    meta: '리뷰 · 자유게시판 · 질문',
    to: PATHS.COMMUNITY,
    action: '커뮤니티 보기',
  },
  {
    label: 'Cabinet',
    title: '캐비넷',
    description: '찜한 병, 남긴 노트, 다시 보고 싶은 리뷰를 한곳에 모아 나만의 위스키 선반을 만들어요.',
    meta: '찜 · 노트 · 리뷰 보관',
    to: PATHS.CABINET,
    action: '캐비넷 열기',
  },
] as const;

export default function OnboardingPage() {
  const [experience, setExperience] = useState<(typeof EXPERIENCE_OPTIONS)[number]['id']>('beginner');

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.wf-onboarding-feature'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('wf-onboarding-feature--visible');
          }
        });
      },
      { threshold: 0.26, rootMargin: '0px 0px -12% 0px' },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <TopNav searchPlaceholder="Whiskey Note" />
      <main className="wf-onboarding-root">
        <div className="wf-page wf-onboarding-page">
          <section className="wf-box wf-onboarding-shell" aria-label="온보딩">
            <div className="wf-onboarding-brand" aria-hidden="true">
              <p>Whiskey Note</p>
              <span />
              <em>"Good things take time."</em>
            </div>

            <div className="wf-onboarding-content">
              <p className="wf-text-label">Start your note</p>
              <h1 className="wf-title wf-onboarding-title">위스키 경험 수준</h1>
              <p className="wf-subtitle wf-onboarding-subtitle">
                지금 익숙한 정도에 맞춰 첫 질문의 깊이를 조절할게요.
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

              <Button
                block
                className="wf-onboarding-cta"
                to={experience === 'enthusiast' ? PATHS.SURVEY_ENTHUSIAST : `${PATHS.SURVEY}?type=beginner`}
              >
                설문 시작하기
              </Button>
              <p className="wf-onboarding-footnote">
                {experience === 'enthusiast'
                  ? '약 5분 · 9개 문항 · 결과는 바로 확인'
                  : '약 2분 · 7개 문항 · 결과는 바로 확인'}
              </p>
            </div>

            <div className="wf-onboarding-video" aria-label="Whiskey Note 영상">
              <iframe
                src={ONBOARDING_VIDEO_URL}
                title="Whiskey Note mood video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        </div>

        <section className="wf-onboarding-flow" aria-label="Whiskey Note 주요 기능">
          <div className="wf-onboarding-flow__intro">
            <p className="wf-text-label">After your first sip</p>
            <h2>취향을 찾고, 나누고, 쌓아두는 흐름</h2>
            <p>
              첫 설문 이후에도 Whiskey Note는 추천에서 기록까지 이어지는 한 번의 리듬으로 움직여요.
            </p>
          </div>

          <div className="wf-onboarding-feature-list">
            {ONBOARDING_FEATURES.map((feature) => (
              <article className="wf-onboarding-feature" key={feature.label}>
                <div className="wf-onboarding-feature__index">{feature.label}</div>
                <div className="wf-onboarding-feature__body">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span>{feature.meta}</span>
                </div>
                <Button variant="ghost" size="sm" className="wf-onboarding-feature__action" to={feature.to}>
                  {feature.action}
                </Button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

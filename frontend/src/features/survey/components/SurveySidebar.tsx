interface SurveySidebarProps {
  progressPercent: number;
  completedCount: number;
  totalSteps: number;
  steps: Array<{ id: string; label: string }>;
  availIds: Set<string>;
  doneIds: Set<string>;
  activeId: string;
  onGoTo: (id: string) => void;
}

/** 설문 우측 sticky 레일 — 진행률 + 문항 네비 */
export function SurveySidebar({
  progressPercent,
  completedCount,
  totalSteps,
  steps,
  availIds,
  doneIds,
  activeId,
  onGoTo,
}: SurveySidebarProps) {
  return (
    <aside className="wf-survey-rail" aria-label="설문 진행">
      <div className="wf-survey-progress" aria-label={`설문 진행률 ${progressPercent}%`}>
        <div className="wf-survey-progress__label">
          <span>진행률</span>
          <strong>{completedCount}/{totalSteps}</strong>
        </div>
        <div className="wf-survey-progress__track">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <nav className="wf-survey-nav" aria-label="설문 문항 이동">
        <p className="wf-survey-nav__title">문항</p>
        <ul className="wf-survey-nav__list">
          {steps.map((step) => {
            const reachable = availIds.has(step.id);
            const done = doneIds.has(step.id);
            const active = activeId === step.id;
            const cls = [
              'wf-survey-nav__item',
              done ? 'wf-survey-nav__item--done' : '',
              active ? 'wf-survey-nav__item--active' : '',
              reachable ? '' : 'wf-survey-nav__item--locked',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <li key={step.id}>
                <button
                  type="button"
                  className={cls}
                  disabled={!reachable}
                  onClick={() => onGoTo(step.id)}
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

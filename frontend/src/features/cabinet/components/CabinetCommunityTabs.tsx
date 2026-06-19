export type CommunityTab = 'column' | 'free';

interface CabinetCommunityTabsProps {
  column: number;
  free: number;
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}

export function CabinetCommunityTabs({ column, free, active, onChange }: CabinetCommunityTabsProps) {
  return (
    <nav className="wf-ig-tabs" aria-label="커뮤니티 탭">
      <button
        type="button"
        className={`wf-ig-tabs__item${active === 'column' ? ' wf-ig-tabs__item--on' : ''}`}
        aria-current={active === 'column' ? 'page' : undefined}
        onClick={() => onChange('column')}
      >
        칼럼 {column}
      </button>
      <button
        type="button"
        className={`wf-ig-tabs__item${active === 'free' ? ' wf-ig-tabs__item--on' : ''}`}
        aria-current={active === 'free' ? 'page' : undefined}
        onClick={() => onChange('free')}
      >
        자유 {free}
      </button>
    </nav>
  );
}

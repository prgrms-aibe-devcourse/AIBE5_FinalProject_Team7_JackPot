import { Link } from 'react-router-dom';
import type { CabinetTab } from '@/app/router/paths';

const TABS: { key: CabinetTab; label: string }[] = [
  { key: 'pick',    label: 'Pick' },
  { key: 'wish',   label: '위시' },
  { key: 'reviews', label: '리뷰' },
  { key: 'note',   label: 'Note' },
];

interface CabinetSubTabsProps {
  active: CabinetTab;
  basePath: string;
  /** 타인 캐비넷: 위시 탭 숨김 */
  hideWish?: boolean;
}

export function CabinetSubTabs({ active, basePath, hideWish }: CabinetSubTabsProps) {
  const tabs = hideWish ? TABS.filter((t) => t.key !== 'wish') : TABS;
  const separator = basePath.includes('?') ? '&' : '?';

  return (
    <nav className="wf-cabinet-sub" aria-label="Bar 하위 탭">
      {tabs.map(({ key, label }) => (
        <Link
          key={key}
          to={`${basePath}${separator}tab=${key}`}
          className={`wf-cabinet-sub__tab${active === key ? ' wf-cabinet-sub__tab--on' : ''}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

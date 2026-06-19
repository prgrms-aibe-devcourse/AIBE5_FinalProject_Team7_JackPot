import { Link } from 'react-router-dom';
import type { CabinetTab } from '@/app/router/paths';

interface CabinetStatsBarProps {
  pick: number;
  wish?: number;
  reviews: number;
  notes: number;
  hideWish?: boolean;
  active?: CabinetTab;
  basePath?: string;
}

const TAB_LABEL: Record<CabinetTab, string> = {
  pick: 'Pick',
  wish: '위시',
  reviews: '리뷰',
  note: 'Note',
};

export function CabinetStatsBar({ pick, wish, reviews, notes, hideWish, active, basePath }: CabinetStatsBarProps) {
  const clickable = active != null && basePath != null;
  const separator = basePath?.includes('?') ? '&' : '?';

  const items: { key: CabinetTab; value: number }[] = [
    { key: 'pick', value: pick },
    ...(!hideWish && wish !== undefined ? [{ key: 'wish' as const, value: wish }] : []),
    { key: 'reviews', value: reviews },
    { key: 'note', value: notes },
  ];

  return (
    <nav className="wf-ig-tabs" aria-label="Bar 탭">
      {items.map(({ key, value }) => {
        const isOn = active === key;
        const className = `wf-ig-tabs__item${isOn ? ' wf-ig-tabs__item--on' : ''}`;
        const label = `${TAB_LABEL[key]} ${value}`;

        return clickable ? (
          <Link
            key={key}
            to={`${basePath}${separator}tab=${key}`}
            className={className}
            aria-current={isOn ? 'page' : undefined}
          >
            {label}
          </Link>
        ) : (
          <span key={key} className={className}>
            {label}
          </span>
        );
      })}
    </nav>
  );
}

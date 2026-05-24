import { Link, NavLink } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';

const NAV = [
  { to: PATHS.LOUNGE, label: '홈' },
  { to: PATHS.SEARCH, label: '검색' },
  { to: PATHS.MY_BAR, label: 'My Bar' },
  { to: PATHS.COMMUNITY, label: '커뮤니티' },
  { to: PATHS.MY_PAGE, label: '마이' },
];

interface TopNavProps {
  searchPlaceholder?: string;
  searchValue?: string;
}

export function TopNav({ searchPlaceholder = '🔍 위스키·브랜드·증류소', searchValue }: TopNavProps) {
  return (
    <nav className="wf-topnav">
      <Link to={PATHS.LOUNGE} className="wf-topnav__logo-link">
        <div className="wf-topnav__logo">Whiskey Note</div>
      </Link>
      <Link to={PATHS.SEARCH} className="wf-input wf-topnav__search">
        {searchValue ?? searchPlaceholder}
      </Link>
      <div className="wf-topnav__links">
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {label}
          </NavLink>
        ))}
      </div>
      <div className="wf-topnav__user">
        <div className="wf-topnav__avatar wf-placeholder" aria-hidden />
      </div>
    </nav>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';

const NAV_ITEMS = [
  { to: PATHS.LOUNGE, label: '홈' },
  { to: PATHS.SEARCH, label: '검색' },
  { to: PATHS.MY_BAR, label: 'My Bar' },
  { to: PATHS.COMMUNITY, label: '커뮤니티' },
  { to: PATHS.MY_PAGE, label: '마이' },
];

export function AppShell() {
  return (
    <div className="layout layout--app">
      <header className="app-header">
        <NavLink to={PATHS.LOUNGE} className="app-header__brand">
          Whiskey Note
        </NavLink>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <nav className="global-nav" aria-label="주요 메뉴">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

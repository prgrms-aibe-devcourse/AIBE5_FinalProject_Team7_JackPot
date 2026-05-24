import { Outlet } from 'react-router-dom';
import { AppFooter } from './AppFooter';
import { TopNav } from './TopNav';

export function AppShell() {
  return (
    <div className="app-root">
      <TopNav />
      <div className="wf-page">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  );
}

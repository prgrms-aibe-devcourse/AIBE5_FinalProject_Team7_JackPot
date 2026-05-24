import { Outlet } from 'react-router-dom';
import { AppFooter } from './AppFooter';

export function GuestLayout() {
  return (
    <div className="app-root">
      <Outlet />
      <AppFooter />
    </div>
  );
}

import { Outlet } from 'react-router-dom';

export function GuestLayout() {
  return (
    <div className="layout layout--guest">
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  );
}

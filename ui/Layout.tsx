import { NavLink, Outlet } from 'react-router-dom';
import { educationModules } from './education/modules/registry';
import './Layout.css';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link';
}

export function Layout() {
  const sortedModules = [...educationModules].sort((a, b) => a.order - b.order);
  return (
    <div className="app-shell">
      <header className="app-header">
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/education" end className={navLinkClassName}>
            Education
          </NavLink>
          {sortedModules.map((m) => (
            <NavLink key={m.id} to={m.path} className={navLinkClassName}>
              {m.title}
            </NavLink>
          ))}
          <NavLink to="/trading" className={navLinkClassName}>
            Paper Trading
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

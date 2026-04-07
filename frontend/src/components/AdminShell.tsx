import { type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

import './AdminShell.css';

interface AdminShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-brand-mark">PH</span>
          <span>Project Haven</span>
        </Link>

        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin/dashboard">Portal</NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/query">Query</NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-sidebar-eyebrow">Authenticated area</span>
          <p>Secure portal for staff-only operations.</p>
          <Link to="/" className="admin-sidebar-link">
            Back to home
          </Link>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Project Haven staff portal</p>
            <h1>{title}</h1>
            <p className="admin-subtitle">{subtitle}</p>
          </div>
          <div className="admin-topbar-chip">Admin / Staff authenticated users only</div>
        </header>

        {children}
      </main>
    </div>
  );
}

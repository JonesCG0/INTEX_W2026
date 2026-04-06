import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type CurrentUser } from '../api';
import '../styles/HomePage.css';

export default function HomePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    api
      .currentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  const isAdmin = user?.isAuthenticated && user.role?.toLowerCase() === 'admin';

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-nav">
          <span className="home-logo">Project Haven</span>

          <div className="home-nav-right">
            {loadingUser ? null : user?.isAuthenticated ? (
              <>
                <span className="home-nav-greeting">
                  Hi, {user.displayName ?? user.email}
                </span>
                {isAdmin && (
                  <>
                    <Link to="/admin/users" className="btn btn-outline">
                      User Management
                    </Link>
                    <Link to="/admin/query" className="btn btn-outline">
                      DB Query
                    </Link>
                  </>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => void handleLogout()}
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="home-hero">
        <div className="hero-content">
          <h1>Safe Harbor for Survivors</h1>
          <p className="hero-tagline">
            Project Haven supports abuse and trafficking survivors with secure
            case management, compassionate care, and a path toward healing.
          </p>
          <div className="hero-actions">
            <a href="#impact" className="btn btn-primary">
              See Our Impact
            </a>
            {user?.isAuthenticated ? (
              isAdmin ? (
                <Link to="/admin/users" className="btn btn-secondary">
                  Admin Portal
                </Link>
              ) : (
                <Link to="/admin/users" className="btn btn-secondary">
                  My Dashboard
                </Link>
              )
            ) : (
              <Link to="/login" className="btn btn-secondary">
                Staff Login
              </Link>
            )}
          </div>
        </div>
      </main>

      <section id="impact" className="home-impact">
        <h2>Making a Difference</h2>
        <div className="impact-stats">
          <div className="stat-card">
            <span className="stat-number">—</span>
            <span className="stat-label">Residents Supported</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">—</span>
            <span className="stat-label">Counseling Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">—</span>
            <span className="stat-label">Families Reached</span>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>
          &copy; {new Date().getFullYear()} Project Haven &mdash;{' '}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}

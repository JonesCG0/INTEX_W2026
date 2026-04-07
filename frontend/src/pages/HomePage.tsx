import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';
import api, { type CurrentUser } from '../api';
import '../styles/HomePage.css';

const missionPoints = [
  {
    title: 'Protect survivors',
    description:
      'Keep sensitive resident, counseling, and safety records in a secure system with role-based access.',
  },
  {
    title: 'Support staff',
    description:
      'Give case workers a clear workflow for intake, progress tracking, and structured reporting.',
  },
  {
    title: 'Show donor impact',
    description:
      'Translate donations into transparent, anonymized outcomes that build trust and retention.',
  },
];

const publicHighlights = [
  'Anonymized impact reporting',
  'Secure case management',
  'Clear donor and staff navigation',
];

function HomePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .currentUser()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingUser(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  const isAuthenticated = user?.isAuthenticated === true;
  const isAdmin = isAuthenticated && user.role?.toLowerCase() === 'admin';
  const primaryActionLabel = isAuthenticated
    ? isAdmin
      ? 'Open admin tools'
      : 'Review impact'
    : 'Log in';
  const primaryActionTo = isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/impact') : '/login';

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-nav">
          <Link to="/" className="home-logo" aria-label="Project Haven home">
            <span className="home-logo-mark">PH</span>
            <span>Project Haven</span>
          </Link>

          <nav className="home-nav-links" aria-label="Primary">
            <a href="#mission">Mission</a>
            <Link to="/impact">Impact</Link>
            <a href="#access">Access</a>
          </nav>

          <div className="home-nav-actions">
            {loadingUser ? null : isAuthenticated ? (
              <>
                <span className="home-user-chip">
                  {user.displayName ?? user.email ?? 'Signed in'}
                </span>
                {isAdmin ? (
                  <Link to="/admin/dashboard" className="home-button home-button-secondary">
                    Admin portal
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="home-button home-button-ghost"
                  onClick={() => void handleLogout()}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="home-button home-button-ghost">
                  Sign up
                </Link>
                <Link to="/login" className="home-button home-button-primary">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Secure nonprofit case management</p>
            <h1>Protect survivors. Support staff. Prove impact.</h1>
            <p className="home-lede">
              Project Haven helps a safehouse nonprofit manage resident care,
              donor relationships, and public-facing impact reporting in one
              secure, easy-to-run platform.
            </p>

            <div className="home-hero-actions">
              <a href="#mission" className="home-button home-button-primary">
                Explore the mission
              </a>
              <Link to="/impact" className="home-button home-button-secondary">
                See the impact overview
              </Link>
              <Link to={primaryActionTo} className="home-button home-button-ghost">
                {primaryActionLabel}
              </Link>
            </div>

            <ul className="home-highlights" aria-label="Core highlights">
              {publicHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-hero-frame">
              <img src={heroImage} alt="" />
            </div>
            <div className="home-floating-card">
              <span className="home-floating-label">Public access</span>
              <strong>Clear calls to action and transparent reporting.</strong>
            </div>
          </div>
        </section>

        <section className="home-section" id="mission">
          <div className="home-section-heading">
            <p className="home-eyebrow">What Project Haven does</p>
            <h2>A calm public front for a mission-critical internal system.</h2>
          </div>

          <div className="home-card-grid">
            {missionPoints.map((point) => (
              <article key={point.title} className="home-card">
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-impact-section" id="impact-preview">
          <div className="home-section-heading">
            <p className="home-eyebrow">Impact preview</p>
            <h2>What visitors should understand at a glance.</h2>
          </div>

          <div className="home-impact-grid">
            <article className="home-impact-panel">
              <span className="home-impact-kicker">For donors</span>
              <h3>Donation stories become measurable outcomes.</h3>
              <p>
                Public visitors will eventually see anonymized snapshots of
                resident progress, service delivery, and safehouse support
                without exposing private details.
              </p>
            </article>

            <article className="home-impact-panel">
              <span className="home-impact-kicker">For staff</span>
              <h3>Operational work stays organized and auditable.</h3>
              <p>
                The internal system centers on resident records, counseling
                notes, visitation history, and role-based data access.
              </p>
            </article>

            <article className="home-impact-panel">
              <span className="home-impact-kicker">For the mission</span>
              <h3>The public site supports trust, giving, and clarity.</h3>
              <p>
                The landing page is designed to introduce the organization,
                direct people to the right next step, and keep the story
                focused on safety and impact.
              </p>
            </article>
          </div>
        </section>

        <section className="home-section" id="access">
          <div className="home-access">
            <div>
              <p className="home-eyebrow">Next step</p>
              <h2>Get in, get oriented, and move to the right page.</h2>
            </div>

            <div className="home-access-actions">
              <Link to="/login" className="home-button home-button-primary">
                Staff and donor login
              </Link>
              <a href="#mission" className="home-button home-button-secondary">
                Read the mission
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>Project Haven is built for a secure, public-first nonprofit experience.</p>
        <p>
          <Link to="/privacy">Privacy policy</Link> and cookie consent are available from this public site.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;

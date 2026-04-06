import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { type CurrentUser } from '../api';
import './LoginPage.css';
import './SignUpPage.css';

type LoginState = {
  email: string;
  password: string;
};

const initialState: LoginState = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginState>(initialState);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const user = await api.currentUser();
        if (!cancelled) {
          setCurrentUser(user);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.login(form.email, form.password);
      setCurrentUser({
        isAuthenticated: response.isAuthenticated,
        email: response.email,
        displayName: response.displayName,
        role: response.role,
      });
      setForm(initialState);
      navigate('/');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setSubmitting(true);
    setError(null);

    try {
      await api.logout();
      setCurrentUser({
        isAuthenticated: false,
        email: null,
        displayName: null,
        role: null,
      });
      navigate('/');
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Logout failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const isLoggedIn = currentUser?.isAuthenticated === true;

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <Link to="/" className="login-back-link">
              Back to home
            </Link>
            <h1>Log in</h1>
            <p>
              Use your Project Haven account to access the secure admin portal.
            </p>
          </div>

          {loadingUser ? (
            <div className="login-status">Checking session status...</div>
          ) : isLoggedIn ? (
            <div className="login-status login-status-success">
              Signed in as {currentUser.displayName ?? currentUser.email}
              <button
                type="button"
                className="login-button login-button-secondary"
                onClick={() => void handleLogout()}
                disabled={submitting}
              >
                Log out
              </button>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="login-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </label>

              {error ? <div className="login-error">{error}</div> : null}

              <button type="submit" className="login-button" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {!isLoggedIn && !loadingUser && (
            <p className="signup-login-link">
              Don&apos;t have an account? <Link to="/signup">Create one</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './LoginPage.css';
import './SignUpPage.css';

type SignUpForm = {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
};

const initialForm: SignUpForm = {
  email: '',
  displayName: '',
  password: '',
  confirmPassword: '',
};

const PASSWORD_RULES = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignUpForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const failing = PASSWORD_RULES.filter((r) => !r.test(form.password));
    if (failing.length > 0) {
      setError(`Password must include: ${failing.map((r) => r.label.toLowerCase()).join(', ')}.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.register(form.email, form.displayName, form.password, form.confirmPassword);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <Link to="/login" className="login-back-link">
              Back to log in
            </Link>
            <h1>Create account</h1>
            <p>Register for a Project Haven donor account.</p>
          </div>

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
              <span>Display name</span>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                autoComplete="name"
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
                autoComplete="new-password"
                required
                onFocus={() => setShowRules(true)}
              />
            </label>

            {(showRules || form.password.length > 0) && (
              <div className="signup-password-rules">
                <div className="signup-strength-bar">
                  <div
                    className="signup-strength-fill"
                    style={{ width: `${(passwordStrength / PASSWORD_RULES.length) * 100}%` }}
                    data-strength={passwordStrength}
                  />
                </div>
                <ul>
                  {PASSWORD_RULES.map((rule) => (
                    <li key={rule.label} className={rule.test(form.password) ? 'met' : ''}>
                      {rule.test(form.password) ? '✓' : '○'} {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <label className="login-field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </label>

            {error !== null && <div className="login-error">{error}</div>}

            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="signup-login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

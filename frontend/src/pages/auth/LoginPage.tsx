import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/apiClient";
import { ROUTES } from "../../constants/routes";
import "./LoginPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? ROUTES.DASHBOARD;

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return; // Never submit invalid data.
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <aside className="login-panel">
        <div className="brand-mark">
          <span className="dot" />
          Ledgerline
        </div>

        <div className="login-panel-copy">
          <p className="eyebrow">Enterprise Revenue Analytics</p>
          <h1>Every figure, accounted for.</h1>
          <p>
            One ledger for pipeline, revenue, and customer performance — built for teams who need
            the numbers straight, and the access controlled.
          </p>
        </div>

        <div className="ledger-tally" aria-hidden="true">
          <div>
            <h3>3</h3>
            <span>Access tiers</span>
          </div>
          <div>
            <h3>256-bit</h3>
            <span>Token signing</span>
          </div>
          <div>
            <h3>100%</h3>
            <span>Audit ready</span>
          </div>
        </div>
      </aside>

      <main className="login-form-panel">
        <div className="login-form-card">
          <div className="mobile-brand">
            <span className="dot" />
            Ledgerline
          </div>

          <h2>Sign in</h2>
          <p className="subtitle">Enter your credentials to access your workspace.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="form-alert" role="alert">
                {formError}
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                placeholder="you@company.com"
              />
              {fieldErrors.email && (
                <span className="field-error" id="email-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <span className="field-error" id="password-error">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="btn-spinner" aria-hidden="true" />}
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="test-users-hint">
            Local dev users: <code>admin@example.com</code>, <code>analyst@example.com</code>,{" "}
            <code>viewer@example.com</code>. See the README for passwords.
          </p>
        </div>
      </main>
    </div>
  );
}

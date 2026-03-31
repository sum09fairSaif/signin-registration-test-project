"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Circle, CheckCircle2 } from "lucide-react";
import { resetPassword } from "./actions";

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`password-rule ${ok ? "passed" : ""}`}>
      {ok ? (
        <CheckCircle2 size={18} className="password-rule-icon passed" />
      ) : (
        <Circle size={18} className="password-rule-icon" />
      )}
      <span>{text}</span>
    </div>
  );
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const checks = useMemo(() => {
    return {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!._\-*#$&%\\?/^@]/.test(password),
      allowed: /^[A-Za-z0-9!._\-*#$&%\\?/^@]*$/.test(password),
      match:
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const allValid = Object.values(checks).every(Boolean);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!allValid) return;

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);

    const result = await resetPassword(formData);

    if (!result) return;

    if (!result.success) {
      setError(result.error || "Could not reset password.");
      setMessage("");
      return;
    }

    setError("");
    setMessage(result.message || "Password reset successful.");

    setPassword("");
    setConfirmPassword("");

    // 🚀 auto redirect after success
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Create a new secure password for your account.
        </p>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* New Password */}
          <div>
            <div className="auth-input-wrap">
              <input
                type="password"
                placeholder="New Password"
                className="auth-input"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                required
                disabled={!!message}
              />
              <Lock className="auth-input-icon" size={18} />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="auth-input-wrap">
              <input
                type="password"
                placeholder="Confirm Password"
                className="auth-input"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                required
                disabled={!!message}
              />
              <Lock className="auth-input-icon" size={18} />
            </div>
          </div>

          {/* Password Rule Checks */}
          <div className="password-checklist">
            <Rule
              ok={checks.length}
              text="Password is at least 8 characters long"
            />
            <Rule ok={checks.lower} text="At least one lowercase letter" />
            <Rule ok={checks.upper} text="At least one uppercase letter" />
            <Rule ok={checks.number} text="At least one number" />
            <Rule
              ok={checks.special}
              text='At least one special character "!._-*#$&%\\?/^@"'
            />
            <Rule ok={checks.allowed} text="Only allowed characters are used" />
            <Rule ok={checks.match} text="Passwords match" />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={!allValid || !!message}
          >
            Reset Password
          </button>
        </form>

        <p className="auth-footer">
          Back to{" "}
          <Link href="/login" className="auth-link strong">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

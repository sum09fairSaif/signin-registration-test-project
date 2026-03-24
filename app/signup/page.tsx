"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Circle, CheckCircle2 } from "lucide-react";
import { validateSignupForm } from "./actions";

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`password-rule ${ok ? "passed" : ""}`}>
      {ok ? (
        <CheckCircle2 size={18} />
      ) : (
        <Circle size={18} />
      )}
      <span>{text}</span>
    </div>
  );
}

export default function SignupPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const checks = useMemo(() => {
    return {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!._\-*#$&%\\?/^@]/.test(password),
      allowed: /^[A-Za-z0-9!._\-*#$&%\\?/^@]*$/.test(password),
      match: password && confirmPassword && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const allValid = Object.values(checks).every(Boolean);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!allValid) return;

    const formData = new FormData(e.currentTarget);
    const res = await validateSignupForm(formData);

    if (!res) return;

    if (!res.success) {
      setErrors(res.errors || {});
      setSuccess("");
    } else {
      setErrors({});
      setSuccess("Account created. Check your email to verify.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Register</h1>
        <p className="auth-subtitle">
          Create your account and get started securely.
        </p>

        {success && <p className="auth-success">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* NAME */}
          <div>
            <div className="auth-input-wrap">
              <input
                name="name"
                placeholder="Full Name"
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="auth-input-icon" size={18} />
            </div>
            {errors.name && <p className="auth-field-error">{errors.name[0]}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <div className="auth-input-wrap">
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="auth-input-icon" size={18} />
            </div>
            {errors.email && <p className="auth-field-error">{errors.email[0]}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="auth-input-wrap">
              <input
                name="password"
                type="password"
                placeholder="Create Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="auth-input-icon" size={18} />
            </div>
          </div>

          {/* CHECKLIST */}
          <div className="password-checklist">
            <Rule ok={checks.length} text="At least 8 characters" />
            <Rule ok={checks.lower} text="Contains lowercase letter" />
            <Rule ok={checks.upper} text="Contains uppercase letter" />
            <Rule ok={checks.number} text="Contains a number" />
            <Rule ok={checks.special} text='Contains special (!._-*#$&%\\?/^@)' />
            <Rule ok={checks.allowed} text="Only allowed characters used" />
            <Rule ok={checks.match} text="Passwords match" />
          </div>

          {/* CONFIRM */}
          <div>
            <div className="auth-input-wrap">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Lock className="auth-input-icon" size={18} />
            </div>
            {errors.confirmPassword && (
              <p className="auth-field-error">{errors.confirmPassword[0]}</p>
            )}
          </div>

          <button className="auth-button" disabled={!allValid}>
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-link strong">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Circle, CheckCircle2 } from "lucide-react";
import { validateSignupForm } from "./actions";

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`password-rule ${ok ? "passed" : ""}`}>
      {ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      <span>{text}</span>
    </div>
  );
}

export default function SignupPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

    const formData = new FormData(e.currentTarget);
    const res = await validateSignupForm(formData);

    if (!res) return;

    if (!res.success) {
      setErrors(res.errors || {});
      return;
    }

    setErrors({});
    router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Register</h1>
        <p className="auth-subtitle">
          Create your account and get started securely.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* NAME */}
          <div>
            <div className="auth-input-wrap">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className="auth-input"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="auth-input-icon" size={18} />
            </div>
            {errors.password && (
              <p className="auth-field-error">{errors.password[0]}</p>
            )}
          </div>

          {/* PASSWORD CHECKLIST */}
          <div className="password-checklist">
            <Rule ok={checks.length} text="Password is at least 8 characters long" />
            <Rule
              ok={checks.lower}
              text="Password must contain at least one lowercase letter"
            />
            <Rule
              ok={checks.upper}
              text="Password must contain at least one uppercase letter"
            />
            <Rule
              ok={checks.number}
              text="Password must contain at least one number"
            />
            <Rule
              ok={checks.special}
              text='Password must contain at least one of these special characters "!._-*#$&%\\?/^@"'
            />
            <Rule
              ok={checks.allowed}
              text='Password only uses allowed characters: !._-*#$&%\\?/^@'
            />
            <Rule ok={checks.match} text="Passwords match" />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <div className="auth-input-wrap">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="auth-input"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Lock className="auth-input-icon" size={18} />
            </div>
            {errors.confirmPassword && (
              <p className="auth-field-error">{errors.confirmPassword[0]}</p>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={!allValid}>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = await requestPasswordReset(formData);

    if (!result) {
      return;
    }

    if (!result.success) {
      setError(result.error || "Could not send the reset link.");
      setMessage("");
      return;
    }

    setError("");
    setMessage(result.message || "");
    event.currentTarget.reset();
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-wrap">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="auth-input"
              autoComplete="email"
              required
            />
            <Mail className="auth-input-icon" size={18} />
          </div>

          <button type="submit" className="auth-button">
            Send Reset Link
          </button>
        </form>

        <p className="auth-footer">
          Remembered your password?{" "}
          <Link href="/login" className="auth-link strong">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}

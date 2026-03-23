"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { verifyLoginCode } from "./actions";

export default function VerifyLoginPage() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = await verifyLoginCode(formData);

    if (!result) return;

    if (!result.success) {
      setError(result.error || "Invalid or expired code.");
      setMessage("");
    } else {
      setError("");
      setMessage(result.message || "Verification successful.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Verify Login</h1>
        <p className="auth-subtitle">
          Enter the verification code sent to your email to complete login.
        </p>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input type="hidden" name="email" value={email} />

          <div className="auth-input-wrap">
            <input
              name="code"
              type="text"
              maxLength={6}
              placeholder="Verification Code"
              className="auth-input"
              required
            />
            <ShieldCheck className="auth-input-icon" size={18} />
          </div>

          <div className="auth-input-wrap">
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="auth-input"
              autoComplete="current-password"
              required
            />
            <Lock className="auth-input-icon" size={18} />
          </div>

          <button type="submit" className="auth-button">
            Verify and Log In
          </button>
        </form>
      </section>
    </main>
  );
}
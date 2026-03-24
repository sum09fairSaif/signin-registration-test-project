"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock } from "lucide-react";
import { loginUser } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = await loginUser(formData);

    if (!result) return;

    if (!result.success) {
      setError(result.error || "Invalid email or password");
      setMessage("");
      return;
    }

    if (result.requiresOtp) {
      setError("");
      setMessage(result.message || "");
      router.push(`/verify-login?email=${encodeURIComponent(result.email)}`);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">
          Welcome back. Sign in to continue securely.
        </p>

        {verified === "1" && !message && (
          <p className="auth-success">
            Email verified successfully. You can now log in.
          </p>
        )}

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
            <User className="auth-input-icon" size={18} />
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

          <div className="auth-row">
            <label className="remember-row">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <Link href="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="auth-link strong">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}

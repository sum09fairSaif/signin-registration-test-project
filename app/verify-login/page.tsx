"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { resendLoginCode, verifyLoginCode } from "./actions";

export default function VerifyLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, startSubmitting] = useTransition();
  const [isResending, startResending] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email")?.trim() ?? "";
  const loginToken = searchParams.get("loginToken")?.trim() ?? "";
  const missingParams = !email || !loginToken;

  function buildFormData() {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("loginToken", loginToken);
    formData.append("code", code);
    return formData;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (missingParams || code.trim().length !== 6) {
      setError("Enter the 6-digit verification code from your email.");
      setMessage("");
      return;
    }

    startSubmitting(async () => {
      const result = await verifyLoginCode(buildFormData());

      if (!result) {
        return;
      }

      if (!result.success) {
        setError(result.error || "Login could not be completed.");
        setMessage("");
        return;
      }

      setError("");
      setMessage(result.message || "Verification successful.");
      router.push("/dashboard");
    });
  }

  function handleResendCode() {
    if (missingParams) {
      setError("Your login session is missing. Please log in again.");
      setMessage("");
      return;
    }

    startResending(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("loginToken", loginToken);

      const result = await resendLoginCode(formData);

      if (!result) {
        return;
      }

      if (!result.success) {
        setError(result.error || "Could not resend the verification code.");
        setMessage("");
        return;
      }

      setError("");
      setMessage(result.message || "A new verification code has been sent.");
    });
  }

  if (missingParams) {
    return (
      <main className="auth-page">
        <div className="auth-overlay" />

        <section className="auth-card" style={{ textAlign: "center" }}>
          <h1 className="auth-title">Invalid Login Session</h1>
          <p className="auth-subtitle">
            This verification link is incomplete or has expired.
          </p>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Link
              href="/login"
              className="auth-button"
              style={{ width: "220px" }}
            >
              Back to Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Verify Login</h1>
        <p className="auth-subtitle">
          Enter the 6-digit code we sent to your email to finish signing in.
        </p>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-wrap">
            <input
              type="email"
              className="auth-input"
              value={email}
              readOnly
              aria-label="Email"
            />
            <Mail className="auth-input-icon" size={18} />
          </div>

          <div className="auth-input-wrap">
            <input
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="6-digit code"
              className="auth-input"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              disabled={isSubmitting}
            />
            <Lock className="auth-input-icon" size={18} />
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify Login"}
          </button>
        </form>

        <p className="auth-footer">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="auth-link strong"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: isResending ? "default" : "pointer",
            }}
          >
            {isResending ? "Sending..." : "Resend it"}
          </button>
        </p>

        <p className="auth-footer">
          Need to start over?{" "}
          <Link href="/login" className="auth-link strong">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}

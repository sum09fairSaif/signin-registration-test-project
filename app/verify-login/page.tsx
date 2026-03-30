"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { resendLoginCode, verifyLoginCode } from "./actions";

export default function VerifyLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendSecondsLeft, setResendSecondsLeft] = useState(60);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isResending, startResending] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email")?.trim() ?? "";
  const loginToken = searchParams.get("loginToken")?.trim() ?? "";
  const missingParams = !email || !loginToken;

  useEffect(() => {
    if (resendSecondsLeft <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSecondsLeft]);

  function formatCountdown(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

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
        if (typeof result.resendSecondsLeft === "number") {
          setResendSecondsLeft(result.resendSecondsLeft);
        }
        return;
      }

      setError("");
      setMessage(result.message || "A new verification code has been sent.");
      setResendSecondsLeft(result.resendSecondsLeft ?? 60);
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
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
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
            disabled={isResending || resendSecondsLeft > 0}
            className="auth-link strong"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor:
                isResending || resendSecondsLeft > 0 ? "default" : "pointer",
            }}
          >
            {isResending
              ? "Sending..."
              : resendSecondsLeft > 0
                ? `Resend in ${formatCountdown(resendSecondsLeft)}`
                : "Resend it"}
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

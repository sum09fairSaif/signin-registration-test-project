"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailSentPage() {
  const params = useSearchParams();
  const email = params.get("email");

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card" style={{ textAlign: "center" }}>
        <h1 className="auth-title">Check Your Email</h1>

        <p className="auth-subtitle" style={{ marginTop: "10px" }}>
          Your account has been created successfully.
        </p>

        <p className="auth-info" style={{ marginTop: "10px" }}>
          We sent a verification link to:
        </p>

        {email && (
          <p
            style={{
              fontWeight: "bold",
              marginTop: "6px",
              color: "white",
            }}
          >
            {email}
          </p>
        )}

        <p className="auth-info" style={{ marginTop: "16px" }}>
          Please check your inbox and click the verification link to activate your account.
        </p>

        <div style={{ marginTop: "28px" }}>
          <Link href="/login" className="auth-button" style={{ display: "inline-block", padding: "14px 28px" }}>
            Go to Login
          </Link>
        </div>
      </section>
    </main>
  );
}
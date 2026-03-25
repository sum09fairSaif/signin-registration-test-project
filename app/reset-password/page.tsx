import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ResetPasswordForm from "./ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="auth-page">
        <div className="auth-overlay" />

        <section className="auth-card" style={{ textAlign: "center" }}>
          <h1 className="auth-title">Invalid Link</h1>
          <p className="auth-subtitle">
            This reset password link is invalid.
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

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return (
      <main className="auth-page">
        <div className="auth-overlay" />

        <section className="auth-card" style={{ textAlign: "center" }}>
          <h1 className="auth-title">Link Expired</h1>
          <p className="auth-subtitle">
            This reset password link has expired or is no longer valid.
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

  return <ResetPasswordForm token={token} />;
}

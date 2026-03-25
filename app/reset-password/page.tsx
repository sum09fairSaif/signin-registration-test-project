import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ResetPasswordForm from "./ResetPasswordForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
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
          <Link href="/login" className="auth-button" style={{ marginTop: "20px" }}>
            Back to Login
          </Link>
        </section>
      </main>
    );
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    return (
      <main className="auth-page">
        <div className="auth-overlay" />
        <section className="auth-card" style={{ textAlign: "center" }}>
          <h1 className="auth-title">Link Expired</h1>
          <p className="auth-subtitle">
            This reset password link has expired or is no longer valid.
          </p>
          <Link href="/login" className="auth-button" style={{ marginTop: "20px" }}>
            Back to Login
          </Link>
        </section>
      </main>
    );
  }

  return <ResetPasswordForm token={token} />;
}

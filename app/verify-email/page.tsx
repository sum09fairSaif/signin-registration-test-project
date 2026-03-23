import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main
        style={{
          maxWidth: "500px",
          margin: "40px auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>Invalid verification link</h1>
      </main>
    );
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    return (
      <main
        style={{
          maxWidth: "500px",
          margin: "40px auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>Verification link is invalid or expired</h1>
      </main>
    );
  }

  await prisma.user.update({
    where: { email: record.email },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  redirect("/login?verified=1");
}

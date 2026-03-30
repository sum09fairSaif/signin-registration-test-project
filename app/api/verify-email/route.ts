import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { signIn } from "@/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/login?verification=invalid", request.url));
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?verification=expired", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { email: record.email },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?verification=missing", request.url));
  }

  const wasAlreadyVerified = Boolean(user.emailVerified);

  if (!wasAlreadyVerified) {
    await prisma.user.update({
      where: { email: record.email },
      data: {
        emailVerified: new Date(),
      },
    });

    await sendWelcomeEmail(user.email, user.name);
  }

  return await signIn("credentials", {
    email: user.email,
    emailVerificationToken: token,
    redirectTo: "/dashboard",
  });
}

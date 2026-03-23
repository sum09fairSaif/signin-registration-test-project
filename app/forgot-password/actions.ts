"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // IMPORTANT: Always return same message
  if (!user) {
    return {
      message: "If an account exists, a reset link has been sent.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 min
    },
  });

  console.log(`RESET LINK: http://localhost:3000/reset-password?token=${token}`);

  return {
    message: "If an account exists, a reset link has been sent.",
  };
}
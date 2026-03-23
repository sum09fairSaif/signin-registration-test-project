"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";

  const user = await prisma.user.findUnique({
    where: { email },
  });

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
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  await sendPasswordResetEmail(email, token);

  return {
    message: "If an account exists, a reset link has been sent.",
  };
}
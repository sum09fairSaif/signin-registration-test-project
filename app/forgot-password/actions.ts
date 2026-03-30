"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const successMessage = "If an account exists, a reset link has been sent.";

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { email },
    });
  } catch {
    return {
      success: false,
      error:
        "We couldn't process your reset request right now. Please try again in a moment.",
    };
  }

  if (!user) {
    return {
      success: true,
      message: successMessage,
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  try {
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    await sendPasswordResetEmail(email, token);
  } catch {
    return {
      success: false,
      error:
        "We couldn't send a reset link right now. Please try again in a moment.",
    };
  }

  return {
    success: true,
    message: successMessage,
  };
}

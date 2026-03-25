"use server";

import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

export async function resetPassword(formData: FormData) {
  const token = formData.get("token")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!token) {
    return {
      success: false,
      error: "Invalid or missing reset token.",
    };
  }

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord) {
    return {
      success: false,
      error: "This reset link is invalid or expired.",
    };
  }

  if (resetRecord.expiresAt < new Date()) {
    return {
      success: false,
      error: "This reset link has expired. Please request a new one.",
    };
  }

  const hashedPassword = await argon2.hash(password);

  await prisma.user.update({
    where: { email: resetRecord.email },
    data: { passwordHash: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return {
    success: true,
    message: "Password reset successful. Redirecting to login...",
  };
}
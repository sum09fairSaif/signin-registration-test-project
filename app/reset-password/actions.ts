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

  if (!password) {
    return {
      success: false,
      error: "Please enter a new password.",
    };
  }

  let resetRecord;

  try {
    resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
  } catch {
    return {
      success: false,
      error:
        "We couldn't verify your reset link right now. Please try again in a moment.",
    };
  }

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

  let user;

  try {
    user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
      select: { passwordHash: true },
    });
  } catch {
    return {
      success: false,
      error:
        "We couldn't verify your account right now. Please try again in a moment.",
    };
  }

  if (!user) {
    return {
      success: false,
      error: "We couldn't find an account for this reset link.",
    };
  }

  const isCurrentPassword = await argon2.verify(user.passwordHash, password);

  if (isCurrentPassword) {
    return {
      success: false,
      error: "Your new password must be different from your current password.",
    };
  }

  const hashedPassword = await argon2.hash(password);

  try {
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });
  } catch {
    return {
      success: false,
      error:
        "We couldn't reset your password right now. Please try again in a moment.",
    };
  }

  return {
    success: true,
    message: "Password reset successful. Redirecting to login...",
  };
}

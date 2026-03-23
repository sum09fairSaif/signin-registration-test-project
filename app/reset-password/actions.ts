"use server";

import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

export async function resetPassword(formData: FormData, token: string) {
  const password = formData.get("password")?.toString() ?? "";

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord) {
    return { message: "Invalid or expired token" };
  }

  if (resetRecord.expiresAt < new Date()) {
    return { message: "Token expired" };
  }

  const hashedPassword = await argon2.hash(password);

  await prisma.user.update({
    where: { email: resetRecord.email },
    data: { passwordHash: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });

  return { message: "Password reset successful!" };
}
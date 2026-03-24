"use server";

import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { sendLoginOtpEmail } from "@/lib/email";

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  if (!user.emailVerified) {
    return {
      success: false,
      error: "Please verify your email before logging in.",
    };
  }

  const passwordMatch = await argon2.verify(user.passwordHash, password);

  if (!passwordMatch) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  const code = generateSixDigitCode();

  await prisma.loginVerificationToken.deleteMany({
    where: { email },
  });

  await prisma.loginVerificationToken.create({
    data: {
      email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    },
  });

  await sendLoginOtpEmail(email, code);

  return {
    success: true,
    requiresOtp: true,
    email,
    message: "A verification code has been sent to your email.",
  };
}

"use server";

import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import crypto from "crypto";
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
  const loginToken = crypto.randomBytes(32).toString("hex");

  await prisma.loginVerificationToken.deleteMany({
    where: { email },
  });

  await prisma.loginVerificationToken.create({
    data: {
      email,
      code,
      loginToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
      lastSentAt: new Date(),
      resendCount: 0,
    },
  });

  await sendLoginOtpEmail(email, code);

  return {
    success: true,
    requiresOtp: true,
    email,
    loginToken,
    resendSecondsLeft: 60,
    message: "A verification code has been sent to your email.",
  };
}

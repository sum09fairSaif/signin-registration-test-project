"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { sendLoginOtpEmail } from "@/lib/email";

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function verifyLoginCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const code = formData.get("code")?.toString().trim() ?? "";
  const loginToken = formData.get("loginToken")?.toString().trim() ?? "";

  const record = await prisma.loginVerificationToken.findFirst({
    where: {
      email,
      code,
      loginToken,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    return {
      success: false,
      error: "Invalid or expired code.",
    };
  }

  if (record.expiresAt < new Date()) {
    await prisma.loginVerificationToken.deleteMany({
      where: { email },
    });

    return {
      success: false,
      error: "Invalid or expired code.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      loginToken,
      redirectTo: "/dashboard",
    });

    return {
      success: true,
      message: "Verification successful.",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Login could not be completed.",
      };
    }

    throw error;
  }
}

export async function resendLoginCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const loginToken = formData.get("loginToken")?.toString().trim() ?? "";

  const record = await prisma.loginVerificationToken.findFirst({
    where: {
      email,
      loginToken,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    return {
      success: false,
      error: "Session expired. Please log in again.",
    };
  }

  const newCode = generateSixDigitCode();

  await prisma.loginVerificationToken.update({
    where: {
      id: record.id,
    },
    data: {
      code: newCode,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    },
  });

  await sendLoginOtpEmail(email, newCode);

  return {
    success: true,
    message: "A new verification code has been sent.",
  };
}

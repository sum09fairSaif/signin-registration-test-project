"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function verifyLoginCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const code = formData.get("code")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const record = await prisma.loginVerificationToken.findFirst({
    where: {
      email,
      code,
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

  await prisma.loginVerificationToken.deleteMany({
    where: { email },
  });

  try {
    await signIn("credentials", {
      email,
      password,
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
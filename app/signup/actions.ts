"use server";

import { signupSchema } from "@/lib/validations/signup";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import crypto from "crypto";
import { sendEmailVerificationEmail } from "@/lib/email";

export async function validateSignupForm(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = signupSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = result.data;

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    return {
      success: false,
      errors: { email: ["Email already registered"] },
    };
  }

  const hashedPassword = await argon2.hash(password);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      emailVerified: null,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  });

  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  await sendEmailVerificationEmail(email, token);

  return {
    success: true,
    message: "Account created. Please check your email to verify your account.",
  };
}

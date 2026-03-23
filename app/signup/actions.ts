"use server";

import { signupSchema } from "@/lib/validations/signup";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

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
    },
  });

  return {
    success: true,
    message: "Account created successfully!",
  };
}

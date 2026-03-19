"use server";

import { loginSchema } from "@/lib/validations/login";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

export async function loginUser(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  const passwordMatch = await argon2.verify(user.passwordHash, password);

  if (!passwordMatch) {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  return {
    success: true,
    message: "Login successful!",
    userId: user.id,
  };
}

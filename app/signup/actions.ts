"use server";

import { signupSchema } from "@/lib/validations/signup";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

export async function validateSignupForm(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = signupSchema.safeParse(rawData);

  if (!result.success) {
    console.log("VALIDATION ERRORS:", result.error.flatten().fieldErrors);
    return;
  }

  const { name, email, phone, password } = result.data;

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    console.log("ERROR: Email already registered");
    return;
  }

  if (phone && phone.trim() !== "") {
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserByPhone) {
      console.log("ERROR: Phone number already registered");
      return;
    }
  }

  const hashedPassword = await argon2.hash(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone && phone.trim() !== "" ? phone : null,
      passwordHash: hashedPassword,
    },
  });

  console.log("USER CREATED SUCCESSFULLY:", newUser.id);
}

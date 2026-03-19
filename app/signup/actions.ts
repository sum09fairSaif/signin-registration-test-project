"use server";

import { signupSchema } from "@/lib/validations/signup";

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

  console.log("VALID DATA:", result.data);
}

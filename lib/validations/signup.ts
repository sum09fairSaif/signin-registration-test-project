import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name is too long"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[0-9]/, "Password must include at least one number")
      .regex(
        /[!._\-*#$&%\\?/^@]/,
        "Password must include at least one special character (!._-*#$&%\\?/^@)",
      )
      .regex(
        /^[A-Za-z0-9!._\-*#$&%\\?/^@]+$/,
        "Password contains invalid characters",
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

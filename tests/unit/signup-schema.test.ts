import { describe, expect, it } from "vitest";
import { signupSchema } from "@/lib/validations/signup";

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Strong1!",
      confirmPassword: "Strong1!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Strong1!",
      confirmPassword: "Wrong1!",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords without a required special character", () => {
    const result = signupSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Strong123",
      confirmPassword: "Strong123",
    });

    expect(result.success).toBe(false);
  });
});

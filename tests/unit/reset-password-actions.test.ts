import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    passwordResetToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  argon2: {
    verify: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("argon2", () => ({
  default: mocks.argon2,
}));

import { resetPassword } from "@/app/reset-password/actions";

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a new password that matches the current password", async () => {
    mocks.prisma.passwordResetToken.findUnique.mockResolvedValue({
      email: "jane@example.com",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.prisma.user.findUnique.mockResolvedValue({
      passwordHash: "existing-hash",
    });
    mocks.argon2.verify.mockResolvedValue(true);

    const formData = new FormData();
    formData.append("token", "reset-token");
    formData.append("password", "Strong1!");

    const result = await resetPassword(formData);

    expect(result).toEqual({
      success: false,
      error: "Your new password must be different from your current password.",
    });
    expect(mocks.argon2.hash).not.toHaveBeenCalled();
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
    expect(mocks.prisma.passwordResetToken.delete).not.toHaveBeenCalled();
  });
});

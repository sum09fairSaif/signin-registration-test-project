import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    loginVerificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
  argon2: {
    verify: vi.fn(),
  },
  crypto: {
    randomBytes: vi.fn(),
  },
  sendLoginOtpEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

vi.mock("argon2", () => ({
  default: mocks.argon2,
}));

vi.mock("crypto", () => ({
  default: mocks.crypto,
}));

vi.mock("@/lib/email", () => ({
  sendLoginOtpEmail: mocks.sendLoginOtpEmail,
}));

import { loginUser } from "@/app/login/actions";

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a generic error when the user does not exist", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);

    const formData = new FormData();
    formData.append("email", "missing@example.com");
    formData.append("password", "Strong1!");

    const result = await loginUser(formData);

    expect(result).toEqual({
      success: false,
      error: "Invalid email or password",
    });
    expect(mocks.argon2.verify).not.toHaveBeenCalled();
    expect(mocks.sendLoginOtpEmail).not.toHaveBeenCalled();
  });

  it("returns a generic error when the password is wrong", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      email: "jane@example.com",
      passwordHash: "stored-hash",
      emailVerified: new Date(),
    });
    mocks.argon2.verify.mockResolvedValue(false);

    const formData = new FormData();
    formData.append("email", "jane@example.com");
    formData.append("password", "Wrong1!");

    const result = await loginUser(formData);

    expect(result).toEqual({
      success: false,
      error: "Invalid email or password",
    });
    expect(mocks.prisma.loginVerificationToken.create).not.toHaveBeenCalled();
    expect(mocks.sendLoginOtpEmail).not.toHaveBeenCalled();
  });

  it("creates an OTP challenge when the credentials are valid", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      email: "jane@example.com",
      passwordHash: "stored-hash",
      emailVerified: new Date(),
    });
    mocks.argon2.verify.mockResolvedValue(true);
    mocks.crypto.randomBytes.mockReturnValue(Buffer.from("login-token"));
    mocks.prisma.loginVerificationToken.deleteMany.mockResolvedValue({ count: 0 });
    mocks.prisma.loginVerificationToken.create.mockResolvedValue({
      id: "otp-record",
    });
    mocks.sendLoginOtpEmail.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.append("email", "jane@example.com");
    formData.append("password", "Strong1!");

    const result = await loginUser(formData);

    expect(result).toMatchObject({
      success: true,
      requiresOtp: true,
      email: "jane@example.com",
      resendSecondsLeft: 60,
      message: "A verification code has been sent to your email.",
    });
    expect(mocks.prisma.loginVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { email: "jane@example.com" },
    });
    expect(mocks.prisma.loginVerificationToken.create).toHaveBeenCalledTimes(1);
    expect(mocks.sendLoginOtpEmail).toHaveBeenCalledTimes(1);
  });
});

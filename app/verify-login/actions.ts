"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { sendLoginOtpEmail } from "@/lib/email";

function generateSixDigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getCooldownSeconds() {
  return 60;
}

const invalidCodeMessage = "Invalid/expired/wrong code entered";

export async function verifyLoginCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const code = formData.get("code")?.toString().trim() ?? "";
  const loginToken = formData.get("loginToken")?.toString().trim() ?? "";

  let record;

  try {
    record = await prisma.loginVerificationToken.findFirst({
      where: {
        email,
        code,
        loginToken,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch {
    return {
      success: false,
      error: invalidCodeMessage,
    };
  }

  if (!record) {
    return {
      success: false,
      error: invalidCodeMessage,
    };
  }

  if (record.expiresAt < new Date()) {
    try {
      await prisma.loginVerificationToken.deleteMany({
        where: { email },
      });
    } catch {
      return {
        success: false,
        error: invalidCodeMessage,
      };
    }

    return {
      success: false,
      error: invalidCodeMessage,
    };
  }

  try {
    await signIn("credentials", {
      email,
      loginToken,
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
        error: invalidCodeMessage,
      };
    }

    throw error;
  }
}

export async function resendLoginCode(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const loginToken = formData.get("loginToken")?.toString().trim() ?? "";
  const resendFailureMessage =
    "We couldn't resend your code right now. Please try again in a moment.";

  let record;

  try {
    record = await prisma.loginVerificationToken.findFirst({
      where: {
        email,
        loginToken,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch {
    return {
      success: false,
      error: resendFailureMessage,
    };
  }

  if (!record) {
    return {
      success: false,
      error: "Session expired. Please log in again.",
    };
  }

  const cooldownSeconds = getCooldownSeconds();
  const secondsSinceLastSend = Math.floor(
    (Date.now() - record.lastSentAt.getTime()) / 1000
  );
  const secondsRemaining = Math.max(0, cooldownSeconds - secondsSinceLastSend);

  if (secondsRemaining > 0) {
    return {
      success: false,
      error: `Please wait ${secondsRemaining} seconds before requesting another code.`,
      resendSecondsLeft: secondsRemaining,
    };
  }

  const newCode = generateSixDigitCode();
  const nextResendCount = record.resendCount + 1;
  const nextCooldownSeconds = getCooldownSeconds();

  try {
    await prisma.loginVerificationToken.update({
      where: {
        id: record.id,
      },
      data: {
        code: newCode,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        lastSentAt: new Date(),
        resendCount: nextResendCount,
      },
    });

    await sendLoginOtpEmail(email, newCode);
  } catch {
    return {
      success: false,
      error: resendFailureMessage,
    };
  }

  return {
    success: true,
    message: "A new verification code has been sent.",
    resendSecondsLeft: nextCooldownSeconds,
  };
}

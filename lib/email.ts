import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 15 minutes.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendLoginOtpEmail(to: string, code: string) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Your login verification code",
    html: `
      <h2>Your login verification code</h2>
      <p>Enter this code to complete your login:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
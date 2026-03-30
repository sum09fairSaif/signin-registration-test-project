import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        loginToken: {},
        emailVerificationToken: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const loginToken = credentials?.loginToken as string | undefined;
        const emailVerificationToken = credentials?.emailVerificationToken as
          | string
          | undefined;

        if (!email) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        if (!user.emailVerified) {
          return null;
        }

        // First-time sign-in right after successful email verification
        if (emailVerificationToken) {
          const verificationRecord =
            await prisma.emailVerificationToken.findUnique({
              where: { token: emailVerificationToken },
            });

          if (!verificationRecord || verificationRecord.email !== email) {
            return null;
          }

          if (verificationRecord.expiresAt < new Date()) {
            await prisma.emailVerificationToken.deleteMany({
              where: { email },
            });
            return null;
          }

          await prisma.emailVerificationToken.deleteMany({
            where: { email },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        // OTP-completed login path
        if (loginToken) {
          const verificationRecord =
            await prisma.loginVerificationToken.findFirst({
              where: {
                email,
                loginToken,
              },
              orderBy: {
                createdAt: "desc",
              },
            });

          if (!verificationRecord) {
            return null;
          }

          if (verificationRecord.expiresAt < new Date()) {
            await prisma.loginVerificationToken.deleteMany({
              where: { email },
            });
            return null;
          }

          // single-use
          await prisma.loginVerificationToken.deleteMany({
            where: { email },
          });

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        // Normal password-first login path
        if (!password) {
          return null;
        }

        const passwordMatch = await argon2.verify(user.passwordHash, password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.userId = token.userId as string;
      }
      return session;
    },
  },
});

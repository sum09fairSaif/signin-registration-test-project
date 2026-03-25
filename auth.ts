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
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const loginToken = credentials?.loginToken as string | undefined;

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
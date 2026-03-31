# AuthFlows

AuthFlows is a full-stack authentication demo built with Next.js App Router, Auth.js, Prisma, PostgreSQL, and Resend. It covers the full account lifecycle: sign up, verify email, log in with a password plus email OTP, reset a password, and manage a profile inside a protected dashboard.

## What The App Does

- Register a new account with name, email, password, and password confirmation
- Validate signup input on the server with `zod`
- Hash passwords with `argon2`
- Send email verification links with Resend
- Auto-sign the user in after successful email verification
- Require a 6-digit email OTP after password login
- Support OTP resend with a database-backed cooldown
- Let users request password reset links
- Prevent password resets from reusing the current password
- Protect the dashboard with middleware and Auth.js session checks
- Let signed-in users edit their profile, including addresses, bio, and profile image

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Auth.js / NextAuth v5 beta
- Prisma ORM
- PostgreSQL
- Resend
- Zod
- ESLint

## Main Routes

### Public

- `/login`
- `/signup`
- `/verify-email-sent`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/verify-login`

### Protected

- `/`
- `/dashboard`

`/` redirects authenticated users to `/dashboard` and everyone else to `/login`.

## Current Auth Flow

### Signup

1. The user submits name, email, password, and confirmation on `/signup`.
2. `signupSchema` validates the form data on the server.
3. Duplicate emails are rejected.
4. The password is hashed with `argon2`.
5. A new `User` is created with `emailVerified = null`.
6. A 24-hour `EmailVerificationToken` is created.
7. A verification email is sent.
8. The user is redirected to `/verify-email-sent`.

### Email Verification

1. The email link opens `/verify-email?token=...`.
2. That page forwards to `/api/verify-email`.
3. The token is checked for existence and expiry.
4. The matching user is marked as verified if this is the first valid verification.
5. A welcome email is sent on first verification.
6. The user is signed in through the Auth.js credentials provider.
7. The user is redirected to `/dashboard`.

### Login With OTP

1. The user submits email and password on `/login`.
2. The app checks that the account exists and the email is verified.
3. The password is verified against the stored `passwordHash`.
4. A 6-digit code and `loginToken` are created in `LoginVerificationToken`.
5. The code is emailed to the user.
6. The user is redirected to `/verify-login`.
7. The user enters the code to complete sign-in.
8. On success, the token is consumed and the user is redirected to `/dashboard`.

The verify-login screen also supports resending the code, with a 60-second cooldown tracked using `lastSentAt` and `resendCount`.

### Password Reset

1. The user requests a reset link from `/forgot-password`.
2. If the account exists, the app creates a 15-minute `PasswordResetToken`.
3. A reset link is emailed to the user.
4. The user opens `/reset-password?token=...`.
5. The token is validated before password update.
6. The new password is compared against the current password hash.
7. If it is different, the password is hashed and saved.
8. The reset token is deleted after use.

## Dashboard

After sign-in, `/dashboard` shows account and profile information pulled from the database.

### Current dashboard UI

- Welcome header with profile avatar
- Account overview cards
- Name and email display
- Member-since date
- Short bio preview
- Logout button
- Editable profile form

### Editable profile fields

The current profile form supports:

- `name`
- `age`
- `gender`
- `image`
- `homeAddress`
- `workAddress`
- `bio`

Profile updates run through a server action in `app/dashboard/actions.ts` and revalidate `/dashboard` after save.

### Profile image handling

- Accepts PNG, JPG, JPEG, WEBP, and GIF
- Rejects files over 5 MB before processing
- Compresses and resizes images in the browser before submit
- Stores the resulting image as a data URL
- Falls back to a generated SVG avatar if no profile image exists

## Data Model

The Prisma schema currently includes these main models.

### `User`

- `id`
- `name`
- `email`
- `phone`
- `passwordHash`
- `age`
- `gender`
- `image`
- `homeAddress`
- `workAddress`
- `bio`
- `emailVerified`
- `phoneVerified`
- `createdAt`
- `updatedAt`

### `EmailVerificationToken`

- `id`
- `email`
- `token`
- `expiresAt`
- `createdAt`

### `LoginVerificationToken`

- `id`
- `email`
- `code`
- `loginToken`
- `expiresAt`
- `lastSentAt`
- `resendCount`
- `createdAt`

### `PasswordResetToken`

- `id`
- `email`
- `token`
- `expiresAt`
- `createdAt`

## Key Files

```text
app/
  api/auth/[...nextauth]/route.ts    Auth.js route handlers
  api/verify-email/route.ts          Email verification + auto-login
  dashboard/                         Protected dashboard UI and profile updates
  forgot-password/                   Reset-link request UI and action
  login/                             Password-first login flow
  reset-password/                    Password reset UI and action
  signup/                            Registration UI and server action
  verify-email/                      Verification handoff page
  verify-email-sent/                 Post-signup confirmation screen
  verify-login/                      OTP verification and resend flow
auth.ts                              Auth.js configuration
lib/avatar.ts                        Fallback avatar generator
lib/email.ts                         Resend email helpers
lib/prisma.ts                        Prisma client setup
lib/validations/                     Zod schemas
middleware.ts                        Route protection
prisma/schema.prisma                 Database schema
types/next-auth.d.ts                 Session/JWT type extensions
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=
AUTH_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
APP_URL=http://localhost:3000
```

Notes:

- `DATABASE_URL` points to my PostgreSQL instance.
- `AUTH_SECRET` is required by Auth.js.
- `RESEND_API_KEY` and `EMAIL_FROM` are required for transactional emails.
- `APP_URL` should match the base URL where the app is running.

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Add your environment variables to `.env`.

3. Run the database migrations.

```bash
npx prisma migrate dev
```

4. Start the dev server.

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Architecture Notes

- Auth is centralized in `auth.ts` with a custom credentials provider.
- Sessions use the JWT strategy.
- Middleware protects all non-public routes by checking the Auth.js token.
- Verification, login OTP, and password reset each use their own token table.
- Most writes are handled with Next.js Server Actions.

## Current Limitations

- `phone` and `phoneVerified` exist in the schema but are not yet surfaced in the UI.
- Profile images are stored directly as data URLs rather than in object storage.
- There is no automated test suite configured yet.

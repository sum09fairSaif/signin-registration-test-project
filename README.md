# AuthFlows

AuthFlows is a Next.js App Router authentication demo that combines email/password signup, email verification, OTP-assisted login, password reset, protected routes, and a profile dashboard backed by PostgreSQL and Prisma.

The app is built to show a complete account lifecycle, from registration through verification and sign-in to profile editing inside a protected dashboard.

## Current Features

- Sign up with name, email, password, and confirmation
- Server-side validation with `zod`
- Password hashing with `argon2`
- Email verification links sent with Resend
- Automatic sign-in after successful email verification
- Password-first login followed by a 6-digit email OTP
- OTP resend flow with a 60-second cooldown
- Forgot-password email flow with expiring reset tokens
- Reset-password flow that rejects reusing the current password
- Protected dashboard guarded by middleware and Auth.js session checks
- Editable profile data: name, age, gender, home address, work address, bio, and profile picture
- Client-side image compression before profile image upload
- Default generated avatar when no custom image is set

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

## Routes

### Public routes

- `/login`
- `/signup`
- `/forgot-password`
- `/verify-email`
- `/verify-login`
- `/reset-password`

### Protected routes

- `/`
- `/dashboard`

The root route redirects authenticated users to `/dashboard` and everyone else to `/login`.

## Auth Flow

### 1. Registration

When a user signs up:

1. The form is validated with `signupSchema`.
2. The app rejects duplicate emails.
3. The password is hashed with `argon2`.
4. A `User` record is created with `emailVerified = null`.
5. A 24-hour email verification token is stored.
6. A verification email is sent through Resend.

### 2. Email verification

When the user opens the verification link:

1. `/verify-email` forwards to `/api/verify-email`.
2. The token is checked for existence and expiry.
3. The user is marked as verified if this is the first successful verification.
4. A welcome email is sent once on first verification.
5. The user is automatically signed in through the credentials provider.
6. The user is redirected to `/dashboard`.

### 3. Login with OTP

The login flow is intentionally two-step:

1. The user submits email and password on `/login`.
2. The password is verified against the stored `passwordHash`.
3. If the account is verified, the app creates a 6-digit code and a `loginToken`.
4. The code is emailed to the user.
5. The user is redirected to `/verify-login`.
6. The code must match the latest unexpired verification record.
7. On success, the user is signed in and redirected to `/dashboard`.

The verify-login screen also supports resending the OTP, with a 60-second cooldown tracked in the database.

### 4. Password reset

If a user forgets their password:

1. They request a reset link on `/forgot-password`.
2. The app creates a `PasswordResetToken` with a 15-minute expiry.
3. The reset link is emailed through Resend.
4. The user opens `/reset-password?token=...`.
5. The token is validated before allowing a reset.
6. The new password is hashed and stored.
7. The reset token is deleted after use.

The reset flow also prevents the user from setting the same password they are already using.

## Dashboard

After authentication, users land on `/dashboard`, which currently includes:

- Account overview cards
- Display name and email
- Member-since date
- Short bio preview
- Editable profile form
- Logout button

### Editable profile fields

The dashboard profile form currently supports:

- `name`
- `age`
- `gender`
- `image`
- `homeAddress`
- `workAddress`
- `bio`

Profile updates are handled by a server action and revalidated with `revalidatePath("/dashboard")`.

### Profile image handling

Profile pictures are selected client-side and compressed before submit:

- Accepted types: PNG, JPG, JPEG, WEBP, GIF
- Max upload size before processing: 5 MB
- Images are resized in the browser
- Compressed images are stored as data URLs in the database

If the user has no image, the app falls back to a generated SVG avatar.

## Data Model

The Prisma schema currently includes these main models:

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

## Project Structure

```text
app/
  api/auth/[...nextauth]/route.ts    Auth.js route handlers
  api/verify-email/route.ts          Verification + auto-login
  dashboard/                         Protected dashboard UI and profile updates
  forgot-password/                   Reset-link request page and action
  login/                             Email/password login step
  reset-password/                    Final password reset page and action
  signup/                            Registration UI and server action
  verify-email/                      Verification handoff page
  verify-login/                      OTP verification page and resend flow
auth.ts                              Auth.js configuration
lib/email.ts                         Resend email helpers
lib/prisma.ts                        Prisma client setup
lib/avatar.ts                        Fallback avatar generator
lib/validations/                     Zod validation schemas
middleware.ts                        Route protection
prisma/schema.prisma                 Database schema
```

## Environment Variables

Create a `.env` file with these values:

```env
DATABASE_URL=
AUTH_SECRET=
RESEND_API_KEY=
EMAIL_FROM=
APP_URL=http://localhost:3000
```

Notes:

- `DATABASE_URL` should point to your PostgreSQL database.
- `AUTH_SECRET` is used by Auth.js.
- `RESEND_API_KEY` and `EMAIL_FROM` are required for email delivery.
- `APP_URL` should match the base URL where the app is running.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set your environment variables in `.env`.

3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Development Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Architecture Notes

- Auth is centralized in [`auth.ts`](./auth.ts) using a custom credentials provider.
- Sessions use the JWT strategy.
- Middleware protects non-public routes by checking for a valid Auth.js token.
- Email verification, login OTPs, and password reset all use separate database-backed token tables.
- Most mutations are implemented as Next.js Server Actions.

## Current Limitations

- Phone and `phoneVerified` exist in the schema but are not yet exposed in the UI.
- Profile images are stored as data URLs rather than external object storage.
- There is no automated test suite configured yet.

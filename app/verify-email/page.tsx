import { redirect } from "next/navigation";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main
        style={{
          maxWidth: "500px",
          margin: "40px auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>Invalid verification link</h1>
      </main>
    );
  }

  redirect(`/api/verify-email?token=${encodeURIComponent(token)}`);
}

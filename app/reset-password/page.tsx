"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "./actions";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await resetPassword(formData, token || "");
    setMessage(result.message);
  }

  return (
    <main style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h1>Reset Password</h1>

      {message && <p>{message}</p>}

      <form action={handleSubmit}>
        <input name="password" type="password" placeholder="New password" />
        <button type="submit">Reset Password</button>
      </form>
    </main>
  );
}

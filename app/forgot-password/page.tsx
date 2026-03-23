"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await requestPasswordReset(formData);
    setMessage(result.message);
  }

  return (
    <main style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h1>Forgot Password</h1>

      {message && <p>{message}</p>}

      <form action={handleSubmit}>
        <input name="email" type="email" placeholder="Enter your email" />
        <button type="submit">Send Reset Link</button>
      </form>
    </main>
  );
}
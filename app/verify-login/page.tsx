"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { verifyLoginCode } from "./actions";

export default function VerifyLoginPage() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = await verifyLoginCode(formData);

    if (!result) return;

    if (!result.success) {
      setError(result.error || "Invalid or expired code.");
      setMessage("");
    } else {
      setError("");
      setMessage(result.message || "Verification successful.");
    }
  }

  return (
    <main
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Verify Login</h1>
      <p>Enter the verification code sent to your email.</p>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <input type="hidden" name="email" value={email} />

        <div>
          <label>Verification Code</label>
          <input
            name="code"
            type="text"
            maxLength={6}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "6px",
            }}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            name="password"
            type="password"
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "6px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{ padding: "10px 16px", cursor: "pointer" }}
        >
          Verify and Log In
        </button>
      </form>
    </main>
  );
}
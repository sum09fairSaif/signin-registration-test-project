"use client";

import { useState } from "react";
import { loginUser } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await loginUser(formData);

    if (result && !result.success) {
      setError(result.error || "Invalid email or password");
    } else {
      setError("");
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
      <h1>Login</h1>

      <form
        action={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
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

        {error && (
          <p style={{ color: "red", marginTop: "8px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </main>
  );
}

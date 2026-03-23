"use client";

import { useState } from "react";
import { validateSignupForm } from "./actions";

export default function SignupPage() {
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await validateSignupForm(formData);

    if (!result) return;

    if (!result.success) {
      setErrors(result.errors || {});
      setSuccess("");
    } else {
      setErrors({});
      setSuccess(result.message || "Success!");
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
      <h1>Create an Account</h1>

      {success && (
        <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
      )}

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
          <label>Full Name</label>
          <input name="name" type="text" />
          {errors.name && <p style={{ color: "red" }}>{errors.name[0]}</p>}
        </div>

        <div>
          <label>Email</label>
          <input name="email" type="email" />
          {errors.email && <p style={{ color: "red" }}>{errors.email[0]}</p>}
        </div>

        <div>
          <label>Password</label>
          <input name="password" type="password" />
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label>Confirm Password</label>
          <input name="confirmPassword" type="password" />
          {errors.confirmPassword && (
            <p style={{ color: "red" }}>{errors.confirmPassword[0]}</p>
          )}
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </main>
  );
}

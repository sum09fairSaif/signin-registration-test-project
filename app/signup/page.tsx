"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock } from "lucide-react";
import { validateSignupForm } from "./actions";

export default function SignupPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const result = await validateSignupForm(formData);

    if (!result) return;

    if (!result.success) {
      setErrors(result.errors || {});
      setSuccess("");
    } else {
      setErrors({});
      setSuccess(
        result.message || "Account created successfully. Please verify your email."
      );
      event.currentTarget.reset();
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-overlay" />

      <section className="auth-card">
        <h1 className="auth-title">Register</h1>
        <p className="auth-subtitle">
          Create your account and get started securely.
        </p>

        {success && <p className="auth-success">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-wrap">
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              className="auth-input"
              autoComplete="name"
              required
            />
            <User className="auth-input-icon" size={18} />
            {errors.name && <p className="auth-field-error">{errors.name[0]}</p>}
          </div>

          <div className="auth-input-wrap">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="auth-input"
              autoComplete="email"
              required
            />
            <Mail className="auth-input-icon" size={18} />
            {errors.email && <p className="auth-field-error">{errors.email[0]}</p>}
          </div>

          <div className="auth-input-wrap">
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="auth-input"
              autoComplete="new-password"
              required
            />
            <Lock className="auth-input-icon" size={18} />
            {errors.password && (
              <p className="auth-field-error">{errors.password[0]}</p>
            )}
          </div>

          <div className="auth-input-wrap">
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="auth-input"
              autoComplete="new-password"
              required
            />
            <Lock className="auth-input-icon" size={18} />
            {errors.confirmPassword && (
              <p className="auth-field-error">{errors.confirmPassword[0]}</p>
            )}
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-link strong">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

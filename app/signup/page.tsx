import { validateSignupForm } from "./actions";

export default function SignupPage() {
  return (
    <main
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Create an Account</h1>

      <form
        action={validateSignupForm}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        <div>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "6px",
            }}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
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
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              marginTop: "6px",
            }}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
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

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
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
          Sign Up
        </button>
      </form>
    </main>
  );
}

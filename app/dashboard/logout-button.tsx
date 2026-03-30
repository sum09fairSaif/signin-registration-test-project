"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="dashboard-logout-btn"
      onClick={() =>
        startTransition(() => {
          signOut({ callbackUrl: "/login" });
        })
      }
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}

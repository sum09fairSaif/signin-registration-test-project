"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(() => {
          signOut({ callbackUrl: "/login" });
        })
      }
      disabled={isPending}
      style={{ padding: "10px 16px", cursor: "pointer", marginTop: "16px" }}
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}

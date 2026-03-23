import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <p>You are logged in.</p>
      <p>Name: {session.user?.name}</p>
      <p>Email: {session.user?.email}</p>
      <p>User ID: {session.user?.userId}</p>
      <LogoutButton />
    </main>
  );
}
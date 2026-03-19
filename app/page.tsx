import { prisma } from "@/lib/prisma";

export default async function Home() {
  const count = await prisma.user.count();

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Milestone 2 Complete</h1>
      <p>User table has been created successfully.</p>
      <p>Current user count: {count}</p>
    </main>
  );
}

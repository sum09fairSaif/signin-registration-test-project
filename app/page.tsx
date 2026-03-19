import { prisma } from "@/lib/prisma";

export default async function Home() {
  const count = await prisma.test.count();

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Milestone 1 Complete</h1>
      <p>Database connection is working.</p>
      <p>Test table row count: {count}</p>
    </main>
  );
}

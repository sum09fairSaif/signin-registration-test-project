import { prisma } from "@/lib/prisma";


export default async function Home() {
  const count = await prisma.user.count();

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Milestone 4 In Progress</h1>
      <p>Total users in database: {count}</p>
    </main>
  );
}

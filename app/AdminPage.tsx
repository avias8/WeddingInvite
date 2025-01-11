import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const invitees = await prisma.invitee.findMany();
  return (
    <div>
      <h1>Admin - All Invitees</h1>
      {invitees.map((i) => (
        <div key={i.id}>
          {i.name} ({i.email}), Attending: {i.isAttending ? "Yes" : "No"}
        </div>
      ))}
    </div>
  );
}
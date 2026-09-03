import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const salon = await db.query.salons.findFirst({
    where: eq(schema.salons.id, session.salonId),
    columns: { name: true },
  });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar salonName={salon?.name ?? session.salonName} userName={session.name} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

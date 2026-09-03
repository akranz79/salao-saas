import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, asc, eq, gte, lt, like } from "drizzle-orm";
import { Card, PageHeader, StatCard, primaryButtonClass } from "@/components/ui";
import { formatCurrency, formatTime, todayISODate } from "@/lib/format";

export default async function DashboardPage() {
  const session = await verifySession();
  const today = todayISODate();
  const dayStart = new Date(`${today}T00:00:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const todaysAppointments = await db
    .select({
      id: schema.appointments.id,
      startAt: schema.appointments.startAt,
      status: schema.appointments.status,
      clientName: schema.clients.name,
      professionalName: schema.professionals.name,
      serviceName: schema.services.name,
    })
    .from(schema.appointments)
    .innerJoin(schema.clients, eq(schema.appointments.clientId, schema.clients.id))
    .innerJoin(
      schema.professionals,
      eq(schema.appointments.professionalId, schema.professionals.id)
    )
    .innerJoin(schema.services, eq(schema.appointments.serviceId, schema.services.id))
    .where(
      and(
        eq(schema.appointments.salonId, session.salonId),
        gte(schema.appointments.startAt, dayStart.toISOString()),
        lt(schema.appointments.startAt, dayEnd.toISOString())
      )
    )
    .orderBy(asc(schema.appointments.startAt));

  const monthPrefix = today.slice(0, 7);
  const monthTransactions = await db.query.transactions.findMany({
    where: and(
      eq(schema.transactions.salonId, session.salonId),
      like(schema.transactions.date, `${monthPrefix}%`)
    ),
  });
  const monthIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const products = await db.query.products.findMany({
    where: eq(schema.products.salonId, session.salonId),
  });
  const lowStock = products.filter((p) => p.stockQty <= p.minStockQty);

  const totalClients = await db.query.clients.findMany({
    where: eq(schema.clients.salonId, session.salonId),
    columns: { id: true, name: true, birthday: true },
  });
  const birthdaysThisMonth = totalClients.filter(
    (c) => c.birthday && c.birthday.slice(5, 7) === today.slice(5, 7)
  );

  return (
    <div>
      <PageHeader
        title={`Olá, ${session.name.split(" ")[0]} 👋`}
        description={`Aqui está o resumo do ${session.salonName} hoje.`}
        action={
          <Link href="/agenda/novo" className={primaryButtonClass}>
            + Novo agendamento
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Agendamentos hoje"
          value={String(todaysAppointments.length)}
        />
        <StatCard label="Receita do mês" value={formatCurrency(monthIncome)} />
        <StatCard label="Despesas do mês" value={formatCurrency(monthExpense)} />
        <StatCard
          label="Estoque baixo"
          value={String(lowStock.length)}
          hint={lowStock.length > 0 ? "produtos precisam de reposição" : "tudo certo"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">Agenda de hoje</h2>
            <Link href="/agenda" className="text-xs font-medium text-neutral-500 hover:text-neutral-900">
              ver agenda completa →
            </Link>
          </div>
          {todaysAppointments.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-500">
              Nenhum agendamento para hoje.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {todaysAppointments.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-14 font-semibold text-neutral-900">
                      {formatTime(a.startAt)}
                    </span>
                    <span className="text-neutral-900">
                      {a.clientName} · {a.serviceName}
                    </span>
                  </div>
                  <span className="text-neutral-500">{a.professionalName}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {lowStock.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-neutral-900">
                Produtos em falta
              </h2>
              <ul className="space-y-2 text-sm">
                {lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span className="text-neutral-700">{p.name}</span>
                    <span className="font-medium text-red-600">
                      {p.stockQty} {p.unit}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/estoque"
                className="mt-3 inline-block text-xs font-medium text-neutral-500 hover:text-neutral-900"
              >
                ver estoque →
              </Link>
            </Card>
          )}

          {birthdaysThisMonth.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-neutral-900">
                Aniversariantes do mês 🎂
              </h2>
              <ul className="space-y-2 text-sm text-neutral-700">
                {birthdaysThisMonth.slice(0, 6).map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
              <Link
                href="/clientes"
                className="mt-3 inline-block text-xs font-medium text-neutral-500 hover:text-neutral-900"
              >
                ver clientes →
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

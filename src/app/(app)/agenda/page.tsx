import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import {
  Card,
  EmptyState,
  PageHeader,
  inputClass,
  primaryButtonClass,
} from "@/components/ui";
import { formatCurrency, formatTime, todayISODate } from "@/lib/format";
import { StatusActions } from "./StatusActions";

const STATUS_STYLE: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-neutral-100 text-neutral-500",
  no_show: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const session = await verifySession();
  const selectedDate = date || todayISODate();

  const dayStart = new Date(`${selectedDate}T00:00:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await db
    .select({
      id: schema.appointments.id,
      startAt: schema.appointments.startAt,
      endAt: schema.appointments.endAt,
      price: schema.appointments.price,
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

  const prevDate = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const nextDate = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Horários marcados no salão."
        action={
          <Link href="/agenda/novo" className={primaryButtonClass}>
            + Novo agendamento
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href={`/agenda?date=${prevDate}`} className="text-sm text-neutral-500 hover:text-neutral-900">
          ← dia anterior
        </Link>
        <form method="get" className="flex items-center gap-2">
          <input type="date" name="date" defaultValue={selectedDate} className={inputClass} />
          <button type="submit" className={primaryButtonClass}>
            Ir
          </button>
        </form>
        <Link href={`/agenda?date=${nextDate}`} className="text-sm text-neutral-500 hover:text-neutral-900">
          próximo dia →
        </Link>
        <Link href={`/agenda?date=${todayISODate()}`} className="text-sm text-neutral-500 hover:text-neutral-900">
          hoje
        </Link>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento neste dia"
          description="Crie um novo agendamento para começar a preencher a agenda."
          actionHref="/agenda/novo"
          actionLabel="Novo agendamento"
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 shrink-0 text-sm font-semibold text-neutral-900">
                  {formatTime(a.startAt)}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {a.clientName} · {a.serviceName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    com {a.professionalName} · {formatCurrency(a.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status]}`}
                >
                  {STATUS_LABEL[a.status]}
                </span>
                <StatusActions id={a.id} status={a.status} date={selectedDate} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

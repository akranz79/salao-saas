import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { Card, PageHeader, secondaryButtonClass } from "@/components/ui";
import { formatCurrency, formatDateOnly, formatDateTime } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();

  const client = await db.query.clients.findFirst({
    where: and(eq(schema.clients.id, id), eq(schema.clients.salonId, session.salonId)),
  });
  if (!client) notFound();

  const history = await db
    .select({
      id: schema.appointments.id,
      startAt: schema.appointments.startAt,
      status: schema.appointments.status,
      price: schema.appointments.price,
      serviceName: schema.services.name,
      professionalName: schema.professionals.name,
    })
    .from(schema.appointments)
    .innerJoin(schema.services, eq(schema.appointments.serviceId, schema.services.id))
    .innerJoin(
      schema.professionals,
      eq(schema.appointments.professionalId, schema.professionals.id)
    )
    .where(
      and(
        eq(schema.appointments.clientId, client.id),
        eq(schema.appointments.salonId, session.salonId)
      )
    )
    .orderBy(desc(schema.appointments.startAt));

  return (
    <div>
      <PageHeader
        title={client.name}
        description="Ficha e histórico de atendimentos do cliente."
        action={
          <Link href={`/clientes/${client.id}/editar`} className={secondaryButtonClass}>
            Editar cliente
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <h2 className="text-sm font-semibold text-neutral-900">Dados de contato</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">Telefone</dt>
              <dd className="text-neutral-900">{client.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">E-mail</dt>
              <dd className="text-neutral-900">{client.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Aniversário</dt>
              <dd className="text-neutral-900">
                {client.birthday ? formatDateOnly(client.birthday) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Observações</dt>
              <dd className="whitespace-pre-wrap text-neutral-900">
                {client.notes || "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="md:col-span-2 p-0">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Histórico de atendimentos
            </h2>
          </div>
          {history.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-500">
              Nenhum atendimento registrado ainda.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Serviço</th>
                  <th className="px-5 py-3 font-medium">Profissional</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 text-neutral-600">
                      {formatDateTime(h.startAt)}
                    </td>
                    <td className="px-5 py-3 text-neutral-900">{h.serviceName}</td>
                    <td className="px-5 py-3 text-neutral-600">{h.professionalName}</td>
                    <td className="px-5 py-3 text-neutral-600">
                      {formatCurrency(h.price)}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">
                      {STATUS_LABEL[h.status] ?? h.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

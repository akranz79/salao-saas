import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { todayISODate } from "@/lib/format";
import { AppointmentForm } from "./AppointmentForm";

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const session = await verifySession();

  const [clients, professionals, services] = await Promise.all([
    db.query.clients.findMany({ where: eq(schema.clients.salonId, session.salonId) }),
    db.query.professionals.findMany({
      where: eq(schema.professionals.salonId, session.salonId),
    }),
    db.query.services.findMany({ where: eq(schema.services.salonId, session.salonId) }),
  ]);

  if (clients.length === 0 || professionals.length === 0 || services.length === 0) {
    return (
      <div>
        <PageHeader title="Novo agendamento" />
        <EmptyState
          title="Cadastre clientes, profissionais e serviços primeiro"
          description="Para criar um agendamento você precisa de ao menos um cliente, um profissional e um serviço cadastrados."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Novo agendamento" />
      <Card className="max-w-lg">
        <AppointmentForm
          clients={clients}
          professionals={professionals}
          services={services}
          defaultDate={date || todayISODate()}
        />
      </Card>
    </div>
  );
}

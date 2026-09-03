import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Card, PageHeader } from "@/components/ui";
import { SalonSettingsForm } from "./SalonSettingsForm";

export default async function ConfiguracoesPage() {
  const session = await verifySession();
  const salon = await db.query.salons.findFirst({
    where: eq(schema.salons.id, session.salonId),
  });

  if (!salon) return null;

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Dados do salão e conta."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Dados do salão</h2>
          <SalonSettingsForm salon={salon} />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Sua conta</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">Nome</dt>
              <dd className="text-neutral-900">{session.name}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Perfil</dt>
              <dd className="text-neutral-900">
                {session.role === "owner" ? "Proprietário(a)" : "Equipe"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Identificador do salão (slug)</dt>
              <dd className="text-neutral-900">{salon.slug}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}

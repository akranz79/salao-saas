import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { updateServiceAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const service = await db.query.services.findFirst({
    where: and(eq(schema.services.id, id), eq(schema.services.salonId, session.salonId)),
  });

  if (!service) notFound();

  const action = updateServiceAction.bind(null, service.id);

  return (
    <div>
      <PageHeader title="Editar serviço" />
      <Card className="max-w-lg">
        <form action={action} className="space-y-4">
          <div>
            <label className={labelClass}>Nome do serviço</label>
            <input
              name="name"
              required
              defaultValue={service.name}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duração (minutos)</label>
              <input
                name="durationMin"
                type="number"
                min={5}
                step={5}
                defaultValue={service.durationMin}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Preço (R$)</label>
              <input
                name="price"
                type="number"
                min={0}
                step={0.01}
                defaultValue={service.price}
                required
                className={inputClass}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="active"
              defaultChecked={service.active}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Serviço ativo
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar alterações
            </button>
            <Link href="/servicos" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

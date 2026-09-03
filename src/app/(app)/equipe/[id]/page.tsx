import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { updateProfessionalAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const professional = await db.query.professionals.findFirst({
    where: and(
      eq(schema.professionals.id, id),
      eq(schema.professionals.salonId, session.salonId)
    ),
  });

  if (!professional) notFound();

  const action = updateProfessionalAction.bind(null, professional.id);

  return (
    <div>
      <PageHeader title="Editar profissional" />
      <Card className="max-w-lg">
        <form action={action} className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input
              name="name"
              required
              defaultValue={professional.name}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Especialidade</label>
            <input
              name="specialty"
              defaultValue={professional.specialty ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              name="phone"
              defaultValue={professional.phone ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Comissão (%)</label>
            <input
              name="commissionPct"
              type="number"
              min={0}
              max={100}
              step={1}
              defaultValue={professional.commissionPct}
              required
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="active"
              defaultChecked={professional.active}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Profissional ativo
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar alterações
            </button>
            <Link href="/equipe" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

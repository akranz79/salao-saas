import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { updateClientAction, deleteClientAction } from "../../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
} from "@/components/ui";

export default async function EditarClientePage({
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

  const action = updateClientAction.bind(null, client.id);

  return (
    <div>
      <PageHeader title="Editar cliente" />
      <Card className="max-w-lg">
        <form action={action} className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" required defaultValue={client.name} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telefone</label>
              <input name="phone" defaultValue={client.phone ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Aniversário</label>
              <input
                name="birthday"
                type="date"
                defaultValue={client.birthday ?? ""}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              name="email"
              type="email"
              defaultValue={client.email ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Observações / preferências</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={client.notes ?? ""}
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar alterações
            </button>
            <Link href={`/clientes/${client.id}`} className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-4">
          <form action={deleteClientAction}>
            <input type="hidden" name="id" value={client.id} />
            <button type="submit" className={dangerButtonClass}>
              Excluir cliente
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/format";
import {
  Card,
  EmptyState,
  PageHeader,
  primaryButtonClass,
} from "@/components/ui";
import { deleteServiceAction } from "./actions";

export default async function ServicosPage() {
  const session = await verifySession();
  const services = await db.query.services.findMany({
    where: eq(schema.services.salonId, session.salonId),
    orderBy: desc(schema.services.createdAt),
  });

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Cadastre os serviços oferecidos pelo salão e seus preços."
        action={
          <Link href="/servicos/novo" className={primaryButtonClass}>
            + Novo serviço
          </Link>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          title="Nenhum serviço cadastrado"
          description="Cadastre cortes, coloração, escova e outros serviços para usá-los na agenda."
          actionHref="/servicos/novo"
          actionLabel="Cadastrar serviço"
        />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Serviço</th>
                <th className="px-5 py-3 font-medium">Duração</th>
                <th className="px-5 py-3 font-medium">Preço</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    {s.name}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {s.durationMin} min
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {formatCurrency(s.price)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.active
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {s.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/servicos/${s.id}`}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                      >
                        Editar
                      </Link>
                      <form action={deleteServiceAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-500 hover:text-red-700"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

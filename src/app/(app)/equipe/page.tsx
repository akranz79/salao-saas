import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import {
  Card,
  EmptyState,
  PageHeader,
  primaryButtonClass,
} from "@/components/ui";
import { deleteProfessionalAction } from "./actions";

export default async function EquipePage() {
  const session = await verifySession();
  const professionals = await db.query.professionals.findMany({
    where: eq(schema.professionals.salonId, session.salonId),
    orderBy: desc(schema.professionals.createdAt),
  });

  return (
    <div>
      <PageHeader
        title="Equipe"
        description="Cabeleireiros, manicures e demais profissionais do salão."
        action={
          <Link href="/equipe/novo" className={primaryButtonClass}>
            + Novo profissional
          </Link>
        }
      />

      {professionals.length === 0 ? (
        <EmptyState
          title="Nenhum profissional cadastrado"
          description="Cadastre a equipe para poder criar agendamentos e calcular comissões."
          actionHref="/equipe/novo"
          actionLabel="Cadastrar profissional"
        />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Especialidade</th>
                <th className="px-5 py-3 font-medium">Telefone</th>
                <th className="px-5 py-3 font-medium">Comissão</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {professionals.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {p.specialty || "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {p.phone || "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {p.commissionPct}%
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.active
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/equipe/${p.id}`}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                      >
                        Editar
                      </Link>
                      <form action={deleteProfessionalAction}>
                        <input type="hidden" name="id" value={p.id} />
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

import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, desc, eq, like, or } from "drizzle-orm";
import {
  Card,
  EmptyState,
  PageHeader,
  inputClass,
  primaryButtonClass,
} from "@/components/ui";
import { formatDate, formatDateOnly } from "@/lib/format";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await verifySession();

  const whereClause = q
    ? and(
        eq(schema.clients.salonId, session.salonId),
        or(
          like(schema.clients.name, `%${q}%`),
          like(schema.clients.phone, `%${q}%`)
        )
      )
    : eq(schema.clients.salonId, session.salonId);

  const clients = await db.query.clients.findMany({
    where: whereClause,
    orderBy: desc(schema.clients.createdAt),
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro e histórico de atendimentos dos seus clientes."
        action={
          <Link href="/clientes/novo" className={primaryButtonClass}>
            + Novo cliente
          </Link>
        }
      />

      <form className="mb-4" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou telefone..."
          className={`${inputClass} max-w-sm`}
        />
      </form>

      {clients.length === 0 ? (
        <EmptyState
          title={q ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={
            q
              ? "Tente buscar por outro nome ou telefone."
              : "Cadastre seus clientes para agendar horários e acompanhar o histórico."
          }
          actionHref={q ? undefined : "/clientes/novo"}
          actionLabel={q ? undefined : "Cadastrar cliente"}
        />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Telefone</th>
                <th className="px-5 py-3 font-medium">Aniversário</th>
                <th className="px-5 py-3 font-medium">Cliente desde</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    <Link href={`/clientes/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-neutral-600">
                    {c.birthday ? formatDateOnly(c.birthday) : "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                    >
                      Ver detalhes
                    </Link>
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

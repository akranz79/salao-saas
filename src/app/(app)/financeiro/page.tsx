import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  inputClass,
  primaryButtonClass,
} from "@/components/ui";
import { formatCurrency, formatDateOnly } from "@/lib/format";
import { deleteTransactionAction } from "./actions";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const session = await verifySession();
  const selectedMonth = month || currentMonth();
  const monthStart = `${selectedMonth}-01`;
  const [year, mm] = selectedMonth.split("-").map(Number);
  const monthEndDate = new Date(year, mm, 0).getDate();
  const monthEnd = `${selectedMonth}-${String(monthEndDate).padStart(2, "0")}`;

  const transactions = await db
    .select({
      id: schema.transactions.id,
      type: schema.transactions.type,
      category: schema.transactions.category,
      amount: schema.transactions.amount,
      description: schema.transactions.description,
      date: schema.transactions.date,
      professionalName: schema.professionals.name,
    })
    .from(schema.transactions)
    .leftJoin(
      schema.professionals,
      eq(schema.transactions.professionalId, schema.professionals.id)
    )
    .where(
      and(
        eq(schema.transactions.salonId, session.salonId),
        gte(schema.transactions.date, monthStart),
        lte(schema.transactions.date, monthEnd)
      )
    )
    .orderBy(desc(schema.transactions.date));

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;

  const professionals = await db.query.professionals.findMany({
    where: eq(schema.professionals.salonId, session.salonId),
  });

  const commissionByProfessional = professionals
    .map((p) => {
      const gross = transactions
        .filter((t) => t.type === "income" && t.professionalName === p.name)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: p.id,
        name: p.name,
        gross,
        commission: (gross * p.commissionPct) / 100,
        commissionPct: p.commissionPct,
      };
    })
    .filter((p) => p.gross > 0);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Entradas, saídas e comissões da equipe."
        action={
          <Link href="/financeiro/nova" className={primaryButtonClass}>
            + Novo lançamento
          </Link>
        }
      />

      <form method="get" className="mb-4 flex items-center gap-2">
        <input
          type="month"
          name="month"
          defaultValue={selectedMonth}
          className={`${inputClass} max-w-xs`}
        />
        <button type="submit" className={primaryButtonClass}>
          Filtrar
        </button>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Receitas do mês" value={formatCurrency(income)} />
        <StatCard label="Despesas do mês" value={formatCurrency(expense)} />
        <StatCard
          label="Saldo do mês"
          value={formatCurrency(net)}
          hint={net >= 0 ? "Positivo" : "Negativo"}
        />
      </div>

      {commissionByProfessional.length > 0 && (
        <Card className="mb-6 p-0">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-neutral-900">
              Comissões da equipe
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Profissional</th>
                <th className="px-5 py-3 font-medium">Faturamento gerado</th>
                <th className="px-5 py-3 font-medium">% Comissão</th>
                <th className="px-5 py-3 font-medium">Comissão a pagar</th>
              </tr>
            </thead>
            <tbody>
              {commissionByProfessional.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-5 py-3 text-neutral-600">{formatCurrency(p.gross)}</td>
                  <td className="px-5 py-3 text-neutral-600">{p.commissionPct}%</td>
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    {formatCurrency(p.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {transactions.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento neste mês"
          description="Atendimentos concluídos na agenda geram receita automaticamente. Você também pode lançar entradas e saídas manuais."
          actionHref="/financeiro/nova"
          actionLabel="Novo lançamento"
        />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Categoria</th>
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-3 text-neutral-600">{formatDateOnly(t.date)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "income"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-900">{t.category}</td>
                  <td className="px-5 py-3 text-neutral-600">
                    {t.description || "—"}
                    {t.professionalName ? ` · ${t.professionalName}` : ""}
                  </td>
                  <td
                    className={`px-5 py-3 font-medium ${
                      t.type === "income" ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteTransactionAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="month" value={selectedMonth} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-neutral-400 hover:text-red-600"
                      >
                        Excluir
                      </button>
                    </form>
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

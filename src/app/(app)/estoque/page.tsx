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
import { formatCurrency } from "@/lib/format";

export default async function EstoquePage() {
  const session = await verifySession();
  const products = await db.query.products.findMany({
    where: eq(schema.products.salonId, session.salonId),
    orderBy: desc(schema.products.createdAt),
  });

  const lowStockCount = products.filter((p) => p.stockQty <= p.minStockQty).length;

  return (
    <div>
      <PageHeader
        title="Estoque"
        description={
          lowStockCount > 0
            ? `${lowStockCount} produto(s) abaixo do estoque mínimo.`
            : "Produtos usados nos serviços e vendidos no salão."
        }
        action={
          <Link href="/estoque/novo" className={primaryButtonClass}>
            + Novo produto
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre os produtos usados nos serviços e os itens vendidos no salão."
          actionHref="/estoque/novo"
          actionLabel="Cadastrar produto"
        />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Produto</th>
                <th className="px-5 py-3 font-medium">Estoque</th>
                <th className="px-5 py-3 font-medium">Preço de venda</th>
                <th className="px-5 py-3 font-medium">Custo</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.stockQty <= p.minStockQty;
                return (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-neutral-900">
                      <Link href={`/estoque/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                      {p.sku && <span className="ml-2 text-xs text-neutral-400">{p.sku}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          low
                            ? "rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                            : "text-neutral-600"
                        }
                      >
                        {p.stockQty} {p.unit}
                        {low ? " · repor" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{formatCurrency(p.salePrice)}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatCurrency(p.costPrice)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/estoque/${p.id}`}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
                      >
                        Gerenciar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

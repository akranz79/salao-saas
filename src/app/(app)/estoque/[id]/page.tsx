import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import {
  registerMovementAction,
  updateProductAction,
  deleteProductAction,
} from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
} from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();

  const product = await db.query.products.findFirst({
    where: and(eq(schema.products.id, id), eq(schema.products.salonId, session.salonId)),
  });
  if (!product) notFound();

  const movements = await db.query.stockMovements.findMany({
    where: and(
      eq(schema.stockMovements.productId, id),
      eq(schema.stockMovements.salonId, session.salonId)
    ),
    orderBy: desc(schema.stockMovements.createdAt),
    limit: 20,
  });

  const updateAction = updateProductAction.bind(null, product.id);
  const movementAction = registerMovementAction.bind(null, product.id);

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`Estoque atual: ${product.stockQty} ${product.unit}`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">
            Editar produto
          </h2>
          <form action={updateAction} className="space-y-4">
            <div>
              <label className={labelClass}>Nome</label>
              <input name="name" required defaultValue={product.name} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>SKU</label>
                <input name="sku" defaultValue={product.sku ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unidade</label>
                <input name="unit" defaultValue={product.unit} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Preço de custo (R$)</label>
                <input
                  name="costPrice"
                  type="number"
                  min={0}
                  step={0.01}
                  defaultValue={product.costPrice}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Preço de venda (R$)</label>
                <input
                  name="salePrice"
                  type="number"
                  min={0}
                  step={0.01}
                  defaultValue={product.salePrice}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Estoque mínimo</label>
              <input
                name="minStockQty"
                type="number"
                min={0}
                step={1}
                defaultValue={product.minStockQty}
                className={inputClass}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className={primaryButtonClass}>
                Salvar alterações
              </button>
              <Link href="/estoque" className={secondaryButtonClass}>
                Voltar
              </Link>
            </div>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-4">
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <button type="submit" className={dangerButtonClass}>
                Excluir produto
              </button>
            </form>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">
              Registrar movimentação
            </h2>
            <form action={movementAction} className="space-y-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <select name="type" className={inputClass} defaultValue="in">
                  <option value="in">Entrada (compra/reposição)</option>
                  <option value="out">Saída (uso/venda)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Quantidade</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  step={1}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Motivo (opcional)</label>
                <input name="reason" className={inputClass} placeholder="Uso em atendimento" />
              </div>
              <button type="submit" className={primaryButtonClass}>
                Registrar
              </button>
            </form>
          </Card>

          <Card className="p-0">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">
                Últimas movimentações
              </h2>
            </div>
            {movements.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-neutral-500">
                Nenhuma movimentação registrada.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-5 py-2.5 text-neutral-500">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={
                            m.type === "in"
                              ? "text-green-700 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {m.type === "in" ? "+" : "-"}
                          {m.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-neutral-600">{m.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { createTransactionAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";
import { todayISODate } from "@/lib/format";

export default async function NovoLancamentoPage() {
  const session = await verifySession();
  const professionals = await db.query.professionals.findMany({
    where: eq(schema.professionals.salonId, session.salonId),
  });

  return (
    <div>
      <PageHeader title="Novo lançamento" />
      <Card className="max-w-lg">
        <form action={createTransactionAction} className="space-y-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="type" className={inputClass} defaultValue="income">
              <option value="income">Entrada (receita)</option>
              <option value="expense">Saída (despesa)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Categoria</label>
            <input
              name="category"
              required
              className={inputClass}
              placeholder="Venda de produto, aluguel, energia, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Valor (R$)</label>
              <input
                name="amount"
                type="number"
                min={0.01}
                step={0.01}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={todayISODate()}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Profissional relacionado (opcional)</label>
            <select name="professionalId" className={inputClass} defaultValue="">
              <option value="">Nenhum</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Descrição</label>
            <input name="description" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar
            </button>
            <Link href="/financeiro" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

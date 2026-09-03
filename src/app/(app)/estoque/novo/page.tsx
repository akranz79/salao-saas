import Link from "next/link";
import { createProductAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

export default function NovoProdutoPage() {
  return (
    <div>
      <PageHeader title="Novo produto" />
      <Card className="max-w-lg">
        <form action={createProductAction} className="space-y-4">
          <div>
            <label className={labelClass}>Nome do produto</label>
            <input name="name" required className={inputClass} placeholder="Shampoo 1L" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>SKU / código (opcional)</label>
              <input name="sku" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Unidade</label>
              <input name="unit" defaultValue="un" className={inputClass} />
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
                defaultValue={0}
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
                defaultValue={0}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estoque inicial</label>
              <input
                name="stockQty"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estoque mínimo</label>
              <input
                name="minStockQty"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar
            </button>
            <Link href="/estoque" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

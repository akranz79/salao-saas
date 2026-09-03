import Link from "next/link";
import { createServiceAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

export default function NovoServicoPage() {
  return (
    <div>
      <PageHeader title="Novo serviço" />
      <Card className="max-w-lg">
        <form action={createServiceAction} className="space-y-4">
          <div>
            <label className={labelClass}>Nome do serviço</label>
            <input name="name" required className={inputClass} placeholder="Corte feminino" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Duração (minutos)</label>
              <input
                name="durationMin"
                type="number"
                min={5}
                step={5}
                defaultValue={30}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Preço (R$)</label>
              <input
                name="price"
                type="number"
                min={0}
                step={0.01}
                defaultValue={0}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar
            </button>
            <Link href="/servicos" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

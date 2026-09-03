import Link from "next/link";
import { createProfessionalAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

export default function NovoProfissionalPage() {
  return (
    <div>
      <PageHeader title="Novo profissional" />
      <Card className="max-w-lg">
        <form action={createProfessionalAction} className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" required className={inputClass} placeholder="Maria Silva" />
          </div>
          <div>
            <label className={labelClass}>Especialidade</label>
            <input name="specialty" className={inputClass} placeholder="Colorista" />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input name="phone" className={inputClass} placeholder="(11) 99999-0000" />
          </div>
          <div>
            <label className={labelClass}>Comissão (%)</label>
            <input
              name="commissionPct"
              type="number"
              min={0}
              max={100}
              step={1}
              defaultValue={40}
              required
              className={inputClass}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar
            </button>
            <Link href="/equipe" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

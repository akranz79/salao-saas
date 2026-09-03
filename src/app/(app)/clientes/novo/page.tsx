import Link from "next/link";
import { createClientAction } from "../actions";
import {
  Card,
  PageHeader,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

export default function NovoClientePage() {
  return (
    <div>
      <PageHeader title="Novo cliente" />
      <Card className="max-w-lg">
        <form action={createClientAction} className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input name="name" required className={inputClass} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Telefone</label>
              <input name="phone" className={inputClass} placeholder="(11) 99999-0000" />
            </div>
            <div>
              <label className={labelClass}>Aniversário</label>
              <input name="birthday" type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Observações / preferências</label>
            <textarea
              name="notes"
              rows={3}
              className={inputClass}
              placeholder="Alergias, preferências de produto, etc."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className={primaryButtonClass}>
              Salvar
            </button>
            <Link href="/clientes" className={secondaryButtonClass}>
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

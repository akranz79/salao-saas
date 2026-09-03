"use client";

import { useActionState } from "react";
import { updateSalonAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/ui";

type Salon = {
  name: string;
  phone: string | null;
  address: string | null;
  openTime: string;
  closeTime: string;
};

export function SalonSettingsForm({ salon }: { salon: Salon }) {
  const [state, formAction, pending] = useActionState(updateSalonAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={labelClass}>Nome do salão</label>
        <input name="name" required defaultValue={salon.name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Telefone</label>
        <input name="phone" defaultValue={salon.phone ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Endereço</label>
        <input name="address" defaultValue={salon.address ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Abre às</label>
          <input
            name="openTime"
            type="time"
            defaultValue={salon.openTime}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha às</label>
          <input
            name="closeTime"
            type="time"
            defaultValue={salon.closeTime}
            className={inputClass}
          />
        </div>
      </div>
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Dados atualizados com sucesso.
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

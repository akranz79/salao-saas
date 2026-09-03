"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createAppointmentAction } from "../actions";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

type Option = { id: string; name: string };
type ServiceOption = Option & { durationMin: number; price: number };

export function AppointmentForm({
  clients,
  professionals,
  services,
  defaultDate,
}: {
  clients: Option[];
  professionals: Option[];
  services: ServiceOption[];
  defaultDate: string;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId, services]
  );

  return (
    <form action={createAppointmentAction} className="space-y-4">
      <div>
        <label className={labelClass}>Cliente</label>
        <select name="clientId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Selecione o cliente
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Profissional</label>
        <select name="professionalId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Selecione o profissional
          </option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Serviço</label>
        <select
          name="serviceId"
          required
          className={inputClass}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {selectedService && (
          <p className="mt-1 text-xs text-neutral-500">
            Duração: {selectedService.durationMin} min · Preço:{" "}
            {selectedService.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Data</label>
          <input name="date" type="date" required defaultValue={defaultDate} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Horário</label>
          <input name="time" type="time" required defaultValue="09:00" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Observações</label>
        <textarea name="notes" rows={2} className={inputClass} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className={primaryButtonClass}>
          Agendar
        </button>
        <Link href="/agenda" className={secondaryButtonClass}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

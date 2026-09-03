"use client";

import { useTransition } from "react";
import {
  updateAppointmentStatusAction,
  deleteAppointmentAction,
} from "./actions";

export function StatusActions({
  id,
  status,
  date,
}: {
  id: string;
  status: string;
  date: string;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: "completed" | "cancelled" | "no_show" | "scheduled") {
    startTransition(() => {
      updateAppointmentStatusAction(id, next, date);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "scheduled" && (
        <>
          <button
            disabled={isPending}
            onClick={() => setStatus("completed")}
            className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            Concluir
          </button>
          <button
            disabled={isPending}
            onClick={() => setStatus("no_show")}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            Não veio
          </button>
          <button
            disabled={isPending}
            onClick={() => setStatus("cancelled")}
            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        </>
      )}
      <form action={deleteAppointmentAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="redirectDate" value={date} />
        <button type="submit" className="text-xs font-medium text-neutral-400 hover:text-red-600">
          Excluir
        </button>
      </form>
    </div>
  );
}

"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAppointmentAction(formData: FormData) {
  const session = await verifySession();

  const clientId = String(formData.get("clientId") || "");
  const professionalId = String(formData.get("professionalId") || "");
  const serviceId = String(formData.get("serviceId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!clientId || !professionalId || !serviceId || !date || !time) return;

  const service = await db.query.services.findFirst({
    where: and(eq(schema.services.id, serviceId), eq(schema.services.salonId, session.salonId)),
  });
  if (!service) return;

  const startAt = new Date(`${date}T${time}:00`);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  await db.insert(schema.appointments).values({
    salonId: session.salonId,
    clientId,
    professionalId,
    serviceId,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    price: service.price,
    notes: notes || null,
  });

  revalidatePath("/agenda");
  redirect(`/agenda?date=${date}`);
}

export async function updateAppointmentStatusAction(
  id: string,
  status: "scheduled" | "completed" | "cancelled" | "no_show",
  redirectDate: string
) {
  const session = await verifySession();

  const appointment = await db.query.appointments.findFirst({
    where: and(eq(schema.appointments.id, id), eq(schema.appointments.salonId, session.salonId)),
  });
  if (!appointment) return;

  await db
    .update(schema.appointments)
    .set({ status })
    .where(and(eq(schema.appointments.id, id), eq(schema.appointments.salonId, session.salonId)));

  // When marking as completed, automatically register the income + link the
  // professional so it shows up in the Financeiro/commissions report.
  if (status === "completed") {
    const existingTransaction = await db.query.transactions.findFirst({
      where: eq(schema.transactions.appointmentId, id),
    });
    if (!existingTransaction) {
      await db.insert(schema.transactions).values({
        salonId: session.salonId,
        type: "income",
        category: "Serviço",
        amount: appointment.price,
        description: "Receita de atendimento",
        date: appointment.startAt.slice(0, 10),
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
      });
    }
  }

  revalidatePath("/agenda");
  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/agenda?date=${redirectDate}`);
}

export async function deleteAppointmentAction(formData: FormData) {
  const session = await verifySession();
  const id = String(formData.get("id") || "");
  const redirectDate = String(formData.get("redirectDate") || "");

  await db
    .delete(schema.appointments)
    .where(and(eq(schema.appointments.id, id), eq(schema.appointments.salonId, session.salonId)));

  revalidatePath("/agenda");
  redirect(`/agenda?date=${redirectDate}`);
}

"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClientAction(formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const birthday = String(formData.get("birthday") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) return;

  await db.insert(schema.clients).values({
    salonId: session.salonId,
    name,
    phone: phone || null,
    email: email || null,
    birthday: birthday || null,
    notes: notes || null,
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientAction(id: string, formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const birthday = String(formData.get("birthday") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  await db
    .update(schema.clients)
    .set({
      name,
      phone: phone || null,
      email: email || null,
      birthday: birthday || null,
      notes: notes || null,
    })
    .where(and(eq(schema.clients.id, id), eq(schema.clients.salonId, session.salonId)));

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  const session = await verifySession();
  const id = String(formData.get("id") || "");

  await db
    .delete(schema.clients)
    .where(and(eq(schema.clients.id, id), eq(schema.clients.salonId, session.salonId)));

  revalidatePath("/clientes");
  redirect("/clientes");
}

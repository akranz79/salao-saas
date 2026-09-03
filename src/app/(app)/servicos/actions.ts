"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createServiceAction(formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const durationMin = Number(formData.get("durationMin") || 30);
  const price = Number(formData.get("price") || 0);

  if (!name) return;

  await db.insert(schema.services).values({
    salonId: session.salonId,
    name,
    durationMin,
    price,
  });

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function updateServiceAction(id: string, formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const durationMin = Number(formData.get("durationMin") || 30);
  const price = Number(formData.get("price") || 0);
  const active = formData.get("active") === "on";

  await db
    .update(schema.services)
    .set({ name, durationMin, price, active })
    .where(
      and(eq(schema.services.id, id), eq(schema.services.salonId, session.salonId))
    );

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function deleteServiceAction(formData: FormData) {
  const session = await verifySession();
  const id = String(formData.get("id") || "");

  await db
    .delete(schema.services)
    .where(
      and(eq(schema.services.id, id), eq(schema.services.salonId, session.salonId))
    );

  revalidatePath("/servicos");
}

"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateSalonAction(
  _prevState: { success?: boolean } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const openTime = String(formData.get("openTime") || "09:00");
  const closeTime = String(formData.get("closeTime") || "19:00");

  if (!name) return { success: false };

  await db
    .update(schema.salons)
    .set({ name, phone: phone || null, address: address || null, openTime, closeTime })
    .where(eq(schema.salons.id, session.salonId));

  revalidatePath("/configuracoes");
  revalidatePath("/");
  return { success: true };
}

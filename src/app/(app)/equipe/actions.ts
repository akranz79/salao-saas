"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProfessionalAction(formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const specialty = String(formData.get("specialty") || "").trim();
  const commissionPct = Number(formData.get("commissionPct") || 40);

  if (!name) return;

  await db.insert(schema.professionals).values({
    salonId: session.salonId,
    name,
    phone: phone || null,
    specialty: specialty || null,
    commissionPct,
  });

  revalidatePath("/equipe");
  redirect("/equipe");
}

export async function updateProfessionalAction(id: string, formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const specialty = String(formData.get("specialty") || "").trim();
  const commissionPct = Number(formData.get("commissionPct") || 40);
  const active = formData.get("active") === "on";

  await db
    .update(schema.professionals)
    .set({ name, phone: phone || null, specialty: specialty || null, commissionPct, active })
    .where(
      and(
        eq(schema.professionals.id, id),
        eq(schema.professionals.salonId, session.salonId)
      )
    );

  revalidatePath("/equipe");
  redirect("/equipe");
}

export async function deleteProfessionalAction(formData: FormData) {
  const session = await verifySession();
  const id = String(formData.get("id") || "");

  await db
    .delete(schema.professionals)
    .where(
      and(
        eq(schema.professionals.id, id),
        eq(schema.professionals.salonId, session.salonId)
      )
    );

  revalidatePath("/equipe");
}

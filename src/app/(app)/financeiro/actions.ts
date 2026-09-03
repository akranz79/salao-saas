"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTransactionAction(formData: FormData) {
  const session = await verifySession();

  const type = String(formData.get("type") || "income") as "income" | "expense";
  const category = String(formData.get("category") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const description = String(formData.get("description") || "").trim();
  const date = String(formData.get("date") || "");
  const professionalId = String(formData.get("professionalId") || "");

  if (!category || !amount || !date) return;

  await db.insert(schema.transactions).values({
    salonId: session.salonId,
    type,
    category,
    amount: Math.abs(amount),
    description: description || null,
    date,
    professionalId: professionalId || null,
  });

  revalidatePath("/financeiro");
  redirect(`/financeiro?month=${date.slice(0, 7)}`);
}

export async function deleteTransactionAction(formData: FormData) {
  const session = await verifySession();
  const id = String(formData.get("id") || "");
  const month = String(formData.get("month") || "");

  await db
    .delete(schema.transactions)
    .where(and(eq(schema.transactions.id, id), eq(schema.transactions.salonId, session.salonId)));

  revalidatePath("/financeiro");
  redirect(`/financeiro?month=${month}`);
}

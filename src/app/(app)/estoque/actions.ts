"use server";

import { verifySession } from "@/lib/dal";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProductAction(formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const unit = String(formData.get("unit") || "un").trim();
  const costPrice = Number(formData.get("costPrice") || 0);
  const salePrice = Number(formData.get("salePrice") || 0);
  const stockQty = Number(formData.get("stockQty") || 0);
  const minStockQty = Number(formData.get("minStockQty") || 0);

  if (!name) return;

  await db.insert(schema.products).values({
    salonId: session.salonId,
    name,
    sku: sku || null,
    unit,
    costPrice,
    salePrice,
    stockQty,
    minStockQty,
  });

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function updateProductAction(id: string, formData: FormData) {
  const session = await verifySession();
  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const unit = String(formData.get("unit") || "un").trim();
  const costPrice = Number(formData.get("costPrice") || 0);
  const salePrice = Number(formData.get("salePrice") || 0);
  const minStockQty = Number(formData.get("minStockQty") || 0);

  await db
    .update(schema.products)
    .set({ name, sku: sku || null, unit, costPrice, salePrice, minStockQty })
    .where(and(eq(schema.products.id, id), eq(schema.products.salonId, session.salonId)));

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${id}`);
  redirect(`/estoque/${id}`);
}

export async function deleteProductAction(formData: FormData) {
  const session = await verifySession();
  const id = String(formData.get("id") || "");

  await db
    .delete(schema.products)
    .where(and(eq(schema.products.id, id), eq(schema.products.salonId, session.salonId)));

  revalidatePath("/estoque");
  redirect("/estoque");
}

export async function registerMovementAction(id: string, formData: FormData) {
  const session = await verifySession();
  const type = String(formData.get("type") || "in") as "in" | "out";
  const quantity = Number(formData.get("quantity") || 0);
  const reason = String(formData.get("reason") || "").trim();

  if (!quantity || quantity <= 0) return;

  const product = await db.query.products.findFirst({
    where: and(eq(schema.products.id, id), eq(schema.products.salonId, session.salonId)),
  });
  if (!product) return;

  const nextQty =
    type === "in" ? product.stockQty + quantity : product.stockQty - quantity;

  await db
    .update(schema.products)
    .set({ stockQty: nextQty })
    .where(and(eq(schema.products.id, id), eq(schema.products.salonId, session.salonId)));

  await db.insert(schema.stockMovements).values({
    salonId: session.salonId,
    productId: id,
    type,
    quantity,
    reason: reason || null,
  });

  revalidatePath("/estoque");
  revalidatePath(`/estoque/${id}`);
  redirect(`/estoque/${id}`);
}

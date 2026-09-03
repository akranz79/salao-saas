"use server";

import { db, schema } from "@/db";
import { hashPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

function slugify(input: string) {
  const normalized = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function signupAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const salonName = String(formData.get("salonName") || "").trim();
  const ownerName = String(formData.get("ownerName") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!salonName || !ownerName || !email || password.length < 6) {
    return {
      error:
        "Preencha todos os campos. A senha deve ter ao menos 6 caracteres.",
    };
  }

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  let slug = slugify(salonName) || "salao";
  const slugExists = await db.query.salons.findFirst({
    where: eq(schema.salons.slug, slug),
  });
  if (slugExists) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const [salon] = await db
    .insert(schema.salons)
    .values({ name: salonName, slug })
    .returning();

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(schema.users)
    .values({
      salonId: salon.id,
      name: ownerName,
      email,
      passwordHash,
      role: "owner",
    })
    .returning();

  await createSession({
    userId: user.id,
    salonId: salon.id,
    salonName: salon.name,
    name: user.name,
    role: user.role,
  });

  redirect("/");
}

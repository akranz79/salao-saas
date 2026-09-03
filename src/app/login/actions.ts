"use server";

import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });
  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "E-mail ou senha inválidos." };
  }

  const salon = await db.query.salons.findFirst({
    where: eq(schema.salons.id, user.salonId),
  });
  if (!salon) {
    return { error: "Salão não encontrado para este usuário." };
  }

  await createSession({
    userId: user.id,
    salonId: salon.id,
    salonName: salon.name,
    name: user.name,
    role: user.role,
  });

  redirect("/");
}

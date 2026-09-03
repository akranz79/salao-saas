import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: string;
  salonId: string;
  salonName: string;
  name: string;
  role: "owner" | "staff";
  expiresAt: string;
};

const secretKey = process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me";
const encodedKey = new TextEncoder().encode(secretKey);
const COOKIE_NAME = "salaopro_session";

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

export async function decrypt(session?: string) {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt: expiresAt.toISOString() });

  // The Secure attribute requires HTTPS. Most self-hosted deployments of
  // this app run behind plain HTTP (a local network, a VPS without TLS
  // configured yet), so this defaults to false and must be explicitly
  // opted into via COOKIE_SECURE=true once the app is served over HTTPS.
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(cookie);
}

export { COOKIE_NAME };

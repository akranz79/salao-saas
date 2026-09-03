import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

// Use in places where redirecting is not desired (e.g. layout that renders
// different UI for logged-out users).
export const getOptionalSession = cache(async () => {
  return getSession();
});

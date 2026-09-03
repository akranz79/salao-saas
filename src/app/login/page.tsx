"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Entrar no SalãoPro
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gestão completa para o seu salão de beleza.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="voce@salao.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Ainda não tem uma conta?{" "}
          <Link href="/cadastro" className="font-medium text-neutral-900 underline">
            Cadastre seu salão
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
          <p className="font-medium text-neutral-700">Acesso de demonstração</p>
          <p>email: demo@salaopro.com</p>
          <p>senha: demo123</p>
        </div>
      </div>
    </div>
  );
}

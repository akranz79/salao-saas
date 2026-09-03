"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signupAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">
          Crie a conta do seu salão
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Comece a organizar agenda, clientes, financeiro e estoque hoje mesmo.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nome do salão
            </label>
            <input
              name="salonName"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Studio Bella Hair"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Seu nome
            </label>
            <input
              name="ownerName"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="Ana Souza"
            />
          </div>
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
              minLength={6}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              placeholder="mínimo 6 caracteres"
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
            {pending ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

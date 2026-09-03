"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/logout-action";

const NAV_ITEMS = [
  { href: "/", label: "Painel", icon: "📊" },
  { href: "/agenda", label: "Agenda", icon: "🗓️" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/equipe", label: "Equipe", icon: "✂️" },
  { href: "/servicos", label: "Serviços", icon: "💈" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/estoque", label: "Estoque", icon: "📦" },
  { href: "/configuracoes", label: "Configurações", icon: "⚙️" },
];

export function Sidebar({
  salonName,
  userName,
}: {
  salonName: string;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-5">
        <p className="text-sm font-semibold text-neutral-900">{salonName}</p>
        <p className="text-xs text-neutral-500">SalãoPro</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 px-4 py-4">
        <p className="truncate text-xs text-neutral-500">Logado como</p>
        <p className="truncate text-sm font-medium text-neutral-900">
          {userName}
        </p>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

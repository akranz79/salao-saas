import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalãoPro — Gestão para salões de beleza",
  description:
    "Sistema completo para gestão de salões de beleza: agenda, clientes, financeiro e estoque.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}

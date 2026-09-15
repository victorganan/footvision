import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserStats } from "@/lib/predictions";
import { CoinBadge } from "./CoinBadge";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/partidos", label: "Resultados" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/equipos", label: "Equipos" },
  { href: "/mercado", label: "Mercado" },
  { href: "/ojeo", label: "Centro de Ojeo" },
  { href: "/predicciones", label: "Predicciones" },
];

export async function Navbar() {
  const user = await getCurrentUser();
  const stats = user ? getUserStats(user.id) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-pitch-border bg-pitch/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-pitch">FV</span>
          FOOT<span className="text-accent">VISION</span>
        </Link>

        <nav className="scrollbar-thin hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-pitch-card hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <CoinBadge amount={stats?.footcoins ?? 0} />
              <Link
                href="/perfil"
                className="rounded-md bg-pitch-card px-3 py-2 text-sm font-medium text-slate-200 hover:bg-pitch-border"
              >
                {user.display_name}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-pitch hover:bg-accent-dark"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="scrollbar-thin flex gap-1 overflow-x-auto border-t border-pitch-border px-4 py-2 md:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-pitch-card hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

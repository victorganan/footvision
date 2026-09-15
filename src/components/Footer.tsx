import { AdSlot } from "./AdSlot";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-pitch-border bg-pitch-light">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdSlot className="mb-8 h-24 w-full" />
        <div className="flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} FootVision. Datos con fines demostrativos.</p>
          <div className="flex gap-4">
            <span>Resultados</span>
            <span>Jugadores</span>
            <span>Mercado</span>
            <span>Centro de Ojeo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CoinBadge({ amount }: { amount: number }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold">
      <span aria-hidden>🪙</span>
      {amount.toLocaleString("es-ES")}
    </span>
  );
}

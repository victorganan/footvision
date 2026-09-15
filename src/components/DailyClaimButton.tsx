"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DailyClaimButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/footcoins/daily", { method: "POST" });
      const data = await res.json();
      setMessage(
        data.claimed
          ? `+${data.amount} FootCoins · racha de ${data.streak} días`
          : "Ya has reclamado tu bono de hoy"
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-pitch hover:brightness-110 disabled:opacity-50"
      >
        {loading ? "..." : "🪙 Reclamar bono diario"}
      </button>
      {message && <p className="mt-2 text-xs text-slate-400">{message}</p>}
    </div>
  );
}

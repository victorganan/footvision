"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { email, displayName, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-pitch-border bg-pitch-card p-6">
      {mode === "register" && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-400">Nombre</label>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-400">Contraseña</label>
        <input
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-pitch-border bg-pitch px-3 py-2 text-sm text-white"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2 font-semibold text-pitch hover:bg-accent-dark disabled:opacity-50"
      >
        {loading ? "Enviando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleClick} className="text-sm font-medium text-slate-400 hover:text-white">
      Cerrar sesión
    </button>
  );
}

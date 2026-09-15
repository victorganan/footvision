import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Crear cuenta — FootVision" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-center font-display text-2xl font-bold text-white">Crear cuenta</h1>
      <p className="text-center text-sm text-slate-400">Empieza con 5 FootCoins de bienvenida.</p>
      <AuthForm mode="register" />
      <p className="text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

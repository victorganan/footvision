import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Entrar — FootVision" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-center font-display text-2xl font-bold text-white">Entrar</h1>
      <AuthForm mode="login" />
      <p className="text-center text-sm text-slate-400">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}

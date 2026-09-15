"use client";

import { useEffect, useRef } from "react";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

interface AdSlotProps {
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

/**
 * Espacio publicitario de Google AdSense.
 *
 * Sin NEXT_PUBLIC_ADSENSE_CLIENT_ID configurado (aun no aprobado por
 * AdSense, o en desarrollo local) se muestra un placeholder visual para
 * no romper el layout. En cuanto se define la variable de entorno con el
 * ID de editor (ca-pub-XXXXXXXXXXXXXXXX), este componente empieza a
 * pedir anuncios reales sin tocar el resto de la app.
 */
export function AdSlot({ slot, format = "auto", className = "" }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID) return;
    try {
      // @ts-expect-error -- adsbygoogle se inyecta globalmente por el script de AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Silencioso: si el bloqueador de anuncios impide la carga, no debe romper la pagina.
    }
  }, []);

  if (!ADSENSE_CLIENT_ID) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-pitch-border bg-pitch-card/40 text-xs text-slate-500 ${className}`}
        style={{ minHeight: 90 }}
      >
        Espacio publicitario
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

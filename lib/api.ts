/**
 * lib/api.ts
 * Wrapper centralizado para todas las llamadas al backend de GenerAR.
 * Compatible con Next.js App Router (client-only donde aplica).
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Base URL ─────────────────────────────────────────────────────────────────

export const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://hse-risk-analyzer-production.up.railway.app";

// ─── Token helpers ────────────────────────────────────────────────────────────

/** Devuelve el JWT guardado en localStorage, o null si no existe / SSR. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_token");
}

/** Elimina el JWT y redirige al login. Llama sólo desde el cliente. */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("generar_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

/**
 * Wrapper centralizado sobre `fetch`.
 * - Inyecta automáticamente el header Authorization con el JWT.
 * - Si el backend responde 401, limpia la sesión y redirige a /login.
 * - El caller decide cómo manejar otros errores HTTP (4xx, 5xx).
 */
export async function apiFetch(
  url: string,
  opts: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });

  if (res.status === 401) {
    clearSession();
    window.location.replace("/login");
    throw new Error("Sesión expirada. Por favor inicia sesión de nuevo.");
  }

  return res;
}

// ─── Auth utilities ───────────────────────────────────────────────────────────

/**
 * Comprueba síncronamente si hay un token activo.
 * Útil para decidir si renderizar contenido protegido antes de montar hooks.
 * Devuelve `false` en SSR (window no disponible).
 */
export function checkAuth(): boolean {
  if (typeof window === "undefined") return false;
  return !!getToken();
}

// ─── Auth guard hook ──────────────────────────────────────────────────────────

/**
 * Hook de protección de ruta para páginas que requieren autenticación.
 *
 * Uso:
 * ```tsx
 * export default function ProtectedPage() {
 *   const ready = useAuthGuard();
 *   if (!ready) return null; // evita flash de contenido protegido
 *   return <PageContent />;
 * }
 * ```
 *
 * @returns `true` cuando el token existe y el componente puede renderizarse.
 *          `false` mientras verifica o cuando redirige al login.
 */
export function useAuthGuard(): boolean {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  return checked;
}

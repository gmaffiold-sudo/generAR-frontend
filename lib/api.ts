/**
 * lib/api.ts
 * Wrapper centralizado para todas las llamadas al backend de GenerAR.
 * Compatible con Next.js App Router (client-only donde aplica).
 *
 * Autenticación: cookies HttpOnly (access_token, refresh_token) seteadas por
 * el backend.  El JS solo maneja el flag generar_session en localStorage como
 * indicador de sesión activa, sin exponer el JWT.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Base URL ─────────────────────────────────────────────────────────────────

export const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://hse-risk-analyzer-production.up.railway.app";

// ─── Session flag helpers ─────────────────────────────────────────────────────

/** Devuelve `true` si hay una sesión activa según el flag en localStorage. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_session");
}

/** Devuelve el email del usuario guardado en localStorage al hacer login. */
export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_email");
}

/** Limpia el flag de sesión local (las cookies HttpOnly las borra el backend). */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("generar_session");
  localStorage.removeItem("generar_email");
  // Limpieza de claves legacy por si existieran de versiones anteriores
  localStorage.removeItem("generar_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/**
 * Cierra sesión: llama al backend para borrar las cookies HttpOnly y luego
 * limpia el flag local.  Úsala en botones de logout.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API}/auth/logout`, {
      method:      "POST",
      credentials: "include",
    });
  } catch {
    // Fallo silencioso: limpiar el estado local de todas formas
  }
  clearSession();
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

/**
 * Wrapper centralizado sobre `fetch`.
 * - Envía las cookies HttpOnly automáticamente con `credentials: "include"`.
 * - Si el backend responde 401, limpia el flag de sesión y redirige a /login.
 * - El caller decide cómo manejar otros errores HTTP (4xx, 5xx).
 */
export async function apiFetch(
  url: string,
  opts: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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

/** Comprueba síncronamente si hay sesión activa según el flag local. */
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
 *   if (!ready) return null;
 *   return <PageContent />;
 * }
 * ```
 */
export function useAuthGuard(): boolean {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  return checked;
}

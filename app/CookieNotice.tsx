"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "generar_cookies_ok";

const subscribe = () => () => {};

function readAccepted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export default function CookieNotice() {
  const [closed, setClosed] = useState(false);
  // En el servidor se asume aceptado para no renderizar el aviso antes de leer el navegador.
  const accepted = useSyncExternalStore(subscribe, readAccepted, () => true);

  if (closed || accepted) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Sin almacenamiento disponible: el aviso volverá a mostrarse en la próxima visita.
    }
    setClosed(true);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 1100,
        display: "flex",
        justifyContent: "flex-start",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          border: "1px solid rgba(27,58,92,0.14)",
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(15,34,54,0.20)",
          padding: "18px 20px",
          fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
        }}
      >
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3D5266", margin: "0 0 14px" }}>
          Usamos cookies esenciales para mantener tu sesión y proteger el registro. Algunos servicios
          integrados (pagos, video y verificación anti-spam) pueden instalar las suyas. No usamos cookies
          publicitarias.{" "}
          <a href="/politica-de-datos#seccion-11" style={{ color: "#1B3A5C", fontWeight: 600, textDecoration: "underline" }}>
            Política de datos
          </a>
        </p>
        <button
          type="button"
          onClick={accept}
          style={{
            padding: "10px 22px",
            borderRadius: 9,
            border: "none",
            background: "#1B3A5C",
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

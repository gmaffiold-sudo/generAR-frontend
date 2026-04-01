"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid rgba(27,58,92,0.08)",
      boxShadow: "0 1px 16px rgba(27,58,92,0.06)",
    }}>
      <div style={{
        maxWidth: 1000, margin: "0 auto",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(46,134,171,0.30)",
          }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>G</span>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 700, color: "#1B3A5C" }}>
            Gener<span style={{ color: "#2E86AB" }}>AR</span>
          </span>
        </a>
      </div>
    </nav>
  );
}

// ─── Action button ─────────────────────────────────────────────────────────────
function HomeButton() {
  const [h, setH] = useState(false);
  return (
    <a
      href="/"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "13px 32px", borderRadius: 10, textDecoration: "none",
        background: h
          ? "linear-gradient(135deg, #16304d, #2677a0)"
          : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
        color: "#fff",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15, fontWeight: 700,
        boxShadow: h ? "0 8px 28px rgba(46,134,171,0.40)" : "0 3px 14px rgba(46,134,171,0.28)",
        transform: h ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.22s ease",
      }}
    >
      Volver al inicio
    </a>
  );
}

// ─── Inner component (needs Suspense because of useSearchParams) ───────────────
function ConfirmContent() {
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");

  type State = "loading" | "success" | "error" | "no-token";
  const [state,   setState]   = useState<State>(token ? "loading" : "no-token");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res  = await fetch(
          `${API}/user/confirm-deletion?token=${encodeURIComponent(token)}`,
          { method: "POST" },
        );
        const data = await res.json();

        if (res.ok) {
          // Clear session — account is gone
          if (typeof window !== "undefined") {
            localStorage.removeItem("generar_token");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
          setState("success");
        } else {
          setMessage(data?.detail || "El enlace de eliminación no es válido o ha expirado.");
          setState("error");
        }
      } catch {
        setMessage("No se pudo conectar con el servidor. Por favor intenta de nuevo.");
        setState("error");
      }
    })();
  }, [token]);

  return (
    <div style={{ width: "100%", maxWidth: 500, animation: "fadeUp 0.5s ease both" }}>

      {/* ── Loading ── */}
      {state === "loading" && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 28px",
            background: "linear-gradient(135deg, rgba(27,58,92,0.07), rgba(46,134,171,0.12))",
            border: "1px solid rgba(46,134,171,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              width: 32, height: 32,
              border: "3px solid rgba(27,58,92,0.15)", borderTopColor: "#2E86AB",
              borderRadius: "50%", display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28, fontWeight: 400, color: "#1B3A5C",
            letterSpacing: "-0.02em", marginBottom: 10,
          }}>
            Procesando solicitud...
          </h1>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 15, color: "#5A7080", lineHeight: 1.6,
          }}>
            Estamos eliminando tu cuenta de GenerAR.
          </p>
        </div>
      )}

      {/* ── Success ── */}
      {state === "success" && (
        <div style={{
          background: "linear-gradient(135deg, rgba(39,174,96,0.06), rgba(46,134,171,0.04))",
          border: "1.5px solid rgba(39,174,96,0.22)",
          borderRadius: 20, padding: "48px 44px",
          textAlign: "center",
          boxShadow: "0 4px 32px rgba(27,58,92,0.07)",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 28px",
            background: "rgba(39,174,96,0.10)",
            border: "1.5px solid rgba(39,174,96,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
          }}>✅</div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 400,
            color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 14,
          }}>
            Cuenta eliminada
          </h1>

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 16, color: "#5A7080", lineHeight: 1.7,
            maxWidth: 380, margin: "0 auto 36px",
          }}>
            Tu cuenta ha sido eliminada exitosamente. Lamentamos verte partir.
            Si cambias de opinión puedes contactarnos en soporte@generar.co
          </p>

          <HomeButton />
        </div>
      )}

      {/* ── Error ── */}
      {state === "error" && (
        <div style={{
          background: "rgba(224,82,82,0.04)",
          border: "1.5px solid rgba(224,82,82,0.22)",
          borderRadius: 20, padding: "48px 44px",
          textAlign: "center",
          boxShadow: "0 4px 32px rgba(27,58,92,0.07)",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 28px",
            background: "rgba(224,82,82,0.08)",
            border: "1.5px solid rgba(224,82,82,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
          }}>❌</div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 400,
            color: "#C62828", letterSpacing: "-0.02em", marginBottom: 14,
          }}>
            Enlace inválido
          </h1>

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 16, color: "#5A7080", lineHeight: 1.7,
            maxWidth: 400, margin: "0 auto 36px",
          }}>
            {message}
          </p>

          <HomeButton />
        </div>
      )}

      {/* ── No token ── */}
      {state === "no-token" && (
        <div style={{
          background: "rgba(27,58,92,0.03)",
          border: "1.5px solid rgba(27,58,92,0.12)",
          borderRadius: 20, padding: "48px 44px",
          textAlign: "center",
          boxShadow: "0 4px 32px rgba(27,58,92,0.07)",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 28px",
            background: "rgba(27,58,92,0.06)",
            border: "1.5px solid rgba(27,58,92,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
          }}>❌</div>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 400,
            color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 14,
          }}>
            Enlace inválido
          </h1>

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 16, color: "#5A7080", lineHeight: 1.7,
            maxWidth: 400, margin: "0 auto 36px",
          }}>
            No se encontró un token de eliminación en el enlace.
            Verifica que copiaste el enlace completo desde tu correo.
          </p>

          <HomeButton />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConfirmDeletionPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Nav />

      <main style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px 80px",
      }}>
        <Suspense fallback={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <span style={{
              width: 36, height: 36,
              border: "3px solid rgba(27,58,92,0.15)", borderTopColor: "#2E86AB",
              borderRadius: "50%", display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0" }}>
              Cargando...
            </span>
          </div>
        }>
          <ConfirmContent />
        </Suspense>
      </main>
    </>
  );
}

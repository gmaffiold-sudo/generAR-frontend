"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ─── Status config ─────────────────────────────────────────────────────────────
type PaymentStatus = "APPROVED" | "DECLINED" | "PENDING" | "unknown";

interface StatusConfig {
  icon:       string;
  title:      string;
  subtitle:   string;
  btnLabel:   string;
  btnHref:    string;
  bg:         string;
  border:     string;
  iconBg:     string;
  titleColor: string;
}

const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  APPROVED: {
    icon:       "✅",
    title:      "¡Pago exitoso!",
    subtitle:   "Tu suscripción ha sido activada. En unos segundos verás tus créditos disponibles.",
    btnLabel:   "Ir al dashboard",
    btnHref:    "/dashboard",
    bg:         "linear-gradient(135deg, rgba(39,174,96,0.07), rgba(46,134,171,0.05))",
    border:     "rgba(39,174,96,0.25)",
    iconBg:     "rgba(39,174,96,0.10)",
    titleColor: "#1B3A5C",
  },
  DECLINED: {
    icon:       "❌",
    title:      "Pago rechazado",
    subtitle:   "Tu pago no pudo ser procesado. Por favor intenta de nuevo.",
    btnLabel:   "Intentar de nuevo",
    btnHref:    "/pricing",
    bg:         "rgba(224,82,82,0.05)",
    border:     "rgba(224,82,82,0.25)",
    iconBg:     "rgba(224,82,82,0.08)",
    titleColor: "#C62828",
  },
  PENDING: {
    icon:       "⏳",
    title:      "Pago en proceso",
    subtitle:   "Tu pago está siendo verificado. Te notificaremos cuando se confirme.",
    btnLabel:   "Ir al dashboard",
    btnHref:    "/dashboard",
    bg:         "linear-gradient(135deg, rgba(244,162,97,0.07), rgba(27,58,92,0.04))",
    border:     "rgba(244,162,97,0.30)",
    iconBg:     "rgba(244,162,97,0.12)",
    titleColor: "#8B4513",
  },
  unknown: {
    icon:       "❓",
    title:      "Estado desconocido",
    subtitle:   "No pudimos determinar el estado de tu pago. Revisa tu email o contacta soporte.",
    btnLabel:   "Ir al dashboard",
    btnHref:    "/dashboard",
    bg:         "rgba(27,58,92,0.04)",
    border:     "rgba(27,58,92,0.15)",
    iconBg:     "rgba(27,58,92,0.06)",
    titleColor: "#1B3A5C",
  },
};

// ─── Result card (uses useSearchParams) ───────────────────────────────────────
function ResultCard() {
  const searchParams = useSearchParams();
  const rawStatus = (searchParams.get("status") ?? "").toUpperCase() as PaymentStatus;
  const transactionId = searchParams.get("id") ?? "";

  const status     = (rawStatus in STATUS_CONFIG ? rawStatus : "unknown") as PaymentStatus;
  const reference  = searchParams.get("reference") ?? "";
  const id         = searchParams.get("id") ?? "";

  const cfg = STATUS_CONFIG[status];

  return (
    <div style={{
      width: "100%", maxWidth: 520,
      animation: "fadeUp 0.5s ease both",
    }}>
      {/* Main card */}
      <div style={{
        background:   cfg.bg,
        border:       `1.5px solid ${cfg.border}`,
        borderRadius: 20,
        padding:      "48px 44px",
        textAlign:    "center",
        boxShadow:    "0 4px 32px rgba(27,58,92,0.08)",
        marginBottom: 24,
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: cfg.iconBg,
          border: `1.5px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, margin: "0 auto 28px",
        }}>
          {cfg.icon}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily:   "'DM Serif Display', serif",
          fontSize:     "clamp(26px, 4vw, 34px)",
          fontWeight:   400,
          color:        cfg.titleColor,
          letterSpacing: "-0.02em",
          marginBottom: 14,
          lineHeight:   1.2,
        }}>
          {cfg.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily:   "'Plus Jakarta Sans', sans-serif",
          fontSize:     16,
          color:        "#5A7080",
          lineHeight:   1.7,
          marginBottom: 36,
          maxWidth:     380,
          margin:       "0 auto 36px",
        }}>
          {cfg.subtitle}
        </p>

        {/* CTA Button */}
        <ActionButton href={cfg.btnHref} primary>
          {cfg.btnLabel}
        </ActionButton>

        {/* Extra info for APPROVED */}
        {status === "APPROVED" && (
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, color: "#7A8EA0",
            marginTop: 16, lineHeight: 1.6,
          }}>
            El webhook de Wompi procesará tu suscripción en segundos.
            Si no ves tus créditos en 2 minutos, recarga la página.
          </p>
        )}

        {/* Extra action for DECLINED */}
        {status === "DECLINED" && (
          <div style={{ marginTop: 16 }}>
            <a href="/dashboard" style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13, color: "#7A8EA0",
              textDecoration: "none",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#2E86AB"}
              onMouseLeave={e => e.currentTarget.style.color = "#7A8EA0"}
            >
              O volver al dashboard →
            </a>
          </div>
        )}
      </div>

      {/* Transaction details */}
      {(id || reference) && (
        <div style={{
          background: "#fff",
          border: "1.5px solid rgba(27,58,92,0.08)",
          borderRadius: 14, padding: "20px 24px",
          boxShadow: "0 2px 12px rgba(27,58,92,0.05)",
        }}>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 11, fontWeight: 700, color: "#7A8EA0",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 12,
          }}>Detalles de la transacción</p>

          {id && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#7A8EA0" }}>
                ID de transacción
              </span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#1B3A5C", fontWeight: 600 }}>
                {id}
              </span>
            </div>
          )}

          {reference && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: id ? 8 : 0, borderTop: id ? "1px solid rgba(27,58,92,0.06)" : "none" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#7A8EA0" }}>
                Referencia
              </span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12, color: "#5A7080", fontWeight: 500,
                wordBreak: "break-all", textAlign: "right", maxWidth: "60%",
              }}>
                {reference}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Support link */}
      <p style={{
        textAlign: "center", marginTop: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13, color: "#A0B0BC",
      }}>
        ¿Necesitas ayuda?{" "}
        <a href="mailto:soporte@generar.co" style={{
          color: "#2E86AB", fontWeight: 600, textDecoration: "none",
        }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
        >
          Contactar soporte
        </a>
      </p>
    </div>
  );
}

function ActionButton({ href, primary, children }: { href: string; primary: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            8,
        padding:        "13px 32px",
        borderRadius:   10,
        fontFamily:     "'Plus Jakarta Sans', sans-serif",
        fontSize:       15,
        fontWeight:     700,
        textDecoration: "none",
        background:     primary
          ? "linear-gradient(135deg, #1B3A5C, #2E86AB)"
          : "#fff",
        color:          primary ? "#fff" : "#1B3A5C",
        border:         primary ? "none" : "1.5px solid rgba(27,58,92,0.18)",
        boxShadow:      primary ? "0 4px 16px rgba(46,134,171,0.30)" : "none",
        transition:     "all 0.22s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform  = "translateY(-2px)";
        el.style.boxShadow  = primary ? "0 8px 28px rgba(46,134,171,0.40)" : "0 4px 16px rgba(27,58,92,0.10)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform  = "translateY(0)";
        el.style.boxShadow  = primary ? "0 4px 16px rgba(46,134,171,0.30)" : "none";
      }}
    >
      {children}
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PaymentResultPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background:   "#fff",
        borderBottom: "1px solid rgba(27,58,92,0.08)",
        boxShadow:    "0 1px 16px rgba(27,58,92,0.06)",
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

      {/* Main */}
      <main style={{
        minHeight:      "calc(100vh - 64px)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "40px 24px 80px",
      }}>
        <Suspense fallback={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <span style={{
              width: 36, height: 36,
              border: "3px solid rgba(27,58,92,0.15)",
              borderTopColor: "#2E86AB",
              borderRadius: "50%", display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0" }}>
              Verificando resultado...
            </span>
          </div>
        }>
          <ResultCard />
        </Suspense>
      </main>
    </>
  );
}

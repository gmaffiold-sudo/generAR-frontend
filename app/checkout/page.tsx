"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Plan metadata ─────────────────────────────────────────────────────────────
interface PlanInfo {
  nombre:     string;
  precio:     number;   // centavos COP
  creditos:   number;
  beneficios: string[];
  badge?:     string;
}

const PLANES: Record<string, PlanInfo> = {
  starter: {
    nombre:   "Starter",
    precio:   7990000,
    creditos: 30,
    beneficios: [
      "30 análisis de riesgos por mes",
      "Exportación a Excel con plantilla HSE",
      "Metodología RAM incluida",
      "Soporte por email",
    ],
  },
  professional: {
    nombre:   "Professional",
    precio:   17990000,
    creditos: 100,
    badge:    "Más popular",
    beneficios: [
      "100 análisis de riesgos por mes",
      "Exportación a Excel con plantilla HSE",
      "Metodología RAM incluida",
      "Soporte prioritario",
      "Historial completo de análisis",
    ],
  },
  business: {
    nombre:   "Business",
    precio:   39990000,
    creditos: 300,
    beneficios: [
      "300 análisis de riesgos por mes",
      "Exportación a Excel con plantilla HSE",
      "Metodología RAM incluida",
      "Soporte dedicado 24/7",
      "Historial completo de análisis",
      "Acceso API",
    ],
  },
  topup_s: {
    nombre:   "Top-up S",
    precio:   3500000,
    creditos: 10,
    beneficios: [
      "10 créditos adicionales",
      "Se suman a tu suscripción activa",
      "Sin fecha de vencimiento adicional",
    ],
  },
  topup_m: {
    nombre:   "Top-up M",
    precio:   9500000,
    creditos: 30,
    beneficios: [
      "30 créditos adicionales",
      "Se suman a tu suscripción activa",
      "Sin fecha de vencimiento adicional",
    ],
  },
  topup_l: {
    nombre:   "Top-up L",
    precio:   22000000,
    creditos: 100,
    beneficios: [
      "100 créditos adicionales",
      "Se suman a tu suscripción activa",
      "Sin fecha de vencimiento adicional",
    ],
  },
};

function formatCOP(centavos: number): string {
  return new Intl.NumberFormat("es-CO", {
    style:    "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(centavos / 100);
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_token");
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24, color = "#2E86AB" }: { size?: number; color?: string }) {
  return (
    <span style={{
      width: size, height: size, flexShrink: 0,
      border: `${Math.max(2, size / 10)}px solid rgba(46,134,171,0.2)`,
      borderTopColor: color,
      borderRadius: "50%", display: "inline-block",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ─── Datos de facturación ──────────────────────────────────────────────────────
interface FacturaDatos {
  tipo_doc:   string;
  numero_doc: string;
  nombre:     string;
  email:      string;
}

function FacturacionForm({
  onComplete,
}: {
  onComplete: (datos: FacturaDatos) => void;
}) {
  const [datos, setDatos] = useState<FacturaDatos>({
    tipo_doc:   "CC",
    numero_doc: "",
    nombre:     "",
    email:      "",
  });
  const [touched, setTouched] = useState(false);

  const isComplete =
    datos.tipo_doc &&
    datos.numero_doc.trim() !== "" &&
    datos.nombre.trim() !== "" &&
    datos.email.trim() !== "";

  function handleChange(field: keyof FacturaDatos, value: string) {
    setDatos((prev) => ({ ...prev, [field]: value }));
  }

  function handleContinuar() {
    setTouched(true);
    if (!isComplete) return;
    localStorage.setItem("factura_datos", JSON.stringify(datos));
    onComplete(datos);
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: 9,
    border: `1.5px solid ${hasError ? "rgba(224,82,82,0.5)" : "rgba(27,58,92,0.14)"}`,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14,
    color: "#1B3A5C",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.18s",
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    color: "#5A7080",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1.5px solid rgba(46,134,171,0.18)",
      boxShadow: "0 4px 24px rgba(27,58,92,0.07)",
      padding: "28px 32px",
      marginBottom: 20,
      animation: "fadeUp 0.4s ease both",
    }}>
      {/* Título */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>🧾</div>
        <h3 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 20, fontWeight: 400, color: "#1B3A5C",
          letterSpacing: "-0.02em", margin: 0,
        }}>Datos de facturación</h3>
      </div>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13, color: "#7A8EA0", marginBottom: 24, lineHeight: 1.5,
      }}>
        Requeridos para emitir tu factura electrónica ante la DIAN.
      </p>

      {/* Fila: Tipo doc + Número doc */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 140px" }}>
          <label style={labelStyle}>Tipo de documento</label>
          <select
            value={datos.tipo_doc}
            onChange={(e) => handleChange("tipo_doc", e.target.value)}
            style={{
              ...inputStyle(false),
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%232E86AB' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: 32,
              cursor: "pointer",
            }}
          >
            <option value="CC">CC</option>
            <option value="NIT">NIT</option>
            <option value="CE">CE</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Número de documento</label>
          <input
            type="text"
            placeholder="Ej: 900123456"
            value={datos.numero_doc}
            onChange={(e) => handleChange("numero_doc", e.target.value)}
            style={inputStyle(touched && datos.numero_doc.trim() === "")}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2E86AB")}
            onBlur={(e) => (e.currentTarget.style.borderColor =
              touched && datos.numero_doc.trim() === ""
                ? "rgba(224,82,82,0.5)"
                : "rgba(27,58,92,0.14)"
            )}
          />
        </div>
      </div>

      {/* Nombre / Razón social */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Nombre / Razón social</label>
        <input
          type="text"
          placeholder="Ej: Empresa XYZ SAS"
          value={datos.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          style={inputStyle(touched && datos.nombre.trim() === "")}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2E86AB")}
          onBlur={(e) => (e.currentTarget.style.borderColor =
            touched && datos.nombre.trim() === ""
              ? "rgba(224,82,82,0.5)"
              : "rgba(27,58,92,0.14)"
          )}
        />
      </div>

      {/* Email para factura */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Email para factura</label>
        <input
          type="email"
          placeholder="Ej: contabilidad@empresa.com"
          value={datos.email}
          onChange={(e) => handleChange("email", e.target.value)}
          style={inputStyle(touched && datos.email.trim() === "")}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2E86AB")}
          onBlur={(e) => (e.currentTarget.style.borderColor =
            touched && datos.email.trim() === ""
              ? "rgba(224,82,82,0.5)"
              : "rgba(27,58,92,0.14)"
          )}
        />
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11, color: "#A0B0BC", marginTop: 5,
        }}>
          Puede ser diferente al correo de tu cuenta.
        </p>
      </div>

      {/* Botón continuar */}
      <button
        onClick={handleContinuar}
        style={{
          width: "100%",
          padding: "13px 0",
          borderRadius: 11,
          border: "none",
          cursor: isComplete ? "pointer" : "not-allowed",
          background: isComplete
            ? "linear-gradient(135deg, #1B3A5C, #2E86AB)"
            : "rgba(27,58,92,0.10)",
          color: isComplete ? "#fff" : "#A0B0BC",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          transition: "all 0.22s ease",
          boxShadow: isComplete ? "0 3px 14px rgba(46,134,171,0.28)" : "none",
        }}
      >
        Continuar con el pago →
      </button>

      {/* Mensaje de validación */}
      {touched && !isComplete && (
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, color: "#C04040",
          marginTop: 12, textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          Completa tus datos de facturación para continuar
        </p>
      )}
    </div>
  );
}

// ─── Inner checkout (uses useSearchParams) ────────────────────────────────────
function CheckoutForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan") ?? "";
  const plan   = PLANES[planId];

  const [sessionData, setSessionData] = useState<{
    referencia:   string;
    precio:       number;
    firma:        string;
    public_key:   string;
    redirect_url: string;
  } | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [scriptOk,        setScriptOk]        = useState(false);
  const [facturaCompleta, setFacturaCompleta] = useState(false);

  // Route protection & plan validation
  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    if (!plan)       { router.replace("/dashboard"); return; }
  }, [plan, router]);

  // Precargar datos de facturación guardados si existen
  useEffect(() => {
    const saved = localStorage.getItem("factura_datos");
    if (saved) {
      try {
        const parsed: FacturaDatos = JSON.parse(saved);
        if (parsed.tipo_doc && parsed.numero_doc && parsed.nombre && parsed.email) {
          setFacturaCompleta(true);
        }
      } catch {}
    }
  }, []);

  // Fetch session from backend
  useEffect(() => {
    if (!plan || !getToken()) return;
    (async () => {
      setLoading(true);
      try {
        // Si es top-up verificar suscripción activa primero
        if (planId.startsWith("topup_")) {
          const resCredits = await fetch(`${API}/user/credits`, {
            headers: { "Authorization": `Bearer ${getToken()}` },
          });
          const dataCredits = await resCredits.json();
          if (!resCredits.ok || dataCredits.estado_suscripcion !== "activa") {
            setError("Necesitas un plan activo para comprar créditos adicionales. Adquiere un plan primero.");
            setLoading(false);
            return;
          }
        }

        const res = await fetch(`${API}/payments/create-session`, {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ plan_id: planId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || "Error al crear sesión de pago.");
        setSessionData(data);
      } catch (e: any) {
        setError(e.message || "No se pudo iniciar el pago. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [planId, plan]);

  if (!plan) return null;

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 32,
      maxWidth: 900, margin: "0 auto",
      animation: "fadeUp 0.5s ease both",
    }}>

      {/* ── Left: Plan summary ── */}
      <div style={{ flex: "1 1 340px" }}>
        <div style={{
          background: "linear-gradient(160deg, #1B3A5C 0%, #1e4d74 55%, #2E86AB 100%)",
          borderRadius: 18, padding: "36px 36px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(27,58,92,0.28)",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {plan.badge && (
              <span style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 100, padding: "3px 12px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, fontWeight: 700, color: "#fff",
                letterSpacing: "0.07em", display: "inline-block", marginBottom: 14,
              }}>{plan.badge}</span>
            )}

            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Plan seleccionado
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, fontWeight: 400, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>
              {plan.nombre}
            </h2>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 44, fontWeight: 400, color: "#fff", letterSpacing: "-0.03em", marginBottom: 4, lineHeight: 1.1 }}>
              {formatCOP(plan.precio)}
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 28 }}>
              {planId.startsWith("topup_") ? "pago único" : "por mes"}
            </p>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20 }}>
              {plan.beneficios.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#fff", marginTop: 1,
                  }}>✓</div>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.80)", lineHeight: 1.5 }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                Pago seguro procesado por Wompi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Facturación + Payment widget ── */}
      <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column" }}>

        {/* ── Sección datos de facturación ── */}
        {!facturaCompleta ? (
          <FacturacionForm onComplete={() => setFacturaCompleta(true)} />
        ) : (
          /* Resumen compacto de datos guardados */
          (() => {
            let saved: FacturaDatos | null = null;
            try { saved = JSON.parse(localStorage.getItem("factura_datos") || ""); } catch {}
            return saved ? (
              <div style={{
                background: "#F0F8FF",
                border: "1.5px solid rgba(46,134,171,0.20)",
                borderRadius: 12, padding: "14px 18px",
                marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                animation: "fadeUp 0.3s ease both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🧾</span>
                  <div>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#1B3A5C", margin: 0 }}>
                      {saved.nombre}
                    </p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#5A7080", margin: 0 }}>
                      {saved.tipo_doc} {saved.numero_doc} · {saved.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("factura_datos");
                    setFacturaCompleta(false);
                  }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12, color: "#2E86AB", fontWeight: 600,
                    textDecoration: "underline", padding: 0, flexShrink: 0,
                  }}
                >
                  Editar
                </button>
              </div>
            ) : null;
          })()
        )}

        {/* ── Widget de pago Wompi (solo si factura completa) ── */}
        {facturaCompleta && (
          <div style={{
            background: "#fff", borderRadius: 18,
            border: "1.5px solid rgba(27,58,92,0.08)",
            boxShadow: "0 4px 24px rgba(27,58,92,0.07)",
            padding: "36px 36px",
            flex: 1,
            animation: "fadeUp 0.35s ease both",
          }}>
            <h3 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 22, fontWeight: 400, color: "#1B3A5C",
              letterSpacing: "-0.02em", marginBottom: 6,
            }}>Completa tu pago</h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0", marginBottom: 28, lineHeight: 1.5 }}>
              Serás redirigido a la plataforma de pago segura de Wompi para completar la transacción.
            </p>

            {error ? (
              <div style={{
                background: "rgba(224,82,82,0.06)",
                border: "1.5px solid rgba(224,82,82,0.25)",
                borderRadius: 12, padding: "16px 18px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#C04040", lineHeight: 1.5 }}>
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: 8, background: "none", border: "none",
                      color: "#C04040", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
                      textDecoration: "underline", padding: 0,
                    }}
                  >Recargar página</button>

                  {error.includes("plan activo") && (
                    <a href="/pricing" style={{
                      display: "block", marginTop: 12,
                      padding: "10px 20px", borderRadius: 9,
                      background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                      color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 14, fontWeight: 700,
                      textDecoration: "none", textAlign: "center",
                    }}>
                      Ver planes disponibles
                    </a>
                  )}
                </div>
              </div>
            ) : loading ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                padding: "40px 0",
              }}>
                <Spinner size={36} />
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0" }}>
                  Preparando tu sesión de pago...
                </p>
              </div>
            ) : sessionData && (
              <div>
                {/* Payment summary line */}
                <div style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(27,58,92,0.08)",
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 24,
                }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#5A7080", fontWeight: 500 }}>
                    Total a pagar
                  </span>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1B3A5C", fontWeight: 400 }}>
                    {formatCOP(sessionData.precio)}
                  </span>
                </div>

                {/* Wompi Script */}
                {sessionData && (
                  <Script
                    src="https://checkout.wompi.co/widget.js"
                    strategy="afterInteractive"
                    onLoad={() => setScriptOk(true)}
                  />
                )}

                {/* Wompi form button */}
                {sessionData && (
                  scriptOk ? (
                    <div dangerouslySetInnerHTML={{
                      __html: `
                        <form action="https://checkout.wompi.co/p/" method="GET">
                          <input type="hidden" name="public-key"         value="${sessionData.public_key}" />
                          <input type="hidden" name="currency"           value="COP" />
                          <input type="hidden" name="amount-in-cents"    value="${sessionData.precio}" />
                          <input type="hidden" name="reference"          value="${sessionData.referencia}" />
                          <input type="hidden" name="signature:integrity" value="${sessionData.firma}" />
                          <input type="hidden" name="redirect-url"       value="https://generar.co/payment-result" />
                          <button type="submit" style="width:100%;padding:15px;border-radius:11px;border:none;cursor:pointer;background:linear-gradient(135deg,#1B3A5C,#2E86AB);color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;font-weight:800;letter-spacing:-0.01em;box-shadow:0 3px 14px rgba(46,134,171,0.30);transition:all 0.22s ease;">
                            🔒 Pagar ${formatCOP(sessionData.precio)}
                          </button>
                        </form>
                      `,
                    }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
                      <Spinner size={20} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0" }}>
                        Cargando módulo de pago...
                      </span>
                    </div>
                  )
                )}

                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 11, color: "#A0B0BC", marginTop: 20, lineHeight: 1.6,
                  textAlign: "center",
                }}>
                  Al hacer clic serás redirigido al portal de pago de Wompi.<br />
                  Tu información está protegida con cifrado SSL.
                </p>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
          <a href="/dashboard" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#7A8EA0", textDecoration: "none", fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#2E86AB"}
            onMouseLeave={e => e.currentTarget.style.color = "#7A8EA0"}
          >
            ← Cancelar y volver al dashboard
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid rgba(27,58,92,0.08)",
        boxShadow: "0 1px 16px rgba(27,58,92,0.06)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #1B3A5C, #2E86AB)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(46,134,171,0.30)" }}>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>G</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 700, color: "#1B3A5C" }}>
              Gener<span style={{ color: "#2E86AB" }}>AR</span>
            </span>
          </a>
        </div>
      </nav>

      <main style={{ padding: "44px 24px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 400, color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Checkout
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#7A8EA0" }}>
            Revisa tu plan y completa el pago de forma segura.
          </p>
        </div>

        <Suspense fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <span style={{ width: 36, height: 36, border: "3px solid rgba(27,58,92,0.15)", borderTopColor: "#2E86AB", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0" }}>Cargando...</span>
            </div>
          </div>
        }>
          <CheckoutForm />
        </Suspense>
      </main>
    </>
  );
}

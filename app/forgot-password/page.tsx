"use client";

import { useState } from "react";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Shared primitives ────────────────────────────────────────────────────────
function Logo() {
  return (
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
  );
}

function InputField({
  label, type = "text", value, onChange, placeholder, error,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13, fontWeight: 600,
        color: error ? "#E05252" : "#1B3A5C",
        marginBottom: 6, letterSpacing: "0.01em",
      }}>
        {label} <span style={{ color: "#2E86AB" }}>*</span>
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10,
          border: error ? "1.5px solid #E05252" : focused ? "1.5px solid #2E86AB" : "1.5px solid rgba(27,58,92,0.15)",
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#1B3A5C",
          background: focused ? "#fff" : "rgba(245,248,251,0.8)",
          outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(46,134,171,0.12)" : "none",
          transition: "all 0.2s ease", boxSizing: "border-box",
        }}
      />
      {error && (
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#E05252", marginTop: 5 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit" disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "14px", borderRadius: 10, border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        background: loading ? "rgba(27,58,92,0.25)"
          : hovered ? "linear-gradient(135deg, #16304d, #2677a0)"
          : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
        color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em",
        boxShadow: !loading && hovered ? "0 6px 24px rgba(46,134,171,0.45)" : !loading ? "0 3px 14px rgba(46,134,171,0.30)" : "none",
        transform: hovered && !loading ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.22s ease",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        marginTop: 8,
      }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16,
          border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
          borderRadius: "50%", display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {children}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [fieldErr, setFieldErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Front-end validation
    if (!email.trim()) { setFieldErr("El email es obligatorio."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldErr("Ingresa un email válido."); return; }

    setLoading(true);
    setError("");
    setFieldErr("");

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail || "Ocurrió un error. Intenta de nuevo.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid rgba(27,58,92,0.08)",
        boxShadow: "0 1px 16px rgba(27,58,92,0.06)",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center" }}>
          <Logo />
        </div>
      </nav>

      {/* Main */}
      <main style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease both" }}>

          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 28px",
            background: "linear-gradient(135deg, rgba(27,58,92,0.07), rgba(46,134,171,0.12))",
            border: "1px solid rgba(46,134,171,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>🔑</div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400,
            color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center",
          }}>¿Olvidaste tu contraseña?</h1>
          <p style={{
            fontSize: 15, color: "#5A7080", lineHeight: 1.6, marginBottom: 32, textAlign: "center",
          }}>
            Ingresa tu email y te enviaremos instrucciones para recuperarla.
          </p>

          {/* Success state */}
          {success ? (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(39,174,96,0.07), rgba(46,134,171,0.05))",
                border: "1.5px solid rgba(39,174,96,0.25)",
                borderRadius: 14, padding: "24px 24px 20px",
                textAlign: "center", marginBottom: 28,
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 15, fontWeight: 700, color: "#1B3A5C", marginBottom: 8,
                }}>
                  ¡Revisa tu correo!
                </p>
                <p style={{ fontSize: 14, color: "#5A7080", lineHeight: 1.6 }}>
                  Si el email está registrado recibirás instrucciones en tu correo para restablecer tu contraseña.
                </p>
              </div>
              <p style={{ textAlign: "center", fontSize: 14, color: "#7A8EA0" }}>
                ¿No recibiste nada?{" "}
                <button
                  onClick={() => { setSuccess(false); setEmail(""); }}
                  style={{ background: "none", border: "none", color: "#2E86AB", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Intentar de nuevo
                </button>
              </p>
            </div>
          ) : (
            <>
              {/* API Error */}
              {error && (
                <div style={{
                  background: "rgba(224,82,82,0.06)", border: "1.5px solid rgba(224,82,82,0.25)",
                  borderRadius: 12, padding: "14px 18px", marginBottom: 20,
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#C04040", lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <InputField
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={v => { setEmail(v); setFieldErr(""); }}
                  placeholder="tu@email.com"
                  error={fieldErr}
                />
                <SubmitButton loading={loading}>
                  {loading ? "Enviando..." : "Enviar instrucciones"}
                </SubmitButton>
              </form>
            </>
          )}

          {/* Back to login */}
          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "#7A8EA0" }}>
            <a href="/login" style={{
              color: "#2E86AB", fontWeight: 600, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
            >
              ← Volver al login
            </a>
          </p>
        </div>
      </main>
    </>
  );
}

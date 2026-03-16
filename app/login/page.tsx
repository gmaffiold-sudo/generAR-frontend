"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(email: string, password: string): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!email.trim())                                         errs.email    = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))      errs.email    = "Ingresa un email válido.";
  if (!password)                                             errs.password = "La contraseña es obligatoria.";
  return errs;
}

// ─── Input Component ──────────────────────────────────────────────────────────
function InputField({
  label, type, value, error, placeholder, onChange,
}: {
  label:       string;
  type:        string;
  value:       string;
  error?:      string;
  placeholder: string;
  onChange:    (val: string) => void;
}) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPass = type === "password";

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display:      "block",
        fontFamily:   "'Plus Jakarta Sans', sans-serif",
        fontSize:     13,
        fontWeight:   600,
        color:        error ? "#E05252" : "#1B3A5C",
        marginBottom: 6,
        letterSpacing: "0.01em",
      }}>
        {label} <span style={{ color: "#2E86AB" }}>*</span>
      </label>

      <div style={{ position: "relative" }}>
        <input
          type={isPass && showPass ? "text" : type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:        "100%",
            padding:      isPass ? "12px 44px 12px 14px" : "12px 14px",
            borderRadius: 10,
            border:       error
              ? "1.5px solid #E05252"
              : focused
              ? "1.5px solid #2E86AB"
              : "1.5px solid rgba(27,58,92,0.15)",
            fontFamily:   "'Plus Jakarta Sans', sans-serif",
            fontSize:     15,
            color:        "#1B3A5C",
            background:   focused ? "#fff" : "rgba(245,248,251,0.7)",
            outline:      "none",
            transition:   "all 0.2s ease",
            boxShadow:    focused ? "0 0 0 3px rgba(46,134,171,0.12)" : "none",
            boxSizing:    "border-box",
          }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position:   "absolute", right: 12, top: "50%",
              transform:  "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              fontSize:   17, color: "#7A8EA0", padding: 2,
            }}
            aria-label={showPass ? "Ocultar" : "Mostrar"}
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        )}
      </div>

      {error && (
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 12, color: "#E05252", marginTop: 5,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [email,      setEmail]     = useState("");
  const [password,   setPassword]  = useState("");
  const [errors,     setErrors]    = useState<Record<string, string>>({});
  const [loading,    setLoading]   = useState(false);
  const [apiError,   setApiError]  = useState("");
  const [successMsg, setSuccessMsg]= useState("");

  // Show success banner if coming from /register
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("¡Registro exitoso! Inicia sesión para continuar.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        // Save tokens — localStorage for access, sessionStorage-safe approach
        localStorage.setItem("access_token",  data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        router.push("/dashboard");
      } else {
        const msg = data?.detail || "Credenciales incorrectas. Verifica tu email y contraseña.";
        setApiError(typeof msg === "string" ? msg : "Error al iniciar sesión.");
      }
    } catch {
      setApiError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: "email" | "password", val: string) => {
    if (field === "email")    setEmail(val);
    if (field === "password") setPassword(val);
    if (errors[field])        setErrors(e => ({ ...e, [field]: "" }));
    if (apiError)             setApiError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{
        minHeight:  "100vh",
        display:    "flex",
        background: "#F5F8FB",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* ── Left decorative panel ── */}
        <div style={{
          display:        "none",
          flex:           "0 0 42%",
          background:     "linear-gradient(160deg, #1B3A5C 0%, #1a4a6e 55%, #2E86AB 100%)",
          padding:        "60px 52px",
          flexDirection:  "column",
          justifyContent: "space-between",
          position:       "relative",
          overflow:       "hidden",
        }} className="left-panel">
          <div style={{ position: "absolute", top: -80,  right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: 40, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: 17, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>G</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#fff", fontWeight: 700 }}>
              Gener<span style={{ color: "rgba(255,255,255,0.55)" }}>AR</span>
            </span>
          </a>

          <div style={{ zIndex: 1 }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 36, fontWeight: 400, color: "#fff",
              lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.02em",
            }}>
              Bienvenido de vuelta
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.60)", lineHeight: 1.7 }}>
              Accede a tu cuenta y continúa generando análisis de riesgos HSE con inteligencia artificial.
            </p>

            {/* Testimonial */}
            <div style={{
              marginTop: 48,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "24px 28px",
            }}>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.80)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 16 }}>
                "GenerAR redujo el tiempo de elaboración de nuestros AR de 3 horas a menos de 5 minutos. Increíble."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#fff", fontWeight: 700,
                }}>C</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Carlos M.</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Jefe HSE · Constructora Andina</p>
                </div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", zIndex: 1 }}>
            © 2025 GenerAR · generar.co
          </p>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={{
          flex:           1,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "40px 24px",
        }}>
          <div style={{ width: "100%", maxWidth: 420 }}>

            {/* Mobile logo */}
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9, marginBottom: 40, justifyContent: "center" }} className="mobile-logo">
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>G</span>
              </div>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1B3A5C", fontWeight: 700 }}>
                Gener<span style={{ color: "#2E86AB" }}>AR</span>
              </span>
            </a>

            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 30, fontWeight: 400, color: "#1B3A5C",
                letterSpacing: "-0.02em", marginBottom: 8,
              }}>Inicia sesión</h1>
              <p style={{ fontSize: 15, color: "#5A7080", lineHeight: 1.5 }}>
                Accede a tu cuenta de GenerAR.
              </p>
            </div>

            {/* Success banner (from register redirect) */}
            {successMsg && (
              <div style={{
                background: "linear-gradient(135deg, rgba(46,134,171,0.08), rgba(27,58,92,0.05))",
                border: "1.5px solid rgba(46,134,171,0.25)",
                borderRadius: 12, padding: "14px 18px",
                marginBottom: 24, display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <p style={{ fontSize: 14, color: "#1B3A5C", fontWeight: 600 }}>{successMsg}</p>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div style={{
                background: "rgba(224,82,82,0.06)",
                border: "1.5px solid rgba(224,82,82,0.25)",
                borderRadius: 12, padding: "14px 18px",
                marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: 14, color: "#C04040", lineHeight: 1.5 }}>{apiError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <InputField
                label="Correo electrónico"
                type="email"
                value={email}
                error={errors.email}
                placeholder="juan@empresa.com"
                onChange={val => handleChange("email", val)}
              />
              <InputField
                label="Contraseña"
                type="password"
                value={password}
                error={errors.password}
                placeholder="Tu contraseña"
                onChange={val => handleChange("password", val)}
              />

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginTop: -10, marginBottom: 24 }}>
                <a href="/forgot-password" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13, color: "#5A7080", textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#2E86AB"}
                onMouseLeave={e => e.currentTarget.style.color = "#5A7080"}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <SubmitButton loading={loading}>
                {loading ? "Ingresando..." : "Iniciar sesión →"}
              </SubmitButton>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(27,58,92,0.10)" }} />
              <span style={{ fontSize: 12, color: "#A0B0BC", fontWeight: 500 }}>o</span>
              <div style={{ flex: 1, height: 1, background: "rgba(27,58,92,0.10)" }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign: "center", fontSize: 14, color: "#7A8EA0" }}>
              ¿No tienes cuenta?{" "}
              <a href="/register" style={{ color: "#2E86AB", fontWeight: 700, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
              >Regístrate gratis</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .left-panel  { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ─── Submit Button ─────────────────────────────────────────────────────────────
function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:          "100%",
        padding:        "14px",
        borderRadius:   10,
        border:         "none",
        cursor:         loading ? "not-allowed" : "pointer",
        background:     loading
          ? "rgba(27,58,92,0.25)"
          : hovered
          ? "linear-gradient(135deg, #16304d, #2677a0)"
          : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
        color:          "#fff",
        fontFamily:     "'Plus Jakarta Sans', sans-serif",
        fontSize:       16,
        fontWeight:     700,
        letterSpacing:  "-0.01em",
        transition:     "all 0.22s ease",
        boxShadow:      !loading && hovered
          ? "0 6px 24px rgba(46,134,171,0.45)"
          : !loading
          ? "0 3px 14px rgba(46,134,171,0.30)"
          : "none",
        transform:      hovered && !loading ? "translateY(-1px)" : "translateY(0)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            8,
      }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16,
          border: "2px solid rgba(255,255,255,0.4)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {children}
    </button>
  );
}

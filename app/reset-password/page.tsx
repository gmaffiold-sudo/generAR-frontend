"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function PasswordField({
  label, value, onChange, placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13, fontWeight: 600,
        color: error ? "#E05252" : "#1B3A5C",
        marginBottom: 6, letterSpacing: "0.01em",
      }}>
        {label} <span style={{ color: "#2E86AB" }}>*</span>
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showPass ? "text" : "password"}
          value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10,
            border: error ? "1.5px solid #E05252" : focused ? "1.5px solid #2E86AB" : "1.5px solid rgba(27,58,92,0.15)",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#1B3A5C",
            background: focused ? "#fff" : "rgba(245,248,251,0.8)",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(46,134,171,0.12)" : "none",
            transition: "all 0.2s ease", boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setShowPass(s => !s)}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 17, color: "#7A8EA0", padding: 2,
          }}
          aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPass ? "🙈" : "👁️"}
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#E05252", marginTop: 5 }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1;
  const labels   = ["", "Débil", "Aceptable", "Buena", "Fuerte"];
  const colors   = ["", "#E05252", "#F4A261", "#2E86AB", "#27AE60"];
  return (
    <div style={{ marginTop: -12, marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= strength ? colors[strength] : "rgba(27,58,92,0.10)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  );
}

function SubmitButton({ loading, disabled, children }: { loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = loading || disabled;
  return (
    <button
      type="submit" disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "14px", borderRadius: 10, border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        background: isDisabled ? "rgba(27,58,92,0.25)"
          : hovered ? "linear-gradient(135deg, #16304d, #2677a0)"
          : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
        color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em",
        boxShadow: !isDisabled && hovered ? "0 6px 24px rgba(46,134,171,0.45)" : !isDisabled ? "0 3px 14px rgba(46,134,171,0.30)" : "none",
        transform: hovered && !isDisabled ? "translateY(-1px)" : "translateY(0)",
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

// ─── Inner form (uses useSearchParams — needs Suspense) ───────────────────────
function ResetForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [token,      setToken]      = useState<string | null>(null);
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [apiError,   setApiError]   = useState("");
  const [fieldErrs,  setFieldErrs]  = useState<{ password?: string; confirm?: string }>({});
  const [countdown,  setCountdown]  = useState(3);

  // Read token from URL
  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      router.replace("/forgot-password");
    } else {
      setToken(t);
    }
  }, [searchParams, router]);

  // Countdown redirect after success
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) { router.push("/login"); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, router]);

  const validate = () => {
    const errs: { password?: string; confirm?: string } = {};
    if (password.length < 8) errs.password = "Mínimo 8 caracteres.";
    if (!confirm) errs.confirm = "Confirma tu contraseña.";
    else if (password !== confirm) errs.confirm = "Las contraseñas no coinciden.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrs(errs); return; }

    setLoading(true);
    setApiError("");
    setFieldErrs({});

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
      } else {
        setApiError(data?.detail || "El enlace no es válido o ha expirado.");
      }
    } catch {
      setApiError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease both" }}>

      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 14, margin: "0 auto 28px",
        background: "linear-gradient(135deg, rgba(27,58,92,0.07), rgba(46,134,171,0.12))",
        border: "1px solid rgba(46,134,171,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
      }}>🔒</div>

      {/* Heading */}
      <h1 style={{
        fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400,
        color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center",
      }}>Crea una nueva contraseña</h1>
      <p style={{
        fontSize: 15, color: "#5A7080", lineHeight: 1.6, marginBottom: 32, textAlign: "center",
      }}>
        Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
      </p>

      {/* Success */}
      {success ? (
        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(39,174,96,0.07), rgba(46,134,171,0.05))",
            border: "1.5px solid rgba(39,174,96,0.25)",
            borderRadius: 14, padding: "28px 24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16, fontWeight: 700, color: "#1B3A5C", marginBottom: 8,
            }}>
              ¡Contraseña actualizada!
            </p>
            <p style={{ fontSize: 14, color: "#5A7080", lineHeight: 1.6, marginBottom: 16 }}>
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(46,134,171,0.08)", border: "1px solid rgba(46,134,171,0.20)",
              borderRadius: 100, padding: "6px 16px",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#2E86AB", display: "inline-block",
                animation: "pulse 1s ease infinite",
              }} />
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13, fontWeight: 600, color: "#2E86AB",
              }}>
                Redirigiendo al login en {countdown}s...
              </span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* API Error */}
          {apiError && (
            <div style={{
              background: "rgba(224,82,82,0.06)", border: "1.5px solid rgba(224,82,82,0.25)",
              borderRadius: 12, padding: "14px 18px", marginBottom: 20,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#C04040", lineHeight: 1.5 }}>
                  {apiError}
                </p>
                <a href="/forgot-password" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 13, color: "#C04040", fontWeight: 600, opacity: 0.8,
                }}>
                  Solicitar un nuevo enlace →
                </a>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <PasswordField
              label="Nueva contraseña"
              value={password}
              onChange={v => { setPassword(v); setFieldErrs(e => ({ ...e, password: undefined })); }}
              placeholder="Mínimo 8 caracteres"
              error={fieldErrs.password}
            />
            <PasswordStrength password={password} />

            <PasswordField
              label="Confirmar contraseña"
              value={confirm}
              onChange={v => { setConfirm(v); setFieldErrs(e => ({ ...e, confirm: undefined })); }}
              placeholder="Repite tu contraseña"
              error={fieldErrs.confirm}
            />

            <SubmitButton loading={loading}>
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </SubmitButton>
          </form>
        </>
      )}

      {/* Back to login */}
      {!success && (
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
      )}
    </div>
  );
}

// ─── Page (Suspense wrapper required for useSearchParams) ─────────────────────
export default function ResetPasswordPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
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
        <Suspense fallback={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{
              width: 32, height: 32,
              border: "3px solid rgba(27,58,92,0.15)", borderTopColor: "#2E86AB",
              borderRadius: "50%", display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        }>
          <ResetForm />
        </Suspense>
      </main>
    </>
  );
}

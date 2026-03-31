"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Field {
  name:        string;
  label:       string;
  type:        string;
  placeholder: string;
  required:    boolean;
}

const FIELDS: Field[] = [
  { name: "nombre",            label: "Nombre completo",     type: "text",     placeholder: "Juan Pérez",               required: true  },
  { name: "email",             label: "Correo electrónico",  type: "email",    placeholder: "juan@empresa.com",          required: true  },
  { name: "empresa",           label: "Empresa",             type: "text",     placeholder: "Constructora XYZ S.A.S.",   required: false },
  { name: "cargo",             label: "Cargo",               type: "text",     placeholder: "Ingeniero HSE",             required: false },
  { name: "password",          label: "Contraseña",          type: "password", placeholder: "Mínimo 8 caracteres",       required: true  },
  { name: "confirmPassword",   label: "Confirmar contraseña",type: "password", placeholder: "Repite tu contraseña",      required: true  },
];

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form: Record<string, string>): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!form.nombre?.trim())                                    errs.nombre          = "El nombre es obligatorio.";
  if (!form.email?.trim())                                     errs.email           = "El email es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   errs.email           = "Ingresa un email válido.";
  if (!form.password)                                          errs.password        = "La contraseña es obligatoria.";
  else if (form.password.length < 8)                           errs.password        = "Mínimo 8 caracteres.";
  if (!form.confirmPassword)                                   errs.confirmPassword = "Confirma tu contraseña.";
  else if (form.password !== form.confirmPassword)             errs.confirmPassword = "Las contraseñas no coinciden.";
  return errs;
}

// ─── Input Component ──────────────────────────────────────────────────────────
function InputField({
  field, value, error, onChange,
}: {
  field:    Field;
  value:    string;
  error?:   string;
  onChange: (name: string, val: string) => void;
}) {
  const [focused,  setFocused]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPass = field.type === "password";

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display:     "block",
        fontFamily:  "'Plus Jakarta Sans', sans-serif",
        fontSize:    13,
        fontWeight:  600,
        color:       error ? "#E05252" : "#1B3A5C",
        marginBottom: 6,
        letterSpacing: "0.01em",
      }}>
        {field.label}
        {field.required && <span style={{ color: "#2E86AB", marginLeft: 3 }}>*</span>}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type={isPass && showPass ? "text" : field.type}
          value={value}
          placeholder={field.placeholder}
          onChange={e => onChange(field.name, e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:           "100%",
            padding:         isPass ? "12px 44px 12px 14px" : "12px 14px",
            borderRadius:    10,
            border:          error
              ? "1.5px solid #E05252"
              : focused
              ? "1.5px solid #2E86AB"
              : "1.5px solid rgba(27,58,92,0.15)",
            fontFamily:      "'Plus Jakarta Sans', sans-serif",
            fontSize:        15,
            color:           "#1B3A5C",
            background:      focused ? "#fff" : "rgba(245,248,251,0.7)",
            outline:         "none",
            transition:      "all 0.2s ease",
            boxShadow:       focused ? "0 0 0 3px rgba(46,134,171,0.12)" : "none",
            boxSizing:       "border-box",
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
            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
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
export default function RegisterPage() {
  const router = useRouter();

  const [form,      setForm]      = useState<Record<string, string>>({
    nombre: "", email: "", empresa: "", cargo: "", password: "", confirmPassword: "",
  });
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState("");
  const [success,   setSuccess]   = useState(false);
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  useEffect(() => {
  // Cargar script
  const script = document.createElement("script");
  script.src = "https://www.google.com/recaptcha/enterprise.js?render=explicit";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    (window as any).grecaptcha.enterprise.ready(() => {
      (window as any).grecaptcha.enterprise.render("recaptcha-container", {
          sitekey: "6LcRg54sAAAAAG_COmrKBB36aCCPgzXEEQ-Tww3f",
          callback: (token: string) => {
            setRecaptchaToken(token);
            setApiError("");
          },
          "expired-callback": () => setRecaptchaToken(""),
        });
      });
  };   
  document.head.appendChild(script);
}, []);
  
  
  const handleChange = (name: string, val: string) => {
    setForm(f => ({ ...f, [name]: val }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
    if (apiError)     setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Token al submit:", recaptchaToken);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!aceptaPolitica) {
      alert("Debes aceptar la Política de Datos Personales y los Términos de Servicio para continuar.");
      return;
    }
    if (!recaptchaToken) {
      setApiError("Por favor completa la verificación de seguridad.");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch(`${API}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
          nombre:   form.nombre.trim(),
          empresa:  form.empresa.trim() || undefined,
          cargo:    form.cargo.trim()   || undefined,
          acepto_politica: aceptaPolitica,
          recaptcha_token: recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setRecaptchaToken("");
        setTimeout(() => router.push("/login?registered=true"), 6000);
      } else {
        const msg = data?.detail || "Error al registrar. Intenta de nuevo.";
        setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
        setRecaptchaToken("");
      }
    } catch {
      setApiError("No se pudo conectar con el servidor. Verifica tu conexión.");
      setRecaptchaToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{
        minHeight:       "100vh",
        display:         "flex",
        background:      "#F5F8FB",
        fontFamily:      "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* ── Left panel (decorative) ── */}
        <div style={{
          display:         "none",
          flex:            "0 0 42%",
          background:      "linear-gradient(160deg, #1B3A5C 0%, #1a4a6e 50%, #2E86AB 100%)",
          padding:         "60px 52px",
          flexDirection:   "column",
          justifyContent:  "space-between",
          position:        "relative",
          overflow:        "hidden",
        }} className="left-panel">
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", bottom: 60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          {/* Logo */}
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
              Gener<span style={{ color: "rgba(255,255,255,0.6)" }}>AR</span>
            </span>
          </a>

          {/* Center content */}
          <div style={{ zIndex: 1 }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 36, fontWeight: 400, color: "#fff",
              lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.02em",
            }}>
              Genera análisis de riesgos HSE en segundos
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
              Únete a más de 500 profesionales HSE que ya usan IA para crear análisis completos y profesionales.
            </p>

            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
              {["Sin instalaciones. 100% web.", "Metodología RAM incluida.", "Exporta a Excel en un clic."].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#fff", flexShrink: 0,
                  }}>✓</div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.80)", fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.30)", zIndex: 1 }}>
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
          overflowY:      "auto",
        }}>
          <div style={{ width: "100%", maxWidth: 480 }}>

            {/* Mobile logo */}
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9, marginBottom: 36, justifyContent: "center" }} className="mobile-logo">
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
              }}>Crea tu cuenta gratis</h1>
              <p style={{ fontSize: 15, color: "#5A7080", lineHeight: 1.5 }}>
                Empieza a generar análisis de riesgos en minutos.
              </p>
            </div>

            {/* Success message */}
            {success && (
              <div style={{
                background: "linear-gradient(135deg, rgba(46,134,171,0.08), rgba(27,58,92,0.06))",
                border: "1.5px solid rgba(46,134,171,0.3)",
                borderRadius: 12, padding: "16px 20px",
                marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1B3A5C" }}>¡Registro exitoso!</p>
                  <p style={{ fontSize: 13, color: "#5A7080", marginTop: 4, lineHeight: 1.5 }}>
                    Te enviamos un email de verificación a tu correo. Por favor revísalo y haz clic en el enlace para activar tu cuenta.
                  </p>
                  <p style={{ fontSize: 12, color: "#7A8EA0", marginTop: 4 }}>
                    Redirigiendo al login en unos segundos...
                  </p>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div style={{
                background: "rgba(224,82,82,0.06)", border: "1.5px solid rgba(224,82,82,0.25)",
                borderRadius: 12, padding: "14px 18px", marginBottom: 24,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: 14, color: "#C04040", lineHeight: 1.5 }}>{apiError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {FIELDS.map(field => (
                <InputField
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  error={errors[field.name]}
                  onChange={handleChange}
                  
                />
              ))}

              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div style={{ marginTop: -12, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: form.password.length >= i * 3
                          ? i <= 1 ? "#E05252" : i <= 2 ? "#F4A261" : i <= 3 ? "#2E86AB" : "#27AE60"
                          : "rgba(27,58,92,0.10)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#7A8EA0" }}>
                    {form.password.length < 4 ? "Muy débil" : form.password.length < 7 ? "Débil" : form.password.length < 10 ? "Buena" : "Fuerte"}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div id="recaptcha-container"></div>
              </div>
              
              <SubmitButton loading={loading} disabled={success}>
                {loading ? "Creando cuenta..." : "Crear cuenta gratis →"}
              </SubmitButton>
            </form>

            {/* Footer links */}
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#7A8EA0" }}>
              ¿Ya tienes cuenta?{" "}
              <a href="/login" style={{ color: "#2E86AB", fontWeight: 700, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
              >Inicia sesión</a>
            </p>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, marginTop: 8 }}>
              <input
                type="checkbox"
                id="acepto_politica"
                checked={aceptaPolitica}
                onChange={e => setAceptaPolitica(e.target.checked)}
                style={{ marginTop: 3, accentColor: "#2E86AB", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
              />
              <label htmlFor="acepto_politica" style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13, color: "#5A7080", lineHeight: 1.6, cursor: "pointer"
              }}>
                He leído y acepto la{" "}
                <a href="/politica-de-datos" target="_blank" style={{ color: "#2E86AB", textDecoration: "underline" }}>
                  Política de Datos Personales
                </a>
                {" "}y los{" "}
                <a href="/terminos-de-servicio" target="_blank" style={{ color: "#2E86AB", textDecoration: "underline" }}>
                  Términos de Servicio
                </a>
                {" "}de GenerAR. *
              </label>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .left-panel   { display: flex !important; }
          .mobile-logo  { display: none !important; }
        }
      `}</style>
    </>
  );
}

// ─── Submit Button ─────────────────────────────────────────────────────────────
function SubmitButton({ loading, disabled, children }: { loading: boolean; disabled: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:       "100%",
        padding:     "14px",
        borderRadius: 10,
        border:      "none",
        cursor:      loading || disabled ? "not-allowed" : "pointer",
        background:  loading || disabled
          ? "rgba(27,58,92,0.25)"
          : hovered
          ? "linear-gradient(135deg, #16304d, #2677a0)"
          : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
        color:       "#fff",
        fontFamily:  "'Plus Jakarta Sans', sans-serif",
        fontSize:    16,
        fontWeight:  700,
        letterSpacing: "-0.01em",
        transition:  "all 0.22s ease",
        boxShadow:   !loading && !disabled && hovered
          ? "0 6px 24px rgba(46,134,171,0.45)"
          : !loading && !disabled
          ? "0 3px 14px rgba(46,134,171,0.30)"
          : "none",
        transform:   hovered && !loading && !disabled ? "translateY(-1px)" : "translateY(0)",
        display:     "flex",
        alignItems:  "center",
        justifyContent: "center",
        gap:         8,
        marginTop:   8,
      }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
          borderTopColor: "#fff", borderRadius: "50%",
          display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

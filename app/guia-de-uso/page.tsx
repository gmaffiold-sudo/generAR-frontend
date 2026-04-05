"use client";

import React from "react";
import { useAuthGuard } from "@/lib/api";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy:       "#1B3A5C",
  blue:       "#2E86AB",
  blueLight:  "#E8F4FA",
  blueMid:    "#1A6F96",
  bg:         "#F5F8FB",
  surface:    "#FFFFFF",
  ink:        "#1A2535",
  inkMuted:   "#4A5568",
  inkFaint:   "#8A97A8",
  rule:       "#D8E3EC",
  green:      "#1A7F5A",
  greenLight: "#E6F6F0",
  amber:      "#92600A",
  amberLight: "#FFF8EE",
  amberBorder:"#D4A96A",
} as const;

const font = { body: "'Plus Jakarta Sans', sans-serif", serif: "'DM Serif Display', serif" };

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    emoji: "🔐",
    title: "Crear tu cuenta",
    subtitle: "Regístrate en minutos y comienza a generar Análisis de Riesgos.",
    items: [
      { icon: "→", text: <>Ingresa a <strong style={{ color: C.navy }}>generar.co/register</strong> desde cualquier navegador.</> },
      { icon: "→", text: "Completa tu nombre completo, correo electrónico, empresa y contraseña." },
      { icon: "✉️", text: <>Revisa tu bandeja de entrada y haz clic en el enlace de <strong style={{ color: C.navy }}>verificación de email</strong> que te enviamos. El enlace es válido por 24 horas.</> },
      { icon: "→", text: "Una vez verificado tu correo, ya puedes iniciar sesión en generar.co/login." },
    ],
  },
  {
    num: "02",
    emoji: "🖥️",
    title: "Conoce tu dashboard",
    subtitle: "Tu panel central de control: todo lo que necesitas en un solo lugar.",
    items: [
      { icon: "📊", text: "Visualiza tus créditos disponibles en tiempo real." },
      { icon: "📋", text: "Consulta el historial completo de Análisis de Riesgos generados." },
      { icon: "⬇️", text: "Descarga AR anteriores directamente desde el historial en 3 formatos: Excel básico, Ecopetrol o PDF." },
      { icon: "⚡", text: "Accede al generador con un solo clic desde el panel principal." },
      { icon: "⚙️", text: <>Usa el botón <strong style={{ color: C.navy }}>Configuración</strong> para gestionar tu perfil, equipo, suscripción e historial de pagos.</> },
    ],
  },
  {
    num: "03",
    emoji: "⚙️",
    title: "Generar un Análisis de Riesgos",
    subtitle: "Completa el formulario mínimo y deja que la IA haga el trabajo pesado.",
    items: [
      { icon: "1.", text: <>Haz clic en <strong style={{ color: C.navy }}>«Generar nuevo AR»</strong> en el dashboard.</> },
      { icon: "2.", text: "Ingresa el nombre de la actividad." },
      { icon: "3.", text: "Ingresa el equipo de trabajo (ej: Supervisor HSE, Técnico, Operario)." },
      { icon: "4.", text: <>Opcionalmente adjunta un <strong style={{ color: C.navy }}>PDF del procedimiento</strong> para que la IA lo use como referencia.</> },
      { icon: "5.", text: "Ingresa los pasos de la actividad (mínimo 3 si no hay PDF)." },
      { icon: "6.", text: <>Haz clic en <strong style={{ color: C.navy }}>«Generar Análisis de Riesgos»</strong> y espera unos segundos.</> },
      { icon: "7.", text: "La IA analiza la actividad y genera la tabla de riesgos en segundos." },
    ],
  },
  {
    num: "04",
    emoji: "📄",
    title: "Descargar el AR",
    subtitle: "Tu análisis listo para usar en tres formatos.",
    items: [
      { icon: "🔍", text: "Revisa la tabla de riesgos generada directamente en pantalla." },
      { icon: "📊", text: <><strong style={{ color: C.navy }}>Excel básico</strong> — tabla simple generada en el navegador, lista para editar. Disponible en todo momento desde el historial.</> },
      { icon: "🏭", text: <><strong style={{ color: C.navy }}>Formato HSE-F-160</strong> — completa datos adicionales (tipo de análisis, fecha, lugar, empresa, calculadora RAM, equipo) y descarga el formato HSE-F-160 requerido por Ecopetrol.</> },
      { icon: "📄", text: <><strong style={{ color: C.navy }}>PDF</strong> — descarga directa en formato A4 horizontal con todos los riesgos del AR.</> },
      { icon: "💾", text: "El AR queda guardado automáticamente en tu historial con los tres formatos disponibles." },
    ],
  },
  {
    num: "05",
    emoji: "🛠️",
    title: "Configuración de cuenta",
    subtitle: <>Gestiona todos los aspectos de tu cuenta desde <strong style={{ color: C.navy }}>generar.co/settings</strong>.</>,
    items: [
      { icon: "👤", text: "Perfil: visualiza tu nombre, email, empresa y cargo registrados." },
      { icon: "💳", text: "Suscripción: revisa créditos disponibles, plan activo y fecha de vencimiento, y accede a los planes para hacer upgrade." },
      { icon: "👥", text: <>Equipo (planes Professional y Business): invita sub-usuarios a tu cuenta, gestiona sus accesos y controla el límite de miembros de tu plan.</> },
      { icon: "🧾", text: "Historial de pagos: consulta todas tus transacciones en GenerAR con fecha, plan, tipo y estado." },
      { icon: "🔒", text: "Zona de peligro: solicita la eliminación permanente de tu cuenta mediante confirmación por email." },
    ],
  },
  {
    num: "06",
    emoji: "💳",
    title: "Gestionar tu suscripción",
    subtitle: "Controla tu plan y créditos sin complicaciones.",
    items: [
      { icon: "📦", text: <>Explora los planes disponibles en <strong style={{ color: C.navy }}>generar.co/pricing</strong>.</> },
      { icon: "➕", text: "Compra un Top-up de créditos si necesitas generar más AR sin cambiar de plan." },
      { icon: "🔄", text: "Actualiza o cambia tu plan directamente desde el dashboard en cualquier momento." },
    ],
  },
];

const FAQS = [
  {
    q: "¿Cuánto tarda en generarse un AR?",
    a: "Entre 10 y 30 segundos, dependiendo de la complejidad de la actividad y la cantidad de pasos ingresados.",
  },
  {
    q: "¿El formato cumple con los estándares de Ecopetrol?",
    a: "Sí. GenerAR genera el formato HSE-F-160 requerido por Ecopetrol a sus contratistas, con todas las secciones necesarias para presentar.",
  },
  {
    q: "¿Puedo editar el AR después de generarlo?",
    a: "Actualmente puedes descargarlo en Excel y editarlo libremente en tu equipo. La edición en línea estará disponible próximamente.",
  },
  {
    q: "¿Qué pasa si se interrumpe mi conexión durante la generación?",
    a: "Si el proceso falla por un error de conexión o de la plataforma, el crédito no se descuenta de tu cuenta.",
  },
  {
    q: "¿Mis datos y los de mi empresa son confidenciales?",
    a: "Sí. Toda la información ingresada es tratada conforme a nuestra Política de Datos Personales, disponible en generar.co/privacidad.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GuiaDeUso() {
  const ready = useAuthGuard();
  if (!ready) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; }
        a { color: ${C.blue}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ fontFamily: font.body, background: C.bg, minHeight: "100vh", color: C.ink }}>

        {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
        <nav style={{
          background: C.navy,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(27,58,92,0.22)",
        }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <span style={{ fontFamily: font.serif, fontSize: 26, letterSpacing: "-0.02em", color: "#FFFFFF", lineHeight: 1 }}>Gener</span>
            <span style={{ fontFamily: font.serif, fontSize: 26, letterSpacing: "-0.02em", color: C.blue,  lineHeight: 1 }}>AR</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="/dashboard" style={{
              fontSize: 13, fontWeight: 600, color: C.navy,
              background: C.blue, borderRadius: 6, padding: "7px 16px",
              textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
            }}>
              ← Dashboard
            </a>
          </div>
        </nav>

        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <div style={{
          background: C.navy,
          color: "#fff",
          textAlign: "center",
          padding: "72px 24px 60px",
          borderBottom: `3px solid ${C.blue}`,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.blue, marginBottom: 16,
          }}>
            Documentación
          </p>
          <h1 style={{
            fontFamily: font.serif,
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            color: "#FFFFFF", marginBottom: 20,
          }}>
            Guía de Uso
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: 16,
            fontWeight: 300, maxWidth: 520, margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Todo lo que necesitas para generar Análisis de Riesgos HSE con Inteligencia Artificial en minutos.
          </p>

          {/* Progress pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 36, flexWrap: "wrap" }}>
            {STEPS.map((s) => (
              <a key={s.num} href={`#step-${s.num}`} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 20, padding: "5px 14px",
                fontSize: 12, color: "rgba(255,255,255,0.65)",
                fontWeight: 500, textDecoration: "none",
                transition: "background 0.2s",
              }}>
                <span style={{ fontSize: 14 }}>{s.emoji}</span>
                <span>Paso {parseInt(s.num)}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
        <main style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 88px" }}>

          {/* Quick-read banner */}
          <div style={{
            background: C.greenLight,
            border: `1.5px solid ${C.green}`,
            borderRadius: 8, padding: "14px 20px",
            marginBottom: 48, fontSize: 14,
            color: C.green, fontWeight: 400, lineHeight: 1.7,
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>
            <span>
              <strong style={{ fontWeight: 600 }}>Proceso completo en 5 pasos.</strong>{" "}
              Desde el registro hasta la descarga de tu primer Análisis de Riesgos listo para presentar.
            </span>
          </div>

          {/* ── STEPS ────────────────────────────────────────────────────── */}
          {STEPS.map((step, idx) => (
            <StepCard key={step.num} step={step} isLast={idx === STEPS.length - 1} />
          ))}

          {/* ── FAQ ──────────────────────────────────────────────────────── */}
          <section style={{ marginTop: 64 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.16em",
                textTransform: "uppercase", color: C.blue, marginBottom: 10,
              }}>
                Soporte
              </p>
              <h2 style={{ fontFamily: font.serif, fontSize: 30, color: C.navy, letterSpacing: "-0.02em" }}>
                Preguntas Frecuentes
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQS.map((faq, i) => (
                <FaqCard key={i} faq={faq} />
              ))}
            </div>
          </section>

          {/* ── IMPORTANT NOTE ───────────────────────────────────────────── */}
          <div style={{
            background: C.amberLight,
            border: `1.5px solid ${C.amberBorder}`,
            borderRadius: 10, padding: "18px 22px",
            marginTop: 48, fontSize: 14,
            color: C.amber, lineHeight: 1.75,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <span>
              <strong style={{ fontWeight: 600 }}>Recuerda:</strong>{" "}
              Los Análisis de Riesgos generados por GenerAR son herramientas de apoyo basadas en Inteligencia Artificial.
              Siempre deben ser revisados y validados por un profesional HSE competente antes de su implementación en campo.
            </span>
          </div>

          {/* ── CTA ──────────────────────────────────────────────────────── */}
          <div style={{
            marginTop: 64,
            background: C.navy,
            borderRadius: 16,
            padding: "52px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative circle */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 220, height: 220, borderRadius: "50%",
              background: `${C.blue}22`,
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -40, left: -40,
              width: 160, height: 160, borderRadius: "50%",
              background: `${C.blue}18`,
              pointerEvents: "none",
            }} />

            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.16em",
              textTransform: "uppercase", color: C.blue, marginBottom: 14,
            }}>
              ¿Listo para comenzar?
            </p>
            <h2 style={{
              fontFamily: font.serif, fontSize: 28,
              color: "#FFFFFF", letterSpacing: "-0.02em",
              marginBottom: 12, lineHeight: 1.2,
            }}>
              Genera tu primer Análisis de Riesgos hoy
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.5)", fontSize: 14,
              fontWeight: 300, marginBottom: 32, lineHeight: 1.7,
            }}>
              Sin compromisos. 
                          </p>
            <a
              href="/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.blue, color: "#FFFFFF",
                fontFamily: font.body, fontWeight: 600,
                fontSize: 15, borderRadius: 8,
                padding: "14px 32px", textDecoration: "none",
                letterSpacing: "0.01em",
                boxShadow: "0 4px 18px rgba(46,134,171,0.35)",
              }}
            >
              Empezar ahora
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </a>
            <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              ¿Ya tienes cuenta?{" "}
              <a href="/login" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>
                Iniciar sesión
              </a>
            </p>
          </div>

        </main>

        {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
        <footer style={{
          background: C.navy,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          padding: "36px 24px",
          fontSize: 13, fontWeight: 300, lineHeight: 2.2,
        }}>
          <p>
            <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>GenerAR</span>
            {" · "}
            <a href="https://generar.co" style={{ color: C.blue }}>generar.co</a>
            {" · "}
            <a href="mailto:soporte@generar.co" style={{ color: C.blue }}>soporte@generar.co</a>
          </p>
          <p>Cali, Valle del Cauca, Colombia</p>
          <p style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.20)", lineHeight: 1.8 }}>
            GenerAR no está afiliado ni es producto oficial de Ecopetrol S.A.{" "}
            El formato HSE-F-160 es un requisito de Ecopetrol para sus contratistas.{" "}
            GenerAR es una herramienta independiente que facilita su elaboración.
          </p>
          <p style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} GenerAR. Todos los derechos reservados.
            {" · "}
            <a href="/terminos-de-servicio" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Términos</a>
            {" · "}
            <a href="/privacidad" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Privacidad</a>
          </p>
        </footer>
      </div>
    </>
  );
}

// ─── StepCard ────────────────────────────────────────────────────────────────
interface StepItem {
  icon: string;
  text: React.ReactNode;
}
interface Step {
  num: string;
  emoji: string;
  title: string;
  subtitle: string | React.ReactNode;
  items: StepItem[];
}

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: isLast ? 0 : 8 }}>

      {/* Left rail: number + connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 24, flexShrink: 0 }}>
        {/* Number badge */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: C.navy,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 0 4px ${C.blueLight}`,
          flexShrink: 0,
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: font.serif,
            fontSize: 18, color: C.blue, lineHeight: 1,
          }}>
            {step.num}
          </span>
        </div>
        {/* Connector line */}
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 32,
            background: `linear-gradient(to bottom, ${C.blue}55, ${C.rule})`,
            margin: "4px 0",
          }} />
        )}
      </div>

      {/* Card body */}
      <div style={{
        flex: 1,
        background: C.surface,
        border: `1px solid ${C.rule}`,
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: isLast ? 0 : 20,
      }}>
        {/* Card header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{step.emoji}</span>
          <h2 style={{
            fontFamily: font.serif,
            fontSize: 20, color: C.navy,
            letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            {step.title}
          </h2>
        </div>
        <p style={{
          fontSize: 13.5, color: C.inkFaint, fontWeight: 300,
          marginBottom: 18, lineHeight: 1.6,
        }}>
          {step.subtitle}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: C.rule, marginBottom: 18 }} />

        {/* Items */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
          {step.items.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0,
                minWidth: 26, height: 26,
                background: C.blueLight,
                borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: C.blue,
                fontWeight: 600, marginTop: 1,
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 14.5, color: C.inkMuted,
                fontWeight: 300, lineHeight: 1.7,
              }}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── FaqCard ─────────────────────────────────────────────────────────────────
function FaqCard({ faq }: { faq: { q: string; a: string } }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.rule}`,
      borderRadius: 10,
      padding: "18px 22px",
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "0 16px",
    }}>
      {/* Q */}
      <span style={{
        width: 22, height: 22, borderRadius: 6,
        background: C.navy, color: "#fff",
        fontSize: 11, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 2, flexShrink: 0,
      }}>
        Q
      </span>
      <p style={{
        fontSize: 14.5, fontWeight: 600,
        color: C.navy, lineHeight: 1.5, marginBottom: 8,
      }}>
        {faq.q}
      </p>

      {/* A */}
      <span style={{
        width: 22, height: 22, borderRadius: 6,
        background: C.blueLight, color: C.blue,
        fontSize: 11, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        A
      </span>
      <p style={{
        fontSize: 14, fontWeight: 300,
        color: C.inkMuted, lineHeight: 1.7,
      }}>
        {faq.a}
      </p>
    </div>
  );
}

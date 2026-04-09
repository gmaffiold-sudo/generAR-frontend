"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch, useAuthGuard } from "@/lib/api";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name:     "Starter",
    price:    "79.900",
    badge:    null,
    highlight: false,
    features: [
      "30 AR por mes",
      "1 usuario",
      "Formato Ecopetrol HSE",
      "Historial completo",
      "Descarga Excel",
      "Soporte por email",
    ],
    cta:   "Empezar ahora",
    href:  "/checkout?plan=starter",
    mail:  false,
  },
  {
    name:     "Professional",
    price:    "179.900",
    badge:    "Más popular",
    highlight: true,
    features: [
      "100 AR por mes",
      "Hasta 3 usuarios",
      "Todo lo del Starter",
      "Soporte prioritario",
    ],
    cta:   "Empezar ahora",
    href:  "/checkout?plan=professional",
    mail:  false,
  },
  {
    name:     "Business",
    price:    "399.900",
    badge:    null,
    highlight: false,
    features: [
      "300 AR por mes",
      "Hasta 10 usuarios",
      "Todo lo del Professional",
      "Soporte dedicado",
    ],
    cta:   "Empezar ahora",
    href:  "/checkout?plan=business",
    mail:  false,
  },
];

const TOPUPS = [
  { label: "Paquete S", ars: "10 AR",  price: "35.000",  planId: "topup_s" },
  { label: "Paquete M", ars: "30 AR",  price: "95.000",  planId: "topup_m" },
  { label: "Paquete L", ars: "100 AR", price: "220.000", planId: "topup_l" },
];

const FAQS = [
  {
    q: "¿Qué es un AR?",
    a: "Un Análisis de Riesgos HSE requerido por Ecopetrol para ejecutar trabajos de campo. Identifica peligros, consecuencias y controles antes de iniciar una actividad.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí, sin penalidades ni letra pequeña. Cancela cuando quieras desde tu panel de control y no se te cobra el siguiente período.",
  },
  {
    q: "¿El formato cumple con los estándares de Ecopetrol?",
    a: "Sí, GenerAR genera el formato HSE-F-160 exigido por Ecopetrol a sus contratistas, con todas las secciones requeridas: encabezado, tabla de riesgos RAM y sección de firmas.",
  },
  {
    q: "¿Qué pasa si me quedo sin AR?",
    a: "Puedes comprar un paquete Top-up para el mes en curso, o actualizar tu plan permanentemente. Subir de plan suele ser más económico por AR generado.",
  },
];

// ─── Intersection observer hook ──────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hov,      setHov]      = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position:        "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background:      scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter:  scrolled ? "blur(12px)" : "none",
      boxShadow:       scrolled ? "0 1px 20px rgba(27,58,92,0.09)" : "none",
      borderBottom:    scrolled ? "1px solid rgba(27,58,92,0.07)" : "none",
      transition:      "all 0.3s ease",
      // FIX: safe area iOS para notch / Dynamic Island
      paddingTop:      "env(safe-area-inset-top, 0px)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 66,
        display: "flex", alignItems: "center", justifyContent: "space-between",
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
        <a href="/dashboard"
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700,
            color: hov ? "#2E86AB" : "#1B3A5C",
            // FIX: padding vertical mínimo 12px
            textDecoration: "none", padding: "12px 20px", borderRadius: 8,
            border: `1.5px solid ${hov ? "#2E86AB" : "rgba(27,58,92,0.18)"}`,
            background: hov ? "rgba(46,134,171,0.05)" : "#fff",
            transition: "all 0.2s ease",
          }}>
          ← Volver al dashboard
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [in_, setIn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setIn(true), 60); return () => clearTimeout(t); }, []);
  return (
    // FIX: paddingTop adaptativo con safe area iOS
    <section style={{ paddingTop: "max(130px, calc(66px + env(safe-area-inset-top, 0px) + 16px))", paddingBottom: 72, textAlign: "center", background: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Background mesh */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(46,134,171,0.09) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(27,58,92,0.06) 0%, transparent 70%)" }} />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 28,
          background: "rgba(46,134,171,0.07)", border: "1px solid rgba(46,134,171,0.18)",
          borderRadius: 100, padding: "5px 14px",
          opacity: in_ ? 1 : 0, transform: in_ ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.55s ease",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E86AB", display: "inline-block" }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#2E86AB", letterSpacing: "0.04em" }}>
            Precios en COP · Sin contratos
          </span>
        </div>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif", fontSize: "clamp(34px, 5.5vw, 58px)",
          fontWeight: 400, color: "#1B3A5C", lineHeight: 1.13,
          letterSpacing: "-0.025em", marginBottom: 20,
          opacity: in_ ? 1 : 0, transform: in_ ? "translateY(0)" : "translateY(14px)",
          transition: "all 0.6s ease 0.08s",
        }}>
          Planes diseñados para{" "}
          <span style={{
            background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>contratistas HSE</span>
        </h1>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(15px, 2vw, 18px)",
          color: "#4A6070", lineHeight: 1.7, maxWidth: 560, margin: "0 auto",
          opacity: in_ ? 1 : 0, transform: in_ ? "translateY(0)" : "translateY(14px)",
          transition: "all 0.6s ease 0.16s",
        }}>
          Genera análisis de riesgos profesionales en minutos con IA. Sin contratos, cancela cuando quieras.
        </p>
      </div>
    </section>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, delay, visible }: { plan: typeof PLANS[0]; delay: number; visible: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 18, overflow: "hidden",
        background:   plan.highlight ? "linear-gradient(160deg, #1B3A5C 0%, #1d4d74 55%, #2E86AB 100%)" : "#fff",
        border:       plan.highlight ? "none" : `1.5px solid ${hov ? "rgba(46,134,171,0.30)" : "rgba(27,58,92,0.09)"}`,
        boxShadow:    plan.highlight
          ? "0 24px 64px rgba(27,58,92,0.28)"
          : hov ? "0 12px 36px rgba(27,58,92,0.10)" : "0 2px 12px rgba(27,58,92,0.05)",
        transform:    plan.highlight
          ? hov ? "translateY(-8px) scale(1.01)" : "translateY(-4px)"
          : hov ? "translateY(-5px)" : "translateY(0)",
        transition:   "all 0.3s ease",
        opacity:      visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        position:     "relative",
        display:      "flex", flexDirection: "column",
      }}
    >
      {plan.badge && (
        <div style={{
          position: "absolute", top: 20, right: 20,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 100, padding: "3px 12px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11, fontWeight: 800, color: "#fff",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{plan.badge}</div>
      )}

      {/* FIX: padding adaptativo con clamp para móvil */}
      <div style={{ padding: "clamp(24px, 5vw, 36px) clamp(20px, 5vw, 36px) 28px" }}>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: plan.highlight ? "rgba(255,255,255,0.55)" : "#2E86AB",
          letterSpacing: "0.1em", textTransform: "uppercase",
          display: "block", marginBottom: 10,
        }}>{plan.name}</span>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 13, fontWeight: 400,
            color: plan.highlight ? "rgba(255,255,255,0.7)" : "#4A6070",
            marginBottom: 6,
          }}>$</span>
          {/* FIX: fontSize adaptativo para pantallas pequeñas */}
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(36px, 8vw, 46px)", fontWeight: 400, lineHeight: 1,
            color: plan.highlight ? "#fff" : "#1B3A5C",
            letterSpacing: "-0.03em",
          }}>{plan.price}</span>
        </div>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
          color: plan.highlight ? "rgba(255,255,255,0.50)" : "#7A8EA0",
          display: "block", marginBottom: 28,
        }}>COP / mes</span>

        <div style={{ borderTop: plan.highlight ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(27,58,92,0.07)", paddingTop: 24 }}>
          {plan.features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 11 }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                background: plan.highlight ? "rgba(255,255,255,0.15)" : "rgba(46,134,171,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: plan.highlight ? "#fff" : "#2E86AB",
              }}>✓</div>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14,
                color: plan.highlight ? "rgba(255,255,255,0.80)" : "#4A6070",
                lineHeight: 1.5,
              }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FIX: padding adaptativo con clamp para móvil */}
      <div style={{ padding: "0 clamp(20px, 5vw, 36px) clamp(24px, 5vw, 36px)", marginTop: "auto" }}>
        <PlanCTA plan={plan} />
      </div>
    </div>
  );
}

function PlanCTA({ plan }: { plan: typeof PLANS[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={plan.href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textAlign: "center",
        // FIX: padding vertical 16px para tap target ≥ 44px
        padding: "16px 0",
        borderRadius: 10, textDecoration: "none",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800,
        transition: "all 0.22s ease",
        background: plan.highlight
          ? hov ? "#fff" : "rgba(255,255,255,0.92)"
          : hov ? "linear-gradient(135deg, #1B3A5C, #2E86AB)" : "#fff",
        color: plan.highlight ? "#1B3A5C" : hov ? "#fff" : "#1B3A5C",
        border: plan.highlight ? "none" : "2px solid rgba(27,58,92,0.18)",
        boxShadow: plan.highlight && hov ? "0 4px 20px rgba(255,255,255,0.25)" : "none",
        transform: hov ? "translateY(-1px)" : "translateY(0)",
      }}>
      {plan.cta} {plan.mail ? "→" : "→"}
    </a>
  );
}

// ─── Plans Section ────────────────────────────────────────────────────────────
function PlansSection() {
  const { ref, visible } = useFadeIn();
  return (
    <section style={{ background: "#F5F8FB", padding: "80px 24px 96px" }}>
      <div ref={ref} style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 22, alignItems: "start" }}>
          {PLANS.map((p, i) => (
            <PlanCard key={p.name} plan={p} delay={i * 100} visible={visible} />
          ))}
        </div>
        <p style={{
          textAlign: "center", marginTop: 28,
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#7A8EA0",
        }}>
          Todos los planes incluyen acceso inmediato · Facturación mensual · Precios en COP + IVA
        </p>
      </div>
    </section>
  );
}

// ─── Topup Section ────────────────────────────────────────────────────────────
function TopupSection() {
  const { ref, visible } = useFadeIn();
  return (
    <section style={{ background: "#fff", padding: "80px 24px" }}>
      <div ref={ref} style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 48,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease",
        }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#2E86AB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Top-up
          </span>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 400, color: "#1B3A5C", marginTop: 10, letterSpacing: "-0.02em" }}>
            ¿Necesitas más AR este mes?
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#5A7080", marginTop: 12, lineHeight: 1.6, maxWidth: 520, margin: "12px auto 0" }}>
            Compra paquetes adicionales sin cambiar de plan.{" "}
            <strong style={{ color: "#1B3A5C" }}>Tip:</strong> subir de plan es más económico por AR.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {TOPUPS.map((t, i) => (
            <TopupCard key={t.label} item={t} delay={i * 100} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TopupCard({ item, delay, visible }: { item: typeof TOPUPS[0]; delay: number; visible: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, padding: "28px 28px 24px",
        background: "#fff",
        border: `1.5px solid ${hov ? "rgba(46,134,171,0.30)" : "rgba(27,58,92,0.09)"}`,
        boxShadow: hov ? "0 10px 32px rgba(27,58,92,0.10)" : "0 2px 10px rgba(27,58,92,0.04)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay + 200}ms`,
        textAlign: "center",
      }}
    >
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 44, height: 44, borderRadius: 12,
        background: "linear-gradient(135deg, rgba(27,58,92,0.06), rgba(46,134,171,0.10))",
        border: "1px solid rgba(46,134,171,0.14)",
        fontSize: 20, marginBottom: 16,
      }}>📦</div>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#2E86AB", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
        {item.label}
      </p>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 4 }}>
        {item.ars}
      </p>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "#1B3A5C", letterSpacing: "-0.01em" }}>
        ${item.price} <span style={{ fontSize: 13, fontWeight: 500, color: "#7A8EA0" }}>COP</span>
      </p>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#A0B0BC", marginTop: 4 }}>
        ${Math.round(parseInt(item.price.replace(".", "")) / parseInt(item.ars)).toLocaleString("es-CO")} por AR
      </p>

      {/* FIX: padding vertical 13px para tap target ≥ 44px */}
      <a href={`/checkout?plan=${item.planId}`} style={{
        display: "block", marginTop: 20,
        padding: "13px 20px", borderRadius: 9,
        background: hov ? "linear-gradient(135deg, #1B3A5C, #2E86AB)" : "rgba(27,58,92,0.06)",
        color: hov ? "#fff" : "#1B3A5C",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 14, fontWeight: 700,
        textDecoration: "none", textAlign: "center",
        border: `1.5px solid ${hov ? "transparent" : "rgba(27,58,92,0.12)"}`,
        transition: "all 0.25s ease",
      }}>
        Comprar ahora
      </a>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqSection() {
  const { ref, visible } = useFadeIn();
  const [open, setOpen]  = useState<number | null>(null);
  return (
    <section style={{ background: "#F5F8FB", padding: "80px 24px" }}>
      <div ref={ref} style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 48,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease",
        }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#2E86AB", letterSpacing: "0.1em", textTransform: "uppercase" }}>FAQ</span>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: "#1B3A5C", marginTop: 10, letterSpacing: "-0.02em" }}>
            Preguntas frecuentes
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} visible={visible} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ faq, index, open, onToggle, visible, delay }: {
  faq: typeof FAQS[0]; index: number; open: boolean;
  onToggle: () => void; visible: boolean; delay: number;
}) {
  return (
    <div
      style={{
        borderRadius: 12, overflow: "hidden",
        border: `1.5px solid ${open ? "rgba(46,134,171,0.25)" : "rgba(27,58,92,0.08)"}`,
        background: open ? "rgba(46,134,171,0.03)" : "#fff",
        transition: "all 0.2s ease",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay + 300}ms`,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", background: "none", border: "none", cursor: "pointer",
          textAlign: "left", gap: 16,
        }}
      >
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#1B3A5C", lineHeight: 1.4 }}>
          {faq.q}
        </span>
        <span style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: open ? "linear-gradient(135deg, #1B3A5C, #2E86AB)" : "rgba(27,58,92,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: open ? "#fff" : "#5A7080",
          transition: "all 0.2s ease",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 18px" }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#5A7080", lineHeight: 1.7 }}>
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CtaSection() {
  const { ref, visible } = useFadeIn();
  const [hov, setHov]    = useState(false);
  return (
    <section style={{ background: "#fff", padding: "80px 24px 100px" }}>
      <div ref={ref} style={{
        maxWidth: 700, margin: "0 auto", textAlign: "center",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.7s ease",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(135deg, rgba(27,58,92,0.06), rgba(46,134,171,0.10))",
          border: "1px solid rgba(46,134,171,0.15)",
          fontSize: 26, marginBottom: 24,
        }}>⚡</div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4.5vw, 42px)",
          fontWeight: 400, color: "#1B3A5C", letterSpacing: "-0.025em",
          lineHeight: 1.18, marginBottom: 20,
        }}>
          Empieza hoy y genera tu primer AR en 2 minutos
        </h2>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: "#5A7080", lineHeight: 1.6, marginBottom: 36 }}>
          Sin tarjeta de crédito para empezar. Acceso inmediato.
        </p>
        <a href="/register"
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "15px 32px", borderRadius: 11,
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800,
            textDecoration: "none", color: "#fff",
            background: hov ? "linear-gradient(135deg, #16304d, #2677a0)" : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
            boxShadow: hov ? "0 8px 28px rgba(46,134,171,0.45)" : "0 3px 14px rgba(46,134,171,0.30)",
            transform: hov ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.22s ease",
            letterSpacing: "-0.01em",
          }}>
          Crear cuenta gratis →
        </a>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#0F2236", padding: "36px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.20)", lineHeight: 1.8, marginBottom: 20, textAlign: "center" }}>
          GenerAR no está afiliado ni es producto oficial de Ecopetrol S.A.{" "}
          El formato HSE-F-160 es un requisito de Ecopetrol para sus contratistas.{" "}
          GenerAR es una herramienta independiente que facilita su elaboración.
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.30)" }}>
            © 2026 GenerAR · generar.co
          </span>
          {/* FIX: flexWrap y gap reducido para evitar desborde en pantallas < 340px */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Términos", href: "/terminos-de-servicio" },
              { label: "Privacidad", href: "/politica-de-datos" },
              { label: "Contacto", href: "mailto:soporte@generar.co" },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.40)", textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "#2E86AB"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.40)"}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const router = useRouter();
  const ready  = useAuthGuard();
  const [rol,  setRol] = useState<string | null>(null);

  // Fetch role once auth is confirmed
  useEffect(() => {
    if (!ready) return;
    apiFetch(`${API}/user/profile`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRol(d.rol); })
      .catch(() => setRol("admin")); // fallback: mostrar página
  }, [ready]);

  // Redirect sub-users to dashboard
  useEffect(() => {
    if (rol === "usuario") router.replace("/dashboard");
  }, [rol, router]);

  if (!ready || rol === null) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; background: #fff; }
      `}</style>
      <Navbar />
      <main>
        <Hero />
        <PlansSection />
        <TopupSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

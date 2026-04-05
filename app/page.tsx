"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLink { label: string; href: string }
interface Benefit  { icon: string; title: string; desc: string }
interface Plan     { name: string; price: string; ars: string; highlight: boolean; features: string[] }

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { label: "Características", href: "#beneficios" },
  { label: "Precios",         href: "#precios"    },
  { label: "Contacto",        href: "mailto:soporte@generar.co"     },
];

const BENEFITS: Benefit[] = [
  {
    icon: "⚡",
    title: "De 4 horas a 2 minutos",
    desc:  "Genera análisis de riesgos completos al instante. Nuestra IA procesa cada actividad y entrega resultados profesionales listos para presentar.",
  },
  {
    icon: "📋",
    title: "Metodología RAM incluida",
    desc:  "Cada análisis sigue estándares industriales reconocidos. Identifica fuentes, peligros, consecuencias y controles con rigor técnico.",
  },
  {
    icon: "📊",
    title: "Exporta a Excel",
    desc:  "Descarga tu AR en segundos, formateado y listo para firmar. Compatible con los formatos exigidos por entes de control.",
  },
];

const PLANS: Plan[] = [
  {
    name:      "Starter",
    price:     "$79.900",
    ars:       "30 AR mensuales",
    highlight: false,
    features:  ["30 análisis por mes", "Exportación a Excel", "Soporte por email", "Acceso a plantillas base","1 Usuario"],
  },
  {
    name:      "Professional",
    price:     "$179.900",
    ars:       "100 AR mensuales",
    highlight: true,
    features:  ["100 análisis por mes", "Exportación a Excel y PDF", "Soporte prioritario", "Plantillas personalizadas", "Historial completo","Hasta 3 usuarios"],
  },
  {
    name:      "Business",
    price:     "$399.900",
    ars:       "300 AR mensuales",
    highlight: false,
    features:  ["300 análisis por mes", "Todos los formatos de exportación", "Soporte dedicado 24/7", "API access", "Gestión de equipo", "Reportes avanzados","Hasta 10 usuarios"],
  },
];

// ─── Utility hook: fade-in on scroll ──────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        zIndex:          100,
        transition:      "all 0.3s ease",
        backgroundColor: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter:  scrolled ? "blur(12px)"              : "none",
        boxShadow:       scrolled ? "0 1px 24px rgba(27,58,92,0.10)" : "none",
        borderBottom:    scrolled ? "1px solid rgba(27,58,92,0.08)"  : "none",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, #1B3A5C 0%, #2E86AB 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(46,134,171,0.35)",
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: "-0.5px" }}>G</span>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1B3A5C", letterSpacing: "-0.5px" }}>
            Gener<span style={{ color: "#2E86AB" }}>AR</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 36, alignItems: "center" }} className="desktop-nav">
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{
              fontFamily:     "'Plus Jakarta Sans', sans-serif",
              fontSize:       15,
              fontWeight:     500,
              color:          "#1B3A5C",
              textDecoration: "none",
              opacity:        0.75,
              transition:     "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.75")}
            >{l.label}</a>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="desktop-nav">
          <a href="/login" style={{
            fontFamily:     "'Plus Jakarta Sans', sans-serif",
            fontSize:       14,
            fontWeight:     600,
            color:          "#1B3A5C",
            textDecoration: "none",
            padding:        "8px 18px",
            borderRadius:   8,
            border:         "1.5px solid rgba(27,58,92,0.2)",
            transition:     "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2E86AB"; e.currentTarget.style.color = "#2E86AB"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(27,58,92,0.2)"; e.currentTarget.style.color = "#1B3A5C"; }}
          >Iniciar sesión</a>

          <a href="/register" style={{
            fontFamily:      "'Plus Jakarta Sans', sans-serif",
            fontSize:        14,
            fontWeight:      600,
            color:           "#fff",
            textDecoration:  "none",
            padding:         "9px 20px",
            borderRadius:    8,
            background:      "linear-gradient(135deg, #1B3A5C 0%, #2E86AB 100%)",
            boxShadow:       "0 2px 12px rgba(46,134,171,0.35)",
            transition:      "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(46,134,171,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 2px 12px rgba(46,134,171,0.35)"; }}
          >Registrarse gratis</a>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-burger"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none" }}
          aria-label="Menú"
        >
          <div style={{ width: 22, height: 2, background: "#1B3A5C", marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: "#1B3A5C", marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: "#1B3A5C", borderRadius: 2 }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#fff", padding: "16px 24px 24px", borderTop: "1px solid #edf0f4", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{
              display: "block", padding: "12px 0",
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 500,
              color: "#1B3A5C", textDecoration: "none",
              borderBottom: "1px solid #f0f2f5",
            }}>{l.label}</a>
          ))}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="/login"    style={{ textAlign: "center", padding: "11px", borderRadius: 8, border: "1.5px solid #1B3A5C", color: "#1B3A5C", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Iniciar sesión</a>
            <a href="/register" style={{ textAlign: "center", padding: "11px", borderRadius: 8, background: "linear-gradient(135deg, #1B3A5C, #2E86AB)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Registrarse gratis</a>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      minHeight:       "100vh",
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      textAlign:       "center",
      padding:         "120px 24px 80px",
      position:        "relative",
      overflow:        "hidden",
      background:      "#fff",
    }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position:     "absolute", top: -180, right: -180,
          width: 560, height: 560, borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(46,134,171,0.10) 0%, transparent 70%)",
        }} />
        <div style={{
          position:     "absolute", bottom: -120, left: -120,
          width: 400, height: 400, borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(27,58,92,0.07) 0%, transparent 70%)",
        }} />
        {/* Grid pattern */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1B3A5C" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{ maxWidth: 780, position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display:        "inline-flex", alignItems: "center", gap: 8,
          background:     "linear-gradient(135deg, rgba(27,58,92,0.06), rgba(46,134,171,0.08))",
          border:         "1px solid rgba(46,134,171,0.2)",
          borderRadius:   100, padding:  "6px 16px", marginBottom: 32,
          opacity:        loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(12px)",
          transition:     "all 0.6s ease",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E86AB", display: "inline-block" }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2E86AB", letterSpacing: "0.02em" }}>
            IA para profesionales HSE
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily:  "'DM Serif Display', Georgia, serif",
          fontSize:    "clamp(38px, 6vw, 66px)",
          fontWeight:  400,
          lineHeight:  1.12,
          color:       "#1B3A5C",
          marginBottom: 24,
          letterSpacing: "-0.02em",
          opacity:     loaded ? 1 : 0,
          transform:   loaded ? "translateY(0)" : "translateY(16px)",
          transition:  "all 0.7s ease 0.1s",
        }}>
          Genera Análisis de Riesgos{" "}
          <span style={{
            background:          "linear-gradient(135deg, #1B3A5C 0%, #2E86AB 100%)",
            WebkitBackgroundClip:"text",
            WebkitTextFillColor: "transparent",
            backgroundClip:      "text",
          }}>HSE en segundos</span>{" "}
          con Inteligencia Artificial
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily:   "'Plus Jakarta Sans', sans-serif",
          fontSize:     "clamp(16px, 2.2vw, 19px)",
          lineHeight:   1.7,
          color:        "#4A6070",
          marginBottom: 44,
          maxWidth:     620,
          margin:       "0 auto 44px",
          opacity:      loaded ? 1 : 0,
          transform:    loaded ? "translateY(0)" : "translateY(16px)",
          transition:   "all 0.7s ease 0.2s",
        }}>
          Deja de perder horas creando AR manualmente. GenerAR usa IA para crear análisis
          completos y profesionales en <strong style={{ color: "#1B3A5C" }}>menos de 2 minutos</strong>.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display:    "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
          opacity:    loaded ? 1 : 0,
          transform:  loaded ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s ease 0.3s",
        }}>
          <CTAButton href="/register" primary>
            Empieza gratis →
          </CTAButton>
          <CTAButton href="#demo" primary={false}>
            ▶ Ver demo
          </CTAButton>
        </div>

        {/* Trust bar */}
        <div style={{
          marginTop:  56,
          display:    "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap",
          opacity:    loaded ? 1 : 0,
          transition: "all 0.7s ease 0.5s",
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: "#F4A261", fontSize: 16 }}>★</span>
            ))}
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#7A8EA0", fontWeight: 500 }}>
            Más de <strong style={{ color: "#1B3A5C" }}>500 profesionales</strong> HSE ya usan GenerAR
          </span>
        </div>
      </div>
    </section>
  );
}

function CTAButton({ href, primary, children }: { href: string; primary: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            8,
    padding:        "14px 28px",
    borderRadius:   10,
    fontSize:       16,
    fontWeight:     700,
    fontFamily:     "'Plus Jakarta Sans', sans-serif",
    textDecoration: "none",
    cursor:         "pointer",
    transition:     "all 0.22s ease",
    letterSpacing:  "-0.01em",
  };
  const primaryStyle: React.CSSProperties = {
    ...base,
    background:  hovered ? "linear-gradient(135deg, #16304d, #2677a0)" : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
    color:       "#fff",
    boxShadow:   hovered ? "0 6px 28px rgba(46,134,171,0.50)" : "0 3px 16px rgba(46,134,171,0.35)",
    transform:   hovered ? "translateY(-2px)" : "translateY(0)",
  };
  const secondaryStyle: React.CSSProperties = {
    ...base,
    background:  hovered ? "rgba(27,58,92,0.06)" : "#fff",
    color:       "#1B3A5C",
    border:      "2px solid rgba(27,58,92,0.15)",
    transform:   hovered ? "translateY(-2px)" : "translateY(0)",
    boxShadow:   hovered ? "0 4px 16px rgba(27,58,92,0.12)" : "none",
  };
  return (
    <a href={href} style={primary ? primaryStyle : secondaryStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >{children}</a>
  );
}

// ─── Benefits ─────────────────────────────────────────────────────────────────
function Benefits() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="beneficios" style={{ background: "#F5F8FB", padding: "100px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 64,
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease",
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700,
            color: "#2E86AB", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>Por qué GenerAR</span>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400,
            color: "#1B3A5C", marginTop: 12, letterSpacing: "-0.02em",
          }}>Todo lo que necesitas para un AR profesional</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 28 }}>
          {BENEFITS.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} delay={i * 120} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ benefit, delay, visible }: { benefit: Benefit; delay: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "#fff",
        borderRadius: 16,
        padding:      "40px 36px",
        border:       hovered ? "1.5px solid rgba(46,134,171,0.35)" : "1.5px solid rgba(27,58,92,0.07)",
        boxShadow:    hovered ? "0 16px 48px rgba(27,58,92,0.12)" : "0 2px 16px rgba(27,58,92,0.05)",
        transform:    hovered ? "translateY(-6px)" : "translateY(0)",
        transition:   "all 0.3s ease",
        opacity:      visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background:  "linear-gradient(135deg, rgba(27,58,92,0.06), rgba(46,134,171,0.10))",
        display:     "flex", alignItems: "center", justifyContent: "center",
        fontSize:    26, marginBottom: 24,
        border:      "1px solid rgba(46,134,171,0.15)",
      }}>{benefit.icon}</div>
      <h3 style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 22, fontWeight: 400, color: "#1B3A5C",
        marginBottom: 12, letterSpacing: "-0.01em",
      }}>{benefit.title}</h3>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15, lineHeight: 1.7, color: "#5A7080",
      }}>{benefit.desc}</p>
    </div>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="precios" style={{ background: "#fff", padding: "100px 24px" }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: 64,
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s ease",
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700,
            color: "#2E86AB", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>Planes y precios</span>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400,
            color: "#1B3A5C", marginTop: 12, letterSpacing: "-0.02em",
          }}>Elige el plan que se adapta a tu equipo</h2>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 16, color: "#5A7080", marginTop: 12,
          }}>Sin contratos. Cancela cuando quieras.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24, alignItems: "start" }}>
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} delay={i * 120} visible={visible} />
          ))}
        </div>

        {/* Top-up informativo */}
<div style={{
  marginTop: 48, padding: "28px 32px",
  background: "rgba(46,134,171,0.05)",
  border: "1.5px solid rgba(46,134,171,0.15)",
  borderRadius: 16, textAlign: "center",
}}>
  <p style={{
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 13, fontWeight: 700, color: "#2E86AB",
    letterSpacing: "0.08em", textTransform: "uppercase",
    marginBottom: 8,
  }}>¿Necesitas más AR este mes?</p>
  <p style={{
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 15, color: "#4A6070", marginBottom: 20,
  }}>
    Compra créditos adicionales sin cambiar de plan
  </p>
  <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
    {[
      { label: "Paquete S", ars: "10 AR", price: "$35.000" },
      { label: "Paquete M", ars: "30 AR", price: "$95.000" },
      { label: "Paquete L", ars: "100 AR", price: "$220.000" },
    ].map(t => (
      <div key={t.label} style={{
        background: "#fff", borderRadius: 12,
        padding: "16px 24px", textAlign: "center",
        border: "1.5px solid rgba(27,58,92,0.09)",
        minWidth: 140,
      }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#2E86AB", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{t.label}</p>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1B3A5C", marginBottom: 2 }}>{t.ars}</p>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, color: "#1B3A5C" }}>{t.price} <span style={{ fontSize: 11, fontWeight: 500, color: "#7A8EA0" }}>COP</span></p>
      </div>
    ))}
  </div>
  <p style={{
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12, color: "#A0B0BC", marginTop: 16,
  }}>
    * Disponible para usuarios con suscripción activa. 
  </p>
</div>

      </div>
    </section>
  );
}
 

function PricingCard({ plan, delay, visible }: { plan: Plan; delay: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius:    18,
        padding:         plan.highlight ? "44px 36px" : "36px 32px",
        background:      plan.highlight
          ? "linear-gradient(160deg, #1B3A5C 0%, #1e4d74 50%, #2E86AB 100%)"
          : "#fff",
        border:          plan.highlight
          ? "none"
          : hovered ? "1.5px solid rgba(46,134,171,0.3)" : "1.5px solid rgba(27,58,92,0.08)",
        boxShadow:       plan.highlight
          ? "0 24px 64px rgba(27,58,92,0.30)"
          : hovered ? "0 12px 36px rgba(27,58,92,0.10)" : "0 2px 12px rgba(27,58,92,0.05)",
        transform:       plan.highlight
          ? hovered ? "translateY(-8px) scale(1.01)" : "translateY(-4px) scale(1.005)"
          : hovered ? "translateY(-6px)" : "translateY(0)",
        transition:      "all 0.3s ease",
        opacity:         visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        position:        "relative",
        overflow:        "hidden",
      }}
    >
      {plan.highlight && (
        <div style={{
          position:        "absolute", top: 18, right: 18,
          background:      "rgba(255,255,255,0.15)",
          border:          "1px solid rgba(255,255,255,0.25)",
          borderRadius:    100,
          padding:         "4px 12px",
          fontFamily:      "'Plus Jakarta Sans', sans-serif",
          fontSize:        11, fontWeight: 700,
          color:           "#fff", letterSpacing: "0.08em",
          textTransform:   "uppercase",
        }}>Más popular</div>
      )}

      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, fontWeight: 700,
          color: plan.highlight ? "rgba(255,255,255,0.65)" : "#2E86AB",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>{plan.name}</span>
      </div>

      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 42, fontWeight: 400,
          color: plan.highlight ? "#fff" : "#1B3A5C",
          letterSpacing: "-0.03em",
        }}>{plan.price}</span>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.55)" : "#7A8EA0",
          marginLeft: 4,
        }}>/mes</span>
      </div>

      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: plan.highlight ? "rgba(255,255,255,0.12)" : "rgba(46,134,171,0.08)",
        borderRadius: 100, padding: "5px 12px", marginBottom: 28,
      }}>
        <span style={{ fontSize: 12 }}>📄</span>
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, fontWeight: 600,
          color: plan.highlight ? "rgba(255,255,255,0.85)" : "#2E86AB",
        }}>{plan.ars}</span>
      </div>

      <div style={{ borderTop: plan.highlight ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(27,58,92,0.07)", paddingTop: 24, marginBottom: 32 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
            <span style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              background: plan.highlight ? "rgba(255,255,255,0.15)" : "rgba(46,134,171,0.10)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: plan.highlight ? "#fff" : "#2E86AB",
            }}>✓</span>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.80)" : "#4A6070",
              lineHeight: 1.5,
            }}>{f}</span>
          </div>
        ))}
      </div>

      <PlanButton highlight={plan.highlight} />
    </div>
  );
}

function PlanButton({ highlight }: { highlight: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href="/register"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "block",
        textAlign:      "center",
        padding:        "13px 0",
        borderRadius:   10,
        fontFamily:     "'Plus Jakarta Sans', sans-serif",
        fontSize:       15, fontWeight: 700,
        textDecoration: "none",
        transition:     "all 0.22s ease",
        background:     highlight
          ? hovered ? "rgba(255,255,255,1)"  : "rgba(255,255,255,0.92)"
          : hovered ? "linear-gradient(135deg, #1B3A5C, #2E86AB)" : "#fff",
        color:          highlight
          ? "#1B3A5C"
          : hovered ? "#fff" : "#1B3A5C",
        border:         highlight ? "none" : "2px solid rgba(27,58,92,0.2)",
        boxShadow:      highlight && hovered ? "0 4px 20px rgba(255,255,255,0.3)" : "none",
        transform:      hovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >Comenzar ahora →</a>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer id="footer" style={{
      background:   "#0F2236",
      padding:      "64px 24px 40px",
      color:        "rgba(255,255,255,0.6)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "'DM Serif Display', serif" }}>G</span>
              </div>
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                Gener<span style={{ color: "#2E86AB" }}>AR</span>
              </span>
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>
              Plataforma de Inteligencia Artificial para la generación de Análisis de Riesgos HSE profesionales y completos.
            </p>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
            {[
              { label: "Términos de servicio", href: "/terminos-de-servicio" },
              { label: "Política de datos personales", href: "/politica-de-datos" },
            ].map(l => (
              <a key={l.label} href={l.href} style={{
                display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14, color: "rgba(255,255,255,0.50)", textDecoration: "none",
                marginBottom: 10, transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#2E86AB"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.50)"}
              >{l.label}</a>
            ))}
          </div>

          {/* Product */}
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Producto</p>
            {[
              { label: "Características", href: "#beneficios" },
              { label: "Precios", href: "#precios" },
            ].map(l => (
              <a key={l.label} href={l.href} style={{
                display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 14, color: "rgba(255,255,255,0.50)", textDecoration: "none",
                marginBottom: 10, transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#2E86AB"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.50)"}
              >{l.label}</a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 28 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.20)", lineHeight: 1.8, marginBottom: 16, textAlign: "center" }}>
            GenerAR no está afiliado ni es producto oficial de Ecopetrol S.A.{" "}
            El formato HSE-F-160 es un requisito de Ecopetrol para sus contratistas.{" "}
            GenerAR es una herramienta independiente que facilita su elaboración.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.30)" }}>
            © 2026 GenerAR. Todos los derechos reservados.{" "}
              
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
            Hecho con IA para profesionales HSE 🛡️
          </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: block !important; }
        }
      `}</style>

      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}

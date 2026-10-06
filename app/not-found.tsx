import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

const FONT_SANS  = "'Plus Jakarta Sans', Arial, sans-serif";
const FONT_SERIF = "'DM Serif Display', Georgia, serif";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        background: "#F5F8FB",
        color: "#1B3A5C",
        fontFamily: FONT_SANS,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 40 }}>
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 17,
            fontWeight: 800,
            fontFamily: FONT_SERIF,
          }}
        >
          G
        </span>
        <span style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: "#1B3A5C" }}>
          Gener<span style={{ color: "#1F6E8F" }}>AR</span>
        </span>
      </Link>

      <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1F6E8F", margin: 0 }}>
        Error 404
      </p>
      <h1 style={{ fontFamily: FONT_SERIF, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 400, lineHeight: 1.15, margin: "12px 0 16px" }}>
        Esta página no existe
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#4A6070", maxWidth: 460, margin: "0 0 32px" }}>
        El enlace que seguiste puede estar roto o la página fue movida. Vuelve al inicio o revisa la guía de uso.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "14px 28px",
            borderRadius: 10,
            background: "#1B3A5C",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Volver al inicio
        </Link>
        <a
          href="/guia-de-uso"
          style={{
            padding: "12px 26px",
            borderRadius: 10,
            border: "2px solid #1B3A5C",
            color: "#1B3A5C",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Guía de uso
        </a>
      </div>

      <p style={{ fontSize: 14, color: "#4A6070", marginTop: 36 }}>
        ¿Necesitas ayuda? Escríbenos a{" "}
        <a href="mailto:soporte@generar.co" style={{ color: "#1B3A5C", fontWeight: 600 }}>soporte@generar.co</a>
      </p>
    </main>
  );
}

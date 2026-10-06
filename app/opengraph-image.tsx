import { ImageResponse } from "next/og";

export const alt = "GenerAR — Análisis de Riesgos y ATS profesionales en segundos con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0F2236 0%, #1B3A5C 55%, #2E86AB 100%)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#FFFFFF",
              color: "#1B3A5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 46,
              fontWeight: 800,
            }}
          >
            G
          </div>
          <div style={{ display: "flex", marginLeft: 22, fontSize: 50, fontWeight: 700 }}>
            <span>Gener</span>
            <span style={{ color: "#8FD0EA" }}>AR</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            Análisis de Riesgos y ATS profesionales en segundos con IA
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "rgba(255,255,255,0.85)" }}>
            Metodología RAM · Exportación a Excel y PDF · Empieza gratis
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          generar.co
        </div>
      </div>
    ),
    { ...size }
  );
}

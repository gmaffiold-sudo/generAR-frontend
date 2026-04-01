"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Credits {
  plan:                string;
  creditos_totales:    number;
  creditos_usados:     number;
  creditos_restantes:  number;
  fecha_vencimiento:   string;
  estado_suscripcion:  string;
}

interface RegistroAR {
  id:                    string;
  fecha:                 string;
  titulo_actividad:      string;
  tiene_datos_ecopetrol: boolean;
  creado_por?:           string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_token");
}

function formatDate(iso: string): string {
  try {
    // Normalizar formato con espacio y UTC
    const normalized = iso.replace(" UTC", "").replace(" ", "T") + "Z";
    return new Date(normalized).toLocaleDateString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

function decodeEmail(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || "";
  } catch { return ""; }
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, radius = 8 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, rgba(27,58,92,0.06) 25%, rgba(27,58,92,0.10) 50%, rgba(27,58,92,0.06) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─── Credits Card ─────────────────────────────────────────────────────────────
function CreditsCard({
  credits, loading, onGenerate, isSubUser,
}: {
  credits:    Credits | null;
  loading:    boolean;
  onGenerate: () => void;
  isSubUser:  boolean;
}) {
  const pct = credits
    ? Math.round((credits.creditos_usados / credits.creditos_totales) * 100)
    : 0;

  const barColor = pct >= 90 ? "#E05252" : pct >= 70 ? "#F4A261" : "#2E86AB";

  return (
    <div style={{
      background:   "linear-gradient(160deg, #1B3A5C 0%, #1e4d74 55%, #2E86AB 100%)",
      borderRadius: 20,
      padding:      "40px 44px",
      position:     "relative",
      overflow:     "hidden",
      boxShadow:    "0 20px 60px rgba(27,58,92,0.30)",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, position: "relative", zIndex: 1 }}>

        {/* Left — credits info */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {loading ? (
            <>
              <Skeleton w={120} h={14} />
              <div style={{ marginTop: 12 }}><Skeleton w={80} h={56} /></div>
              <div style={{ marginTop: 12 }}><Skeleton w="90%" h={8} radius={4} /></div>
            </>
          ) : credits ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12, fontWeight: 700,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>Plan {credits.plan}</span>
                <span style={{
                  background: credits.estado_suscripcion === "activa" ? "rgba(39,174,96,0.25)" : "rgba(224,82,82,0.25)",
                  border: `1px solid ${credits.estado_suscripcion === "activa" ? "rgba(39,174,96,0.4)" : "rgba(224,82,82,0.4)"}`,
                  borderRadius: 100, padding: "2px 10px",
                  fontSize: 11, fontWeight: 700,
                  color: credits.estado_suscripcion === "activa" ? "#6EDBA8" : "#F08080",
                }}>{credits.estado_suscripcion}</span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 72, fontWeight: 400, lineHeight: 1,
                  color: "#fff", letterSpacing: "-0.04em",
                }}>{credits.creditos_restantes}</span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 16, color: "rgba(255,255,255,0.50)",
                  marginBottom: 10, fontWeight: 500,
                }}>/ {credits.creditos_totales} créditos</span>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: barColor,
                    borderRadius: 3,
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    {credits.creditos_usados} usados
                  </span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    Vence {formatDate(credits.fecha_vencimiento)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              No se encontró suscripción activa.
            </p>
          )}
        </div>

        {/* Right — CTA buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isSubUser && (
          <a href="/pricing" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.20)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
        >
          Ver planes
        </a>
          )}
          {!isSubUser && (
          <a href="/settings" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.20)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 6,
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
          >
            ⚙️ Configuración
          </a>
          )}
          <GenerateButton onClick={onGenerate} disabled={loading || !credits || credits.creditos_restantes <= 0} />
        </div>
      </div>
    </div>
  );
}

function GenerateButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding:        "16px 28px",
        borderRadius:   12,
        border:         "none",
        cursor:         disabled ? "not-allowed" : "pointer",
        background:     disabled
          ? "rgba(255,255,255,0.10)"
          : hovered ? "#fff" : "rgba(255,255,255,0.92)",
        color:          disabled ? "rgba(255,255,255,0.35)" : "#1B3A5C",
        fontFamily:     "'Plus Jakarta Sans', sans-serif",
        fontSize:       15,
        fontWeight:     800,
        letterSpacing:  "-0.01em",
        transition:     "all 0.22s ease",
        boxShadow:      !disabled && hovered ? "0 8px 28px rgba(0,0,0,0.20)" : "none",
        transform:      !disabled && hovered ? "translateY(-2px)" : "translateY(0)",
        whiteSpace:     "nowrap",
        display:        "flex",
        alignItems:     "center",
        gap:            8,
      }}
    >
      <span style={{ fontSize: 18 }}>⚡</span>
      Generar nuevo AR
    </button>
  );
}

// ─── History Table ─────────────────────────────────────────────────────────────
function HistoryTable({ registros, loading }: { registros: RegistroAR[]; loading: boolean }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1.5px solid rgba(27,58,92,0.08)",
      overflow: "hidden",
      boxShadow: "0 2px 16px rgba(27,58,92,0.05)",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 32px",
        borderBottom: "1px solid rgba(27,58,92,0.07)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 22, fontWeight: 400, color: "#1B3A5C",
            letterSpacing: "-0.02em",
          }}>Historial de análisis</h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#7A8EA0", marginTop: 4 }}>
            Todos tus análisis de riesgos generados
          </p>
        </div>
        {!loading && registros.length > 0 && (
          <span style={{
            background: "rgba(46,134,171,0.08)",
            border: "1px solid rgba(46,134,171,0.15)",
            borderRadius: 100, padding: "4px 14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, fontWeight: 700, color: "#2E86AB",
          }}>{registros.length} AR</span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "32px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "center" }}>
              <Skeleton w={100} h={14} />
              <Skeleton w="60%" h={14} />
            </div>
          ))}
        </div>
      ) : registros.length === 0 ? (
        <div style={{
          padding: "64px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, rgba(27,58,92,0.05), rgba(46,134,171,0.08))",
            border: "1px solid rgba(46,134,171,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 20px",
          }}>📋</div>
          <p style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20, color: "#1B3A5C", fontWeight: 400, marginBottom: 8,
          }}>Aún no has generado ningún análisis</p>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14, color: "#7A8EA0", lineHeight: 1.6,
          }}>
            Haz clic en <strong style={{ color: "#1B3A5C" }}>Generar nuevo AR</strong> para crear tu primer análisis de riesgos HSE.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "150px 1fr 130px auto",
            padding: "12px 32px",
            background: "#F8FAFC",
            borderBottom: "1px solid rgba(27,58,92,0.06)",
          }}>
            {["Fecha", "Título de actividad", "Creado por", "Descargas"].map(col => (
              <span key={col} style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                color: "#7A8EA0", letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>{col}</span>
            ))}
          </div>

          {/* Rows */}
          {registros.map((r, i) => (
            <TableRow key={r.id} registro={r} isLast={i === registros.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function triggerXlsxDownload(b64: string, filename: string) {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const blob  = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function triggerPdfDownload(b64: string, filename: string) {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const blob  = new Blob([bytes], { type: "application/pdf" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function DlIconButton({
  title, color, loading, disabled, onClick, children,
}: {
  title: string; color: string; loading: boolean;
  disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  const [h, setH] = useState(false);
  const isDisabled = loading || disabled;
  return (
    <button
      onClick={onClick} disabled={isDisabled} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: 32, height: 32, borderRadius: 7, flexShrink: 0,
        border: `1.5px solid ${h && !isDisabled ? color + "50" : "rgba(27,58,92,0.12)"}`,
        background: isDisabled ? "rgba(27,58,92,0.03)" : h ? color + "12" : "#fff",
        cursor: isDisabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.18s ease",
      }}
    >
      {loading ? (
        <span style={{
          width: 13, height: 13,
          border: "1.5px solid rgba(27,58,92,0.15)",
          borderTopColor: color,
          borderRadius: "50%", display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      ) : children}
    </button>
  );
}

function TableRow({ registro, isLast }: { registro: RegistroAR; isLast: boolean }) {
  const [hovered,       setHovered]       = useState(false);
  const [dlXls,         setDlXls]         = useState(false);
  const [dlEco,         setDlEco]         = useState(false);
  const [dlPdf,         setDlPdf]         = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");

  const slugTitle = registro.titulo_actividad.replace(/\s+/g, "_").slice(0, 40);
  const fechaFmt  = formatDate(registro.fecha).replace(/\s/g, "_").replace(/\./g, "");

  // 📊 Excel básico — GET /ar/{id}/download
  const handleXls = async () => {
    setDlXls(true); setErrorMsg("");
    try {
      // 1. Obtener array de riesgos del backend
      const res  = await fetch(`${API}/ar/${registro.id}/analisis`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.status === 404) { setErrorMsg("Este AR no tiene análisis guardado"); return; }
      if (!res.ok)            { setErrorMsg(data?.detail || "Error al obtener el análisis"); return; }

      // 2. Cargar SheetJS dinámicamente si no está cargado
      if (!(window as any).XLSX) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src     = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
          s.onload  = () => resolve();
          s.onerror = () => reject(new Error("No se pudo cargar SheetJS"));
          document.head.appendChild(s);
        });
      }
      const XLSX = (window as any).XLSX;

      // 3. Generar Excel en el frontend
      const headers = ["Fuente", "Detalle", "Peligro", "Consecuencia", "Controles", "Responsable"];
      const rows = (data.analisis as any[]).map((r: any) => [
        r.Fuente, r.Detalle, r.Peligro, r.Consecuencia, r.Controles, r.Responsable,
      ]);
      const ws = XLSX.utils.aoa_to_sheet([
        [`ANÁLISIS DE RIESGOS HSE — ${registro.titulo_actividad.toUpperCase()}`],
        [`GenerAR (generar.co) — ${new Date().toLocaleDateString("es-CO")}`],
        [],
        headers,
        ...rows,
      ]);
      ws["!cols"]   = [{ wch: 22 }, { wch: 40 }, { wch: 20 }, { wch: 35 }, { wch: 40 }, { wch: 22 }];
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Análisis de Riesgos");
      XLSX.writeFile(wb, `AR_${slugTitle}_${fechaFmt}.xlsx`);
    } catch (e: any) { setErrorMsg(e.message || "No se pudo conectar con el servidor"); }
    finally { setDlXls(false); }
  };

  // 🏭 Ecopetrol — GET /ar/{id}/download (mismo endpoint, nombre distinto)
  const handleEco = async () => {
    setDlEco(true); setErrorMsg("");
    try {
      const res  = await fetch(`${API}/ar/${registro.id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.status === 422) { setErrorMsg("Este AR fue generado antes de que se activara esta función"); return; }
      if (!res.ok)            { setErrorMsg(data?.detail || "Error al descargar"); return; }
      triggerXlsxDownload(data.excel_base64, `AR_Ecopetrol_${slugTitle}_${fechaFmt}.xlsx`);
    } catch { setErrorMsg("No se pudo conectar con el servidor"); }
    finally { setDlEco(false); }
  };

  // 📄 PDF — GET analisis primero, luego POST /ar/export/pdf con datos reales
  const handlePdf = async () => {
    setDlPdf(true); setErrorMsg("");
    try {
      // 1. Obtener array de riesgos del backend
      const resAnalisis = await fetch(`${API}/ar/${registro.id}/analisis`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const dataAnalisis = await resAnalisis.json();
      if (resAnalisis.status === 404) { setErrorMsg("Este AR no tiene análisis guardado"); return; }
      if (!resAnalisis.ok)            { setErrorMsg(dataAnalisis?.detail || "Error al obtener el análisis"); return; }

      // 2. Generar PDF en el backend con los riesgos reales
      const res  = await fetch(`${API}/ar/export/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          registro_id:      registro.id,
          analisis:         dataAnalisis.analisis,
          titulo_actividad: registro.titulo_actividad,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data?.detail || "Error al generar el PDF"); return; }
      triggerPdfDownload(data.pdf_base64, `AR_${slugTitle}_${fechaFmt}.pdf`);
    } catch { setErrorMsg("No se pudo conectar con el servidor"); }
    finally { setDlPdf(false); }
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "grid", gridTemplateColumns: "150px 1fr 130px auto",
          padding: "14px 32px",
          borderBottom: isLast && !errorMsg ? "none" : "1px solid rgba(27,58,92,0.05)",
          background: hovered ? "rgba(46,134,171,0.03)" : "#fff",
          transition: "background 0.15s ease",
          alignItems: "center", gap: 16,
        }}
      >
        {/* Fecha */}
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, color: "#7A8EA0", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 12 }}>🗓</span>
          {formatDate(registro.fecha)}
        </span>

        {/* Título */}
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 14, color: "#1B3A5C", fontWeight: 600, lineHeight: 1.4,
        }}>
          {registro.titulo_actividad}
        </span>

        {/* Creado por */}
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, color: registro.creado_por ? "#2E86AB" : "#A0B0BC",
          fontWeight: registro.creado_por ? 600 : 400,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {registro.creado_por ?? "Tú"}
        </span>

        {/* Botones de descarga */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* 📊 Excel básico — siempre visible */}
          <DlIconButton title="Descargar Excel básico" color="#217346" loading={dlXls} onClick={handleXls}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#217346"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 2v6h6M14 2H8C6.9 2 6 2.9 6 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" stroke="#fff" strokeWidth="1.5" fill="none"/>
            </svg>
          </DlIconButton>
          
          {/* 🏭 Ecopetrol — solo si tiene datos Ecopetrol */}
          {registro.tiene_datos_ecopetrol && (
            <DlIconButton title="Descargar formato Ecopetrol" color="#1B3A5C" loading={dlEco} onClick={handleEco}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#1B3A5C"/>
                <text x="4" y="16" fontSize="10" fontWeight="bold" fill="#fff">HSE</text>
              </svg>
            </DlIconButton>
          )}

          {/* 📄 PDF — siempre visible */}
          <DlIconButton title="Descargar PDF" color="#C04040" loading={dlPdf} onClick={handlePdf}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#C04040"/>
              <path d="M14 2H8C6.9 2 6 2.9 6 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#fff" opacity="0.15"/>
              <path d="M14 2v6h6" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <text x="6" y="17" fontSize="8" fontWeight="bold" fill="#fff">PDF</text>
            </svg>
          </DlIconButton>
        </div>
      </div>

      {/* Error message inline below the row */}
      {errorMsg && (
        <div style={{
          padding: "8px 32px 10px",
          borderBottom: isLast ? "none" : "1px solid rgba(27,58,92,0.05)",
          background: "rgba(224,82,82,0.04)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#C04040", lineHeight: 1.4 }}>
            {errorMsg}
          </span>
          <button
            onClick={() => setErrorMsg("")}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#A0B0BC" }}
          >✕</button>
        </div>
      )}
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function DashboardNav({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid rgba(27,58,92,0.08)",
      boxShadow: "0 1px 16px rgba(27,58,92,0.06)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
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

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {email && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(27,58,92,0.04)",
              border: "1px solid rgba(27,58,92,0.08)",
              borderRadius: 100, padding: "6px 14px 6px 8px",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#fff", fontWeight: 700,
                flexShrink: 0,
              }}>
                {email.charAt(0).toUpperCase()}
              </div>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13, fontWeight: 600, color: "#1B3A5C",
                maxWidth: 180, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{email}</span>
            </div>
          )}

          <button
            onClick={onLogout}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: "1.5px solid rgba(27,58,92,0.15)",
              background: hovered ? "rgba(224,82,82,0.06)" : "#fff",
              borderColor: hovered ? "rgba(224,82,82,0.3)" : "rgba(27,58,92,0.15)",
              color: hovered ? "#C04040" : "#5A7080",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>→</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const [email,               setEmail]              = useState("");
  const [credits,        setCredits]       = useState<Credits | null>(null);
  const [registros,      setRegistros]     = useState<RegistroAR[]>([]);
  const [rol,            setRol]           = useState<"admin" | "usuario" | null>(null);
  const [loadingCredits, setLoadingCredits]= useState(true);
  const [loadingHistory, setLoadingHistory]= useState(true);

  // ── Route protection ──
  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    setEmail(decodeEmail(token));
  }, [router]);

  // ── Fetch credits ──
  const fetchCredits = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingCredits(true);
    try {
      const res = await fetch(`${API}/user/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      if (res.ok) setCredits(await res.json());
    } catch {
      console.error("Error fetching credits");
    } finally {
      setLoadingCredits(false);
    }
  }, []);

  // ── Fetch history ──
  const fetchHistory = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/registro_ar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Sort newest first; derive tiene_datos_ecopetrol from presence of "lugar" in datos_formulario
        const sorted = Array.isArray(data)
          ? [...data]
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map(r => ({
                ...r,
                tiene_datos_ecopetrol: Boolean(r.datos_formulario?.lugar),
              }))
          : [];
        setRegistros(sorted);
      }
    } catch {
      console.error("Error fetching history");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchCredits();
    fetchHistory();
    // Fetch role to conditionally show admin links
    fetch(`${API}/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRol(d.rol === "usuario" ? "usuario" : "admin"); })
      .catch(() => {});
  }, [fetchCredits, fetchHistory]);

  // ── Logout ──
  const handleLogout = () => {
    localStorage.removeItem("generar_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  // ── Navigate to generate ──
  const handleGenerate = () => {
    router.push("/generate");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <DashboardNav email={email} onLogout={handleLogout} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Page title */}
        <div style={{
          marginBottom: 32,
          animation: "fadeUp 0.5s ease both",
        }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 400, color: "#1B3A5C",
            letterSpacing: "-0.02em", marginBottom: 6,
          }}>
            Panel de control
          </h1>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 15, color: "#7A8EA0",
          }}>
            Bienvenido a GenerAR — gestiona tus análisis de riesgos HSE
          </p>
        </div>

        {/* Credits card */}
        <div style={{ marginBottom: 28, animation: "fadeUp 0.5s ease 0.1s both" }}>
          <CreditsCard
            credits={credits}
            loading={loadingCredits}
            onGenerate={handleGenerate}
            isSubUser={rol === "usuario"}
          />
        </div>

        {/* History */}
        <div style={{ animation: "fadeUp 0.5s ease 0.2s both" }}>
          <HistoryTable registros={registros} loading={loadingHistory} />
        </div>

      </main>
    </>
  );
}

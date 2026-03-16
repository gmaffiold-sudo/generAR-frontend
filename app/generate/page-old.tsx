"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RiesgoItem {
  Fuente:       string;
  Detalle:      string;
  Peligro:      string;
  Consecuencia: string;
  Controles:    string;
  Responsable:  string;
}

interface ARResponse {
  message:            string;
  registro_id:        string;
  titulo_actividad:   string;
  creditos_usados:    number;
  creditos_restantes: number;
  fecha:              string;
  analisis:           RiesgoItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_token");
}

// ─── Excel export via SheetJS CDN ─────────────────────────────────────────────
async function downloadExcel(titulo: string, analisis: RiesgoItem[]) {
  // Dynamically load SheetJS from CDN
  await new Promise<void>((resolve, reject) => {
    if ((window as any).XLSX) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar SheetJS"));
    document.head.appendChild(script);
  });

  const XLSX = (window as any).XLSX;

  // Build worksheet data
  const headers = ["Fuente", "Detalle", "Peligro", "Consecuencia", "Controles", "Responsable"];
  const rows = analisis.map(r => [
    r.Fuente, r.Detalle, r.Peligro, r.Consecuencia, r.Controles, r.Responsable,
  ]);

  const wsData = [
    [`ANÁLISIS DE RIESGOS HSE — ${titulo.toUpperCase()}`],
    [`Generado por GenerAR (generar.co) — ${new Date().toLocaleDateString("es-CO")}`],
    [],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws["!cols"] = [
    { wch: 22 }, { wch: 40 }, { wch: 20 },
    { wch: 35 }, { wch: 40 }, { wch: 22 },
  ];

  // Merge title row
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Análisis de Riesgos");

  const fileName = `AR_${titulo.replace(/\s+/g, "_").slice(0, 40)}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function GenerateNav() {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <nav style={{
      background:   "#fff",
      borderBottom: "1px solid rgba(27,58,92,0.08)",
      boxShadow:    "0 1px 16px rgba(27,58,92,0.06)",
      position:     "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1000, margin: "0 auto",
        padding: "0 24px", height: 64,
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

        <button
          onClick={() => router.push("/dashboard")}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display:     "flex", alignItems: "center", gap: 7,
            padding:     "8px 18px", borderRadius: 8,
            border:      "1.5px solid rgba(27,58,92,0.15)",
            background:  hovered ? "rgba(27,58,92,0.04)" : "#fff",
            color:       "#1B3A5C",
            fontFamily:  "'Plus Jakarta Sans', sans-serif",
            fontSize:    13, fontWeight: 600,
            cursor:      "pointer", transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: 15 }}>←</span> Volver al dashboard
        </button>
      </div>
    </nav>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBadge({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: active ? 1 : 0.4, transition: "opacity 0.3s" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: active ? "linear-gradient(135deg, #1B3A5C, #2E86AB)" : "rgba(27,58,92,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: active ? "#fff" : "#7A8EA0",
        flexShrink: 0,
        boxShadow: active ? "0 2px 10px rgba(46,134,171,0.30)" : "none",
        transition: "all 0.3s",
      }}>{n}</div>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13, fontWeight: 600,
        color: active ? "#1B3A5C" : "#7A8EA0",
      }}>{label}</span>
    </div>
  );
}

// ─── Form Section ─────────────────────────────────────────────────────────────
function FormSection({
  onResult,
}: {
  onResult: (data: ARResponse, titulo: string) => void;
}) {
  const [titulo,   setTitulo]   = useState("");
  const [pasos,    setPasos]    = useState(["", "", ""]);
  const [equipo,   setEquipo]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const addPaso = () => setPasos(p => [...p, ""]);
  const removePaso = (i: number) => setPasos(p => p.filter((_, idx) => idx !== i));
  const updatePaso = (i: number, val: string) => {
    setPasos(p => { const n = [...p]; n[i] = val; return n; });
    if (errors[`paso_${i}`]) setErrors(e => { const n = { ...e }; delete n[`paso_${i}`]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!titulo.trim())        errs.titulo = "El título es obligatorio.";
    if (titulo.trim().length < 5) errs.titulo = "Mínimo 5 caracteres.";
    const pasosLimpios = pasos.filter(p => p.trim());
    if (pasosLimpios.length < 3) errs.pasos = "Ingresa al menos 3 pasos.";
    pasos.forEach((p, i) => { if (!p.trim()) errs[`paso_${i}`] = "Este paso está vacío."; });
    if (!equipo.trim())        errs.equipo = "El equipo es obligatorio.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      const token = getToken();
      const res = await fetch(`${API}/ar/generate`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo_actividad: titulo.trim(),
          pasos:            pasos.filter(p => p.trim()),
          equipo:           equipo.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onResult(data, titulo.trim());
      } else if (res.status === 401) {
        localStorage.removeItem("generar_token");
        window.location.href = "/login";
      } else {
        const msg = data?.detail || "Error al generar el análisis.";
        setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    } catch {
      setApiError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* API Error */}
      {apiError && (
        <div style={{
          background: "rgba(224,82,82,0.06)",
          border: "1.5px solid rgba(224,82,82,0.25)",
          borderRadius: 12, padding: "14px 18px", marginBottom: 28,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#C04040", lineHeight: 1.5 }}>{apiError}</p>
        </div>
      )}

      {/* Título */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle(!!errors.titulo)}>
          Título de la actividad <Required />
        </label>
        <input
          type="text"
          value={titulo}
          placeholder="Ej: Cambio de luminarias en altura, Excavación manual, Soldadura en espacio confinado"
          onChange={e => { setTitulo(e.target.value); if (errors.titulo) setErrors(er => ({ ...er, titulo: "" })); }}
          style={inputStyle(!!errors.titulo, false)}
          onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(46,134,171,0.12)"}
          onBlur={e  => e.target.style.boxShadow = "none"}
        />
        {errors.titulo && <FieldError msg={errors.titulo} />}
      </div>

      {/* Pasos */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={labelStyle(!!errors.pasos)}>
            Pasos de la actividad <Required />
            <span style={{ fontWeight: 400, color: "#7A8EA0", marginLeft: 6 }}>(mínimo 3)</span>
          </label>
        </div>

        {errors.pasos && <FieldError msg={errors.pasos} />}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pasos.map((paso, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 10,
                background: "linear-gradient(135deg, rgba(27,58,92,0.08), rgba(46,134,171,0.12))",
                border: "1px solid rgba(46,134,171,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#2E86AB",
              }}>{i + 1}</div>

              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={paso}
                  placeholder={`Describe el paso ${i + 1}...`}
                  onChange={e => updatePaso(i, e.target.value)}
                  style={inputStyle(!!errors[`paso_${i}`], false)}
                  onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(46,134,171,0.12)"}
                  onBlur={e  => e.target.style.boxShadow = "none"}
                />
                {errors[`paso_${i}`] && <FieldError msg={errors[`paso_${i}`]} />}
              </div>

              {pasos.length > 3 && (
                <button
                  type="button"
                  onClick={() => removePaso(i)}
                  style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0, marginTop: 6,
                    background: "rgba(224,82,82,0.07)",
                    border: "1px solid rgba(224,82,82,0.20)",
                    color: "#C04040", cursor: "pointer", fontSize: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,82,82,0.14)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,82,82,0.07)"; }}
                  aria-label="Eliminar paso"
                >×</button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPaso}
          style={{
            marginTop: 12, display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 8,
            border: "1.5px dashed rgba(46,134,171,0.35)",
            background: "rgba(46,134,171,0.04)",
            color: "#2E86AB",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(46,134,171,0.09)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(46,134,171,0.04)"; }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Agregar paso
        </button>
      </div>

      {/* Equipo */}
      <div style={{ marginBottom: 36 }}>
        <label style={labelStyle(!!errors.equipo)}>
          Equipo de trabajo <Required />
        </label>
        <input
          type="text"
          value={equipo}
          placeholder="Ej: Soldador, Supervisor HSE, Ayudante, Electricista certificado"
          onChange={e => { setEquipo(e.target.value); if (errors.equipo) setErrors(er => ({ ...er, equipo: "" })); }}
          style={inputStyle(!!errors.equipo, false)}
          onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(46,134,171,0.12)"}
          onBlur={e  => e.target.style.boxShadow = "none"}
        />
        {errors.equipo && <FieldError msg={errors.equipo} />}
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#7A8EA0", marginTop: 6 }}>
          Separa los roles con comas
        </p>
      </div>

      {/* Submit */}
      <SubmitButton loading={loading} />
    </form>
  );
}

// ─── Results Section ──────────────────────────────────────────────────────────
function ResultsSection({
  result, titulo, onReset,
}: {
  result:  ARResponse;
  titulo:  string;
  onReset: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [dlError,     setDlError]     = useState("");
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDlError("");
    try {
      await downloadExcel(titulo, result.analisis);
    } catch (err: any) {
      setDlError(err.message || "Error al generar el Excel.");
    } finally {
      setDownloading(false);
    }
  };

  const COLS = ["Fuente", "Detalle", "Peligro", "Consecuencia", "Controles", "Responsable"] as const;

  const peligroColor = (p: string) => {
    const t = p.toLowerCase();
    if (t.includes("eléctric"))  return { bg: "rgba(244,162,97,0.12)",  color: "#B8620A" };
    if (t.includes("mecánic"))   return { bg: "rgba(224,82,82,0.10)",   color: "#B83232" };
    if (t.includes("químic"))    return { bg: "rgba(155,89,182,0.10)",  color: "#7B4A8C" };
    if (t.includes("ergonóm"))   return { bg: "rgba(46,134,171,0.10)",  color: "#1B6A8C" };
    if (t.includes("locativ"))   return { bg: "rgba(39,174,96,0.10)",   color: "#1A7A44" };
    return                              { bg: "rgba(27,58,92,0.08)",    color: "#1B3A5C" };
  };

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>

      {/* Success banner */}
      <div style={{
        background:   "linear-gradient(135deg, rgba(39,174,96,0.08), rgba(46,134,171,0.06))",
        border:       "1.5px solid rgba(39,174,96,0.25)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 28,
        display:      "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#1B3A5C" }}>
              ¡Análisis generado exitosamente!
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#5A7080", marginTop: 2 }}>
              {result.analisis.length} riesgos identificados · {result.creditos_restantes} créditos restantes
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <ActionButton
            onClick={handleDownload}
            loading={downloading}
            primary
            icon="⬇"
          >
            {downloading ? "Generando..." : "Descargar Excel"}
          </ActionButton>
          <ActionButton onClick={onReset} loading={false} primary={false} icon="↺">
            Generar otro AR
          </ActionButton>
        </div>
      </div>

      {dlError && (
        <div style={{
          background: "rgba(224,82,82,0.06)", border: "1.5px solid rgba(224,82,82,0.25)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
        }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#C04040" }}>⚠️ {dlError}</p>
        </div>
      )}

      {/* Table */}
      <div ref={tableRef} style={{
        background: "#fff",
        borderRadius: 16,
        border: "1.5px solid rgba(27,58,92,0.08)",
        overflow: "hidden",
        boxShadow: "0 2px 20px rgba(27,58,92,0.06)",
      }}>
        <div style={{
          padding: "22px 28px",
          borderBottom: "1px solid rgba(27,58,92,0.07)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20, fontWeight: 400, color: "#1B3A5C", letterSpacing: "-0.02em",
            }}>Riesgos identificados</h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#7A8EA0", marginTop: 3 }}>
              {titulo}
            </p>
          </div>
          <span style={{
            background: "rgba(46,134,171,0.08)", border: "1px solid rgba(46,134,171,0.15)",
            borderRadius: 100, padding: "4px 14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#2E86AB",
          }}>{result.analisis.length} riesgos</span>
        </div>

        {/* Scrollable table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {COLS.map(col => (
                  <th key={col} style={{
                    padding: "12px 16px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 11, fontWeight: 700,
                    color: "#7A8EA0", letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textAlign: "left",
                    borderBottom: "1px solid rgba(27,58,92,0.07)",
                    whiteSpace: "nowrap",
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.analisis.map((r, i) => {
                const pc = peligroColor(r.Peligro);
                return (
                  <tr key={i} style={{
                    borderBottom: i < result.analisis.length - 1 ? "1px solid rgba(27,58,92,0.05)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(46,134,171,0.025)"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                  >
                    <td style={tdStyle}>{r.Fuente}</td>
                    <td style={{ ...tdStyle, maxWidth: 260 }}>{r.Detalle}</td>
                    <td style={tdStyle}>
                      <span style={{
                        background: pc.bg, color: pc.color,
                        borderRadius: 100, padding: "3px 10px",
                        fontSize: 12, fontWeight: 700,
                        whiteSpace: "nowrap",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>{r.Peligro}</span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 220 }}>{r.Consecuencia}</td>
                    <td style={{ ...tdStyle, maxWidth: 260 }}>{r.Controles}</td>
                    <td style={tdStyle}>{r.Responsable}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Shared style helpers ─────────────────────────────────────────────────────
const labelStyle = (error: boolean): React.CSSProperties => ({
  display:       "block",
  fontFamily:    "'Plus Jakarta Sans', sans-serif",
  fontSize:      13, fontWeight: 600,
  color:         error ? "#E05252" : "#1B3A5C",
  marginBottom:  7, letterSpacing: "0.01em",
});

const inputStyle = (error: boolean, _focused: boolean): React.CSSProperties => ({
  width:        "100%",
  padding:      "12px 14px",
  borderRadius: 10,
  border:       error ? "1.5px solid #E05252" : "1.5px solid rgba(27,58,92,0.15)",
  fontFamily:   "'Plus Jakarta Sans', sans-serif",
  fontSize:     15, color: "#1B3A5C",
  background:   "rgba(245,248,251,0.7)",
  outline:      "none",
  transition:   "all 0.2s ease",
  boxSizing:    "border-box" as const,
});

const tdStyle: React.CSSProperties = {
  padding:    "14px 16px",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize:   13, color: "#2A4A60",
  lineHeight: 1.55,
  verticalAlign: "top",
};

function Required() {
  return <span style={{ color: "#2E86AB", marginLeft: 3 }}>*</span>;
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 12, color: "#E05252", marginTop: 5,
      display: "flex", alignItems: "center", gap: 4,
    }}>⚠ {msg}</p>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:          "100%", padding: "15px",
        borderRadius:   11, border: "none",
        cursor:         loading ? "not-allowed" : "pointer",
        background:     loading ? "rgba(27,58,92,0.25)"
          : hovered ? "linear-gradient(135deg, #16304d, #2677a0)"
          : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
        color:          "#fff",
        fontFamily:     "'Plus Jakarta Sans', sans-serif",
        fontSize:       16, fontWeight: 800,
        letterSpacing:  "-0.01em",
        transition:     "all 0.22s ease",
        boxShadow:      !loading && hovered ? "0 8px 28px rgba(46,134,171,0.45)" : !loading ? "0 3px 14px rgba(46,134,171,0.30)" : "none",
        transform:      hovered && !loading ? "translateY(-1px)" : "translateY(0)",
        display:        "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: 18, height: 18,
            border: "2.5px solid rgba(255,255,255,0.35)",
            borderTopColor: "#fff", borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.7s linear infinite",
          }} />
          Generando análisis con IA...
        </>
      ) : (
        <><span style={{ fontSize: 18 }}>⚡</span> Generar Análisis de Riesgos</>
      )}
    </button>
  );
}

function ActionButton({
  onClick, loading, primary, icon, children,
}: {
  onClick:  () => void;
  loading:  boolean;
  primary:  boolean;
  icon:     string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:       "flex", alignItems: "center", gap: 7,
        padding:       "10px 18px", borderRadius: 9,
        border:        primary ? "none" : "1.5px solid rgba(27,58,92,0.18)",
        cursor:        loading ? "not-allowed" : "pointer",
        background:    primary
          ? loading ? "rgba(27,58,92,0.25)" : hovered ? "linear-gradient(135deg, #16304d, #2677a0)" : "linear-gradient(135deg, #1B3A5C, #2E86AB)"
          : hovered ? "rgba(27,58,92,0.05)" : "#fff",
        color:         primary ? "#fff" : "#1B3A5C",
        fontFamily:    "'Plus Jakarta Sans', sans-serif",
        fontSize:      13, fontWeight: 700,
        transition:    "all 0.2s ease",
        boxShadow:     primary && hovered && !loading ? "0 4px 16px rgba(46,134,171,0.35)" : "none",
        transform:     hovered && !loading ? "translateY(-1px)" : "translateY(0)",
        whiteSpace:    "nowrap",
      }}
    >
      {loading
        ? <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
        : <span>{icon}</span>
      }
      {children}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GeneratePage() {
  const router  = useRouter();
  const [result, setResult] = useState<ARResponse | null>(null);
  const [titulo, setTitulo] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  // Route protection
  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  const handleResult = useCallback((data: ARResponse, t: string) => {
    setResult(data);
    setTitulo(t);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, []);

  const handleReset = () => {
    setResult(null);
    setTitulo("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <GenerateNav />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <StepBadge n={1} label="Describe la actividad"    active={!result} />
            <div style={{ width: 32, height: 1, background: "rgba(27,58,92,0.15)" }} />
            <StepBadge n={2} label="Genera con IA"            active={!result} />
            <div style={{ width: 32, height: 1, background: "rgba(27,58,92,0.15)" }} />
            <StepBadge n={3} label="Descarga tu AR en Excel"  active={!!result} />
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: 400, color: "#1B3A5C",
            letterSpacing: "-0.02em", marginBottom: 6,
          }}>
            {result ? "Tu análisis de riesgos está listo" : "Nuevo análisis de riesgos HSE"}
          </h1>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#7A8EA0" }}>
            {result
              ? "Revisa los riesgos identificados por IA y descarga el archivo Excel."
              : "Completa los datos de la actividad y la IA generará un análisis completo en segundos."}
          </p>
        </div>

        {/* Form card */}
        {!result && (
          <div style={{
            background:   "#fff",
            borderRadius: 18,
            border:       "1.5px solid rgba(27,58,92,0.08)",
            boxShadow:    "0 4px 24px rgba(27,58,92,0.07)",
            padding:      "36px 40px",
            animation:    "fadeUp 0.5s ease 0.1s both",
          }}>
            <FormSection onResult={handleResult} />
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef}>
            <ResultsSection result={result} titulo={titulo} onReset={handleReset} />
          </div>
        )}
      </main>
    </>
  );
}

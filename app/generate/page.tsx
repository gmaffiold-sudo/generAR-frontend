"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch, useAuthGuard, clearSession } from "@/lib/api";

// ─── Matriz RAM ───────────────────────────────────────────────────────────────
const MATRIZ_RAM: Record<number, Record<string, string>> = {
  5: { A: "M", B: "M", C: "H", D: "H", E: "VH" },
  4: { A: "L", B: "M", C: "M", D: "H", E: "H"  },
  3: { A: "N", B: "L", C: "M", D: "M", E: "H"  },
  2: { A: "N", B: "N", C: "L", D: "M", E: "M"  },
  1: { A: "N", B: "N", C: "N", D: "L", E: "L"  },
  0: { A: "N", B: "N", C: "N", D: "N", E: "N"  },
};
const PROB_ORDEN = ["A", "B", "C", "D", "E"];
const RAM_COLOR: Record<string, { bg: string; color: string; label: string }> = {
  N:  { bg: "#E8F5E9", color: "#2E7D32", label: "Negligible" },
  L:  { bg: "#E3F2FD", color: "#1565C0", label: "Low"        },
  M:  { bg: "#FFF9C4", color: "#F57F17", label: "Medium"     },
  H:  { bg: "#FFE0B2", color: "#E65100", label: "High"       },
  VH: { bg: "#FFCDD2", color: "#C62828", label: "Very High"  },
};
function calcularRiesgo(g: number, p: string) { return MATRIZ_RAM[g]?.[p] ?? "N"; }
function bajarProbabilidad(p: string) {
  const i = PROB_ORDEN.indexOf(p);
  return PROB_ORDEN[Math.max(0, i - 1)];
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface RiesgoItem {
  Fuente: string; Detalle: string; Peligro: string;
  Consecuencia: string; Controles: string; Responsable: string;
}
interface ARResponse {
  message: string; registro_id: string; titulo_actividad: string;
  creditos_usados: number; creditos_restantes: number; fecha: string;
  analisis: RiesgoItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }
function addDays(d: string, n: number) {
  const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split("T")[0];
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res((r.result as string).split(",")[1]);
    r.onerror = () => rej(new Error("Error leyendo archivo"));
    r.readAsDataURL(file);
  });
}
function triggerDownload(b64: string, filename: string, mime: string) {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const blob  = new Blob([bytes], { type: mime });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function FieldLabel({ text, required, hasError }: { text: string; required?: boolean; hasError?: boolean }) {
  return (
    <label style={{
      display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
      marginBottom: 5, color: hasError ? "#C62828" : "#1B3A5C",
    }}>
      {text}{required && <span style={{ color: "#2E86AB", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldWrap({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel text={label} required={required} hasError={!!error} />
      {children}
      {hint  && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "#7A8EA0", marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "#C62828", marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, hasError, type = "text", disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  hasError?: boolean; type?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", padding: "10px 12px", borderRadius: 9, outline: "none",
        border: hasError ? "1.5px solid #C62828" : focused ? "1.5px solid #2E86AB" : "1.5px solid rgba(27,58,92,0.15)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        // FIX: fontSize 16 para evitar zoom automático en iOS
        fontSize: 16, color: "#1B3A5C",
        background: disabled ? "rgba(27,58,92,0.03)" : focused ? "#fff" : "rgba(245,248,251,0.8)",
        boxShadow: focused ? "0 0 0 3px rgba(46,134,171,0.10)" : "none",
        transition: "all 0.18s ease", boxSizing: "border-box",
      }}
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", padding: "10px 32px 10px 12px", borderRadius: 9, outline: "none",
        border: focused ? "1.5px solid #2E86AB" : "1.5px solid rgba(27,58,92,0.15)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        // FIX: fontSize 16 para evitar zoom automático en iOS
        fontSize: 16, color: "#1B3A5C",
        background: "#fff", boxShadow: focused ? "0 0 0 3px rgba(46,134,171,0.10)" : "none",
        transition: "all 0.18s ease", cursor: "pointer",
        appearance: "none", boxSizing: "border-box",
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function RadioGroup({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {options.map(opt => (
        <label key={opt.value} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
          borderRadius: 9, cursor: "pointer",
          border: value === opt.value ? "1.5px solid #2E86AB" : "1.5px solid rgba(27,58,92,0.15)",
          background: value === opt.value ? "rgba(46,134,171,0.07)" : "#fff",
          transition: "all 0.18s ease",
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
            border: value === opt.value ? "4px solid #2E86AB" : "2px solid rgba(27,58,92,0.25)",
            transition: "all 0.18s ease",
          }} />
          <input type="radio" value={opt.value} checked={value === opt.value}
            onChange={() => onChange(opt.value)} style={{ display: "none" }} />
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
            fontWeight: value === opt.value ? 700 : 500,
            color: value === opt.value ? "#1B3A5C" : "#5A7080",
          }}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

// FIX: Grid2 con auto-fit para colapso en móvil
function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 18px" }}>{children}</div>;
}
// FIX: Grid3 con auto-fit para colapso en móvil
function Grid3({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0 18px" }}>{children}</div>;
}

function RamBadge({ code, label, fullCode }: { code: string; label: string; fullCode?: string }) {
  const c = RAM_COLOR[code] ?? { bg: "#F5F5F5", color: "#666", label: code };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flex: 1 }}>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 700,
        color: "#7A8EA0", letterSpacing: "0.08em", textTransform: "uppercase",
      }}>{label}</span>
      <div style={{
        width: "100%", padding: "12px 8px", borderRadius: 10,
        background: c.bg, border: `2px solid ${c.color}30`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: fullCode ? 22 : 32, fontWeight: 400, color: c.color, lineHeight: 1 }}>
          {fullCode ?? code}
        </span>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 700, color: c.color, opacity: 0.8 }}>{c.label}</span>
      </div>
    </div>
  );
}

function ErrorBanner({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      background: "rgba(198,40,40,0.06)", border: "1.5px solid rgba(198,40,40,0.25)",
      borderRadius: 10, padding: "12px 16px", marginBottom: 14,
      display: "flex", alignItems: "flex-start", gap: 8,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#C62828", flex: 1, lineHeight: 1.5 }}>{msg}</p>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#A0B0BC", cursor: "pointer", fontSize: 14 }}>✕</button>
    </div>
  );
}

function DlButton({ icon, label, color, onClick, loading, active, fullWidth }: {
  icon: string; label: string; color: string; onClick: () => void;
  loading: boolean; active?: boolean; fullWidth?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick} disabled={loading}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        // FIX: padding vertical mínimo 12px
        padding: "12px 18px", borderRadius: 10,
        border: `1.5px solid ${active ? color : "rgba(27,58,92,0.15)"}`,
        cursor: loading ? "not-allowed" : "pointer",
        background: active ? `${color}15` : h ? `${color}10` : "#fff",
        color: active || h ? color : "#1B3A5C",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700,
        transition: "all 0.18s ease", whiteSpace: "nowrap",
        width: fullWidth ? "100%" : undefined,
        boxShadow: h && !loading ? "0 2px 12px rgba(27,58,92,0.12)" : "none",
      }}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14,
          border: "2px solid rgba(27,58,92,0.2)", borderTopColor: color,
          borderRadius: "50%", display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      ) : (
        <span style={{ fontSize: 14 }}>{icon}</span>
      )}
      {label}
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Nav({ onBack }: { onBack: () => void }) {
  const [h, setH] = useState(false);
  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid rgba(27,58,92,0.08)",
      boxShadow: "0 1px 16px rgba(27,58,92,0.06)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "0 24px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
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
          onClick={onBack}
          onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            // FIX: padding vertical mínimo 12px
            padding: "12px 18px", borderRadius: 8,
            cursor: "pointer", border: "1.5px solid rgba(27,58,92,0.15)",
            background: h ? "rgba(27,58,92,0.04)" : "#fff", color: "#1B3A5C",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s ease",
          }}
        >
          ← Dashboard
        </button>
      </div>
    </nav>
  );
}

// ─── PASO 1: Formulario mínimo ────────────────────────────────────────────────
function Step1({ onResult }: { onResult: (r: ARResponse, equipo: string) => void }) {
  const [titulo,   setTitulo]   = useState("");
  const [equipo,   setEquipo]   = useState("");
  const [pasos,    setPasos]    = useState(["", "", ""]);
  const [pdfFile,  setPdfFile]  = useState<File | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [hovBtn,   setHovBtn]   = useState(false);

  const addPaso    = () => setPasos(p => [...p, ""]);
  const removePaso = (i: number) => setPasos(p => p.filter((_, idx) => idx !== i));
  const setPaso    = (i: number, v: string) => {
    setPasos(p => { const n = [...p]; n[i] = v; return n; });
    if (errors[`p${i}`]) setErrors(e => { const n = { ...e }; delete n[`p${i}`]; return n; });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!titulo.trim() || titulo.trim().length < 5) errs.titulo = "Mínimo 5 caracteres.";
    if (!equipo.trim()) errs.equipo = "Campo obligatorio.";
    const validPasos = pasos.filter(p => p.trim());
    if (!pdfFile && validPasos.length < 3) errs.pasos = "Adjunta un PDF o ingresa al menos 3 pasos.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setApiError("");
    try {
      let pdfBase64: string | undefined;
      if (pdfFile) pdfBase64 = await fileToBase64(pdfFile);
      const validPasos = pasos.filter(p => p.trim());
      const body: Record<string, unknown> = {
        titulo_actividad: titulo.trim(),
        equipo: equipo.trim(),
      };
      if (validPasos.length >= 1) body.pasos = validPasos;
      if (pdfBase64)              body.pdf_procedimiento = pdfBase64;

      const res  = await apiFetch(`${API}/ar/generate`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onResult(data, equipo.trim());
      } else {
        setApiError(data?.detail || "Error al generar el análisis.");
      }
    } catch { setApiError("No se pudo conectar con el servidor."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ animation: "fadeUp 0.5s ease both" }}>
      {apiError && <ErrorBanner msg={apiError} onClose={() => setApiError("")} />}

      {/* Nombre y Equipo */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid rgba(27,58,92,0.08)",
        boxShadow: "0 2px 16px rgba(27,58,92,0.05)",
        padding: "28px 28px", marginBottom: 18,
      }}>
        <FieldWrap label="Nombre de la actividad" required error={errors.titulo}>
          <TextInput
            value={titulo} onChange={v => { setTitulo(v); if (errors.titulo) setErrors(e => ({ ...e, titulo: "" })); }}
            placeholder="Ej: Cambio de luminarias en altura, Soldadura en espacio confinado..."
            hasError={!!errors.titulo}
          />
        </FieldWrap>
        <FieldWrap label="Equipo de trabajo" required error={errors.equipo} hint="Separa los roles con comas">
          <TextInput
            value={equipo} onChange={v => { setEquipo(v); if (errors.equipo) setErrors(e => ({ ...e, equipo: "" })); }}
            placeholder="Ej: Supervisor HSE, Técnico, Operario, Inspector"
            hasError={!!errors.equipo}
          />
        </FieldWrap>
      </div>

      {/* PDF + Pasos */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid rgba(27,58,92,0.08)",
        boxShadow: "0 2px 16px rgba(27,58,92,0.05)",
        padding: "28px 28px", marginBottom: 24,
      }}>
        {/* PDF upload */}
        <FieldWrap label="PDF de procedimiento" hint="Opcional. Con PDF, los pasos manuales son opcionales.">
          <div
            style={{
              border: "2px dashed rgba(46,134,171,0.30)", borderRadius: 10,
              padding: "14px 18px", background: "rgba(46,134,171,0.03)",
              // FIX: flexWrap para que el contenido se reorganice en móvil
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f?.type === "application/pdf") setPdfFile(f);
            }}
          >
            <span style={{ fontSize: 24 }}>📄</span>
            <div style={{ flex: 1 }}>
              {pdfFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#1B3A5C" }}>{pdfFile.name}</p>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "#7A8EA0" }}>{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {/* FIX: padding vertical mínimo 8px para tap target */}
                  <button type="button" onClick={() => setPdfFile(null)} style={{
                    background: "rgba(198,40,40,0.08)", border: "none", borderRadius: 6,
                    padding: "8px 12px", color: "#C62828", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>Quitar</button>
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#2E86AB" }}>Arrastra un PDF o haz clic</p>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "#7A8EA0" }}>Se extraerá el texto del procedimiento</p>
                </>
              )}
            </div>
            {!pdfFile && (
              <label style={{ cursor: "pointer" }}>
                <input type="file" accept=".pdf" style={{ display: "none" }}
                  onChange={e => { if (e.target.files?.[0]) setPdfFile(e.target.files[0]); }} />
                <span style={{
                  padding: "8px 14px", borderRadius: 8,
                  background: "rgba(46,134,171,0.10)", border: "1px solid rgba(46,134,171,0.20)",
                  color: "#2E86AB", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap",
                }}>Seleccionar</span>
              </label>
            )}
          </div>
        </FieldWrap>

        {/* Pasos dinámicos */}
        <div>
          <label style={{
            display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 11, fontWeight: 700, color: errors.pasos ? "#C62828" : "#1B3A5C",
            letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8,
          }}>
            Pasos de la actividad
            {!pdfFile && <span style={{ color: "#2E86AB", marginLeft: 3 }}>*</span>}
            {pdfFile  && <span style={{ color: "#7A8EA0", fontWeight: 400, marginLeft: 6, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(opcional con PDF)</span>}
          </label>
          {errors.pasos && <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "#C62828", marginBottom: 8 }}>⚠ {errors.pasos}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pasos.map((paso, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 8,
                  background: "linear-gradient(135deg,rgba(27,58,92,0.08),rgba(46,134,171,0.12))",
                  border: "1px solid rgba(46,134,171,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#2E86AB",
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <TextInput value={paso} onChange={v => setPaso(i, v)} placeholder={`Paso ${i + 1}...`} />
                </div>
                {pasos.length > 3 && (
                  // FIX: 40×40 para tap target adecuado en móvil
                  <button type="button" onClick={() => removePaso(i)} style={{
                    width: 40, height: 40, borderRadius: 7, flexShrink: 0, marginTop: 2,
                    background: "rgba(198,40,40,0.07)", border: "1px solid rgba(198,40,40,0.18)",
                    color: "#C62828", cursor: "pointer", fontSize: 15,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
                )}
              </div>
            ))}
          </div>
          {/* FIX: padding vertical mínimo 10px */}
          <button type="button" onClick={addPaso} style={{
            marginTop: 10, display: "flex", alignItems: "center", gap: 6,
            padding: "10px 14px", borderRadius: 8,
            border: "1.5px dashed rgba(46,134,171,0.35)",
            background: "rgba(46,134,171,0.04)", color: "#2E86AB",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            <span style={{ fontSize: 15 }}>+</span> Agregar paso
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        onMouseEnter={() => setHovBtn(true)} onMouseLeave={() => setHovBtn(false)}
        style={{
          width: "100%", padding: "15px", borderRadius: 12, border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          background: loading ? "rgba(27,58,92,0.25)"
            : hovBtn ? "linear-gradient(135deg,#16304d,#2677a0)"
            : "linear-gradient(135deg,#1B3A5C,#2E86AB)",
          color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 16, fontWeight: 800,
          boxShadow: !loading && hovBtn ? "0 8px 28px rgba(46,134,171,0.45)" : !loading ? "0 3px 14px rgba(46,134,171,0.30)" : "none",
          transform: hovBtn && !loading ? "translateY(-1px)" : "translateY(0)",
          transition: "all 0.22s ease",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 18, height: 18,
              border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff",
              borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite",
            }} />
            Generando análisis con IA...
          </>
        ) : (
          <><span style={{ fontSize: 18 }}>⚡</span> Generar Análisis de Riesgos</>
        )}
      </button>
    </form>
  );
}

// ─── PASO 2: Resultados + descargas ──────────────────────────────────────────
function Step2({ result, equipoInicial, onReset }: {
  result: ARResponse; equipoInicial: string; onReset: () => void;
}) {
  const COLS = ["Fuente", "Detalle", "Peligro", "Consecuencia", "Controles", "Responsable"] as const;

  const [showEco,    setShowEco]    = useState(false);
  const [ecoLoading, setEcoLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ecoError,   setEcoError]   = useState("");
  const [pdfError,   setPdfError]   = useState("");

  // Ecopetrol form state
  const [tipoAnalisis, setTipoAnalisis] = useState("Análisis de riesgos de un trabajo");
  const [fecha,        setFecha]        = useState(today());
  const [inicio,       setInicio]       = useState(today());
  const [fin,          setFin]          = useState(addDays(today(), 1));
  const [lugar,        setLugar]        = useState("");
  const [area,         setArea]         = useState("");
  const [empresa,      setEmpresa]      = useState("");
  const [ot,           setOt]           = useState("");
  const [proc,         setProc]         = useState("");
  const [contacto,     setContacto]     = useState("");
  const [gravedad,     setGravedad]     = useState(3);
  const [probabilidad, setProbabilidad] = useState("C");
  const [categoria,    setCategoria]    = useState("P");
  const [spEvento,     setSpEvento]     = useState("NO");
  const [medidasOps,   setMedidasOps]   = useState("");
  const [equipo,       setEquipo]       = useState(equipoInicial);
  const [ecoFieldErrs, setEcoFieldErrs] = useState<Record<string, string>>({});

  const nivelInherente   = calcularRiesgo(gravedad, probabilidad);
  const gravedadResidual = Math.max(0, gravedad - 1);
  const nivelResidual    = calcularRiesgo(gravedadResidual, probabilidad);
  const codigoInherente  = `${categoria}${gravedad}${probabilidad}-${nivelInherente}`;
  const codigoResidual   = `${categoria}${gravedadResidual}${probabilidad}-${nivelResidual}`;

  useEffect(() => {
    if (daysBetween(inicio, fin) > 30) setFin(addDays(inicio, 30));
    if (daysBetween(inicio, fin) < 0)  setFin(addDays(inicio, 1));
  }, [inicio]);

  // SheetJS — Excel básico sin backend
  const downloadBasicExcel = useCallback(async () => {
    if (!(window as any).XLSX) {
      await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src     = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload  = () => res();
        s.onerror = () => rej(new Error("No se pudo cargar SheetJS"));
        document.head.appendChild(s);
      });
    }
    const XLSX = (window as any).XLSX;
    const headers = ["Fuente", "Detalle", "Peligro", "Consecuencia", "Controles", "Responsable"];
    const rows = result.analisis.map(r => [r.Fuente, r.Detalle, r.Peligro, r.Consecuencia, r.Controles, r.Responsable]);
    const ws = XLSX.utils.aoa_to_sheet([
      [`ANÁLISIS DE RIESGOS HSE — ${result.titulo_actividad.toUpperCase()}`],
      [`GenerAR (generar.co) — ${new Date().toLocaleDateString("es-CO")}`],
      [],
      headers,
      ...rows,
    ]);
    ws["!cols"]   = [{ wch: 22 }, { wch: 40 }, { wch: 20 }, { wch: 35 }, { wch: 40 }, { wch: 22 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análisis de Riesgos");
    XLSX.writeFile(wb, `AR_${result.titulo_actividad.replace(/\s+/g, "_").slice(0, 40)}.xlsx`);
  }, [result]);

  const validateEco = () => {
    const errs: Record<string, string> = {};
    if (!lugar.trim())   errs.lugar   = "Obligatorio";
    if (!area.trim())    errs.area    = "Obligatorio";
    if (!empresa.trim()) errs.empresa = "Obligatorio";
    if (daysBetween(inicio, fin) > 30) errs.fin = "Máximo 30 días.";
    if (daysBetween(inicio, fin) < 0)  errs.fin = "La fecha fin no puede ser anterior al inicio.";
    return errs;
  };

  const downloadEcopetrol = async () => {
    const errs = validateEco();
    if (Object.keys(errs).length > 0) { setEcoFieldErrs(errs); return; }
    setEcoLoading(true); setEcoError("");
    try {
      const body = {
        registro_id: result.registro_id, analisis: result.analisis,
        tipo_analisis: tipoAnalisis, fecha, inicio, fin,
        lugar: lugar.trim(), area: area.trim(), empresa: empresa.trim(),
        ot: ot.trim() || undefined, proc: proc.trim() || undefined,
        contacto: contacto.trim() || undefined, sp_evento: spEvento,
        medidas_ops: medidasOps.trim() || undefined,
        equipo: equipo.trim(), gravedad, probabilidad, categoria,
      };

      const res = await apiFetch(`${API}/ar/export/ecopetrol`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error al generar el Excel.");

      // Guardar datos Ecopetrol en el registro (silencioso si falla)
      apiFetch(`${API}/ar/registro/${result.registro_id}/datos-ecopetrol`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }).catch(() => {});

      triggerDownload(
        data.excel_base64,
        `AR_Ecopetrol_${result.titulo_actividad.replace(/\s+/g, "_").slice(0, 40)}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (e: any) { setEcoError(e.message); }
    finally { setEcoLoading(false); }
  };

  const downloadPDF = async () => {
    setPdfLoading(true); setPdfError("");
    try {
      const res = await apiFetch(`${API}/ar/export/pdf`, {
        method: "POST",
        body: JSON.stringify({
          registro_id: result.registro_id,
          analisis: result.analisis,
          titulo_actividad: result.titulo_actividad,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error al generar el PDF.");
      triggerDownload(
        data.pdf_base64,
        `AR_${result.titulo_actividad.replace(/\s+/g, "_").slice(0, 40)}.pdf`,
        "application/pdf",
      );
    } catch (e: any) { setPdfError(e.message); }
    finally { setPdfLoading(false); }
  };

  const peligroColor = (p: string) => {
    const t = p.toLowerCase();
    if (t.includes("eléctric"))  return { bg: "rgba(244,162,97,0.12)",  color: "#B8620A" };
    if (t.includes("mecánic"))   return { bg: "rgba(224,82,82,0.10)",   color: "#B83232" };
    if (t.includes("químic"))    return { bg: "rgba(155,89,182,0.10)",  color: "#7B4A8C" };
    if (t.includes("ergonóm"))   return { bg: "rgba(46,134,171,0.10)",  color: "#1B6A8C" };
    if (t.includes("locativ"))   return { bg: "rgba(39,174,96,0.10)",   color: "#1A7A44" };
    if (t.includes("alturas"))   return { bg: "rgba(255,152,0,0.12)",   color: "#E65100" };
    if (t.includes("confinado")) return { bg: "rgba(103,58,183,0.10)",  color: "#4527A0" };
    return { bg: "rgba(27,58,92,0.07)", color: "#1B3A5C" };
  };

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>

      {/* Banner éxito */}
      <div style={{
        background: "linear-gradient(160deg, #1B3A5C 0%, #1e4d74 55%, #2E86AB 100%)",
        borderRadius: 16, padding: "24px 28px", marginBottom: 20,
        boxShadow: "0 16px 48px rgba(27,58,92,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 800, color: "#fff" }}>
                ¡Análisis generado! — {result.analisis.length} riesgos identificados
              </p>
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.60)" }}>
              {result.creditos_restantes} créditos restantes · {result.titulo_actividad}
            </p>
          </div>
          <button onClick={onReset} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9,
            background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)",
            color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>↺ Nuevo AR</button>
        </div>
      </div>

      {/* Botones de descarga */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <DlButton icon="📊" label="Excel básico"       color="#217346" onClick={downloadBasicExcel} loading={false} />
        <DlButton icon="🏭" label="Formato Ecopetrol"  color="#1B3A5C" onClick={() => { setShowEco(s => !s); setEcoError(""); }} loading={false} active={showEco} />
        <DlButton icon="📄" label="Descargar PDF"      color="#C04040" onClick={downloadPDF}         loading={pdfLoading} />
      </div>

      {pdfError && <ErrorBanner msg={pdfError} onClose={() => setPdfError("")} />}

      {/* Panel Ecopetrol expandible */}
      {showEco && (
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1.5px solid rgba(27,58,92,0.10)",
          boxShadow: "0 4px 24px rgba(27,58,92,0.08)",
          marginBottom: 20, overflow: "hidden",
          animation: "fadeUp 0.3s ease both",
        }}>
          <div style={{
            padding: "18px 26px", borderBottom: "1px solid rgba(27,58,92,0.07)",
            background: "linear-gradient(135deg,rgba(27,58,92,0.03),rgba(46,134,171,0.04))",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🏭</span>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, fontWeight: 400, color: "#1B3A5C" }}>
              Datos para formato Ecopetrol HSE
            </h3>
          </div>
          <div style={{ padding: "22px 26px" }}>
            {ecoError && <ErrorBanner msg={ecoError} onClose={() => setEcoError("")} />}

            {/* Tipo análisis */}
            <FieldWrap label="Tipo de análisis" required>
              <RadioGroup value={tipoAnalisis} onChange={setTipoAnalisis} options={[
                { value: "Análisis de riesgos de un trabajo", label: "Análisis de un trabajo" },
                { value: "Análisis de riesgos integral",      label: "Análisis integral"       },
              ]} />
            </FieldWrap>

            <Grid3>
              <FieldWrap label="Fecha diligenciamiento" required>
                <TextInput type="date" value={fecha} onChange={setFecha} />
              </FieldWrap>
              <FieldWrap label="Fecha inicio" required>
                <TextInput type="date" value={inicio} onChange={v => { setInicio(v); setEcoFieldErrs(e => ({ ...e, fin: "" })); }} />
              </FieldWrap>
              <FieldWrap label="Fecha fin" required error={ecoFieldErrs.fin} hint={`Máx. ${addDays(inicio, 30)}`}>
                <TextInput type="date" value={fin} onChange={v => { setFin(v); setEcoFieldErrs(e => ({ ...e, fin: "" })); }} hasError={!!ecoFieldErrs.fin} />
              </FieldWrap>
            </Grid3>

            <Grid2>
              <FieldWrap label="Planta / Lugar" required error={ecoFieldErrs.lugar}>
                <TextInput value={lugar} onChange={v => { setLugar(v); setEcoFieldErrs(e => ({ ...e, lugar: "" })); }}
                  placeholder="Ej: Planta Barrancabermeja" hasError={!!ecoFieldErrs.lugar} />
              </FieldWrap>
              <FieldWrap label="Área" required error={ecoFieldErrs.area}>
                <TextInput value={area} onChange={v => { setArea(v); setEcoFieldErrs(e => ({ ...e, area: "" })); }}
                  placeholder="Ej: Área de producción" hasError={!!ecoFieldErrs.area} />
              </FieldWrap>
            </Grid2>

            <Grid2>
              <FieldWrap label="Empresa ejecutora" required error={ecoFieldErrs.empresa}>
                <TextInput value={empresa} onChange={v => { setEmpresa(v); setEcoFieldErrs(e => ({ ...e, empresa: "" })); }}
                  placeholder="Ej: Ecopetrol S.A." hasError={!!ecoFieldErrs.empresa} />
              </FieldWrap>
              <FieldWrap label="Orden de Trabajo (OT)">
                <TextInput value={ot} onChange={setOt} placeholder="Ej: OT-2024-0451" />
              </FieldWrap>
            </Grid2>

            <Grid2>
              <FieldWrap label="Procedimiento">
                <TextInput value={proc} onChange={setProc} placeholder="Ej: PRO-HSE-001" />
              </FieldWrap>
              <FieldWrap label="Contactos de emergencia">
                <TextInput value={contacto} onChange={setContacto} placeholder="Ej: 123, Bomberos 119" />
              </FieldWrap>
            </Grid2>

            {/* Calculadora RAM */}
            <div style={{
              background: "linear-gradient(135deg,rgba(27,58,92,0.03),rgba(46,134,171,0.05))",
              border: "1px solid rgba(46,134,171,0.12)", borderRadius: 12,
              padding: "18px 20px", marginBottom: 16,
            }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700,
                color: "#7A8EA0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
              }}>Calculadora RAM</p>
              <Grid2>
                <FieldWrap label="Categoría">
                  <SelectInput value={categoria} onChange={setCategoria} options={[
                    { value: "P", label: "P — Personas"  },
                    { value: "E", label: "E — Económica" },
                    { value: "A", label: "A — Ambiental" },
                    { value: "C", label: "C — Cliente"   },
                    { value: "I", label: "I — Imagen"    },
                  ]} />
                </FieldWrap>
                <FieldWrap label="Gravedad (0–5)">
                  <SelectInput value={String(gravedad)} onChange={v => setGravedad(Number(v))}
                    options={[0,1,2,3,4,5].map(n => ({
                      value: String(n),
                      label: `${n} — ${["Sin daño","Leve","Moderado","Serio","Mayor","Catastrófico"][n]}`,
                    }))} />
                </FieldWrap>
                <FieldWrap label="Probabilidad (A–E)">
                  <SelectInput value={probabilidad} onChange={setProbabilidad} options={[
                    { value: "A", label: "A — Casi imposible" },
                    { value: "B", label: "B — Improbable"     },
                    { value: "C", label: "C — Posible"        },
                    { value: "D", label: "D — Probable"       },
                    { value: "E", label: "E — Casi seguro"    },
                  ]} />
                </FieldWrap>
              </Grid2>
              {/* FIX: flexWrap y justifyContent para colapso en móvil */}
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <RamBadge code={nivelInherente} label="Riesgo Inherente" fullCode={codigoInherente} />
                <span style={{ color: "#7A8EA0", fontSize: 20, paddingBottom: 18 }}>→</span>
                <RamBadge code={nivelResidual}  label="Riesgo Residual"  fullCode={codigoResidual}  />
              </div>
            </div>

            <Grid2>
              <FieldWrap label="Evento seguridad de procesos" required>
                <RadioGroup value={spEvento} onChange={setSpEvento}
                  options={[{ value: "SI", label: "SÍ" }, { value: "NO", label: "NO" }]} />
              </FieldWrap>
              <FieldWrap label="Equipo responsable" required>
                <TextInput value={equipo} onChange={setEquipo} placeholder="Supervisor HSE, Técnico..." />
              </FieldWrap>
            </Grid2>

            {spEvento === "SI" && (
              <FieldWrap label="Medidas transitorias">
                <textarea
                  value={medidasOps} onChange={e => setMedidasOps(e.target.value)}
                  placeholder="Describe las medidas transitorias..." rows={3}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 9, outline: "none",
                    border: "1.5px solid rgba(27,58,92,0.15)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    // FIX: fontSize 16 para evitar zoom automático en iOS
                    fontSize: 16, color: "#1B3A5C",
                    background: "rgba(245,248,251,0.8)", resize: "vertical", boxSizing: "border-box",
                  }}
                />
              </FieldWrap>
            )}

            <DlButton icon="⬇" label="Descargar Formato Ecopetrol" color="#1B3A5C"
              onClick={downloadEcopetrol} loading={ecoLoading} fullWidth />
          </div>
        </div>
      )}

      {/* Tabla de riesgos */}
      <div style={{
        background: "#fff", borderRadius: 16,
        border: "1.5px solid rgba(27,58,92,0.08)",
        overflow: "hidden", boxShadow: "0 2px 20px rgba(27,58,92,0.06)",
      }}>
        <div style={{
          padding: "18px 28px", borderBottom: "1px solid rgba(27,58,92,0.07)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 400, color: "#1B3A5C", letterSpacing: "-0.02em" }}>
              Riesgos identificados
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#7A8EA0", marginTop: 3 }}>
              {result.titulo_actividad}
            </p>
          </div>
          <span style={{
            background: "rgba(46,134,171,0.08)", border: "1px solid rgba(46,134,171,0.15)",
            borderRadius: 100, padding: "4px 14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700, color: "#2E86AB",
          }}>{result.analisis.length} riesgos</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {COLS.map(col => (
                  <th key={col} style={{
                    padding: "11px 13px", textAlign: "left",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 700,
                    color: "#7A8EA0", letterSpacing: "0.08em", textTransform: "uppercase",
                    borderBottom: "1px solid rgba(27,58,92,0.07)", whiteSpace: "nowrap",
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.analisis.map((r, i) => {
                const pc = peligroColor(r.Peligro);
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: i < result.analisis.length - 1 ? "1px solid rgba(27,58,92,0.05)" : "none" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(46,134,171,0.025)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#2A4A60", lineHeight: 1.5, verticalAlign: "top" }}>{r.Fuente}</td>
                    <td style={{ padding: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#2A4A60", lineHeight: 1.5, verticalAlign: "top", maxWidth: 220 }}>{r.Detalle}</td>
                    <td style={{ padding: "13px", verticalAlign: "top" }}>
                      <span style={{
                        background: pc.bg, color: pc.color,
                        borderRadius: 100, padding: "3px 10px",
                        fontSize: 11, fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap",
                      }}>{r.Peligro}</span>
                    </td>
                    <td style={{ padding: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#2A4A60", lineHeight: 1.5, verticalAlign: "top", maxWidth: 200 }}>{r.Consecuencia}</td>
                    <td style={{ padding: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#2A4A60", lineHeight: 1.5, verticalAlign: "top", maxWidth: 240 }}>{r.Controles}</td>
                    <td style={{ padding: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#2A4A60", lineHeight: 1.5, verticalAlign: "top" }}>{r.Responsable}</td>
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GeneratePage() {
  const router  = useRouter();
  const ready   = useAuthGuard();

  const [result,        setResult]        = useState<ARResponse | null>(null);
  const [equipoInicial, setEquipoInicial] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleResult = (r: ARResponse, eq: string) => {
    setResult(r);
    setEquipoInicial(eq);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  if (!ready) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231B3A5C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
      `}</style>

      <Nav onBack={() => router.push("/dashboard")} />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ marginBottom: 26 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 400, color: "#1B3A5C",
            letterSpacing: "-0.02em", marginBottom: 5,
          }}>
            {result ? "Análisis generado" : "Nuevo análisis de riesgos HSE"}
          </h1>
          <p style={{ fontSize: 14, color: "#7A8EA0" }}>
            {result
              ? "Descarga el análisis en el formato que necesites."
              : "Describe la actividad y la IA generará el análisis completo."}
          </p>
        </div>

        {!result && <Step1 onResult={handleResult} />}
        {result && (
          <div ref={resultRef}>
            <Step2
              result={result}
              equipoInicial={equipoInicial}
              onReset={() => { setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          </div>
        )}
      </main>
    </>
  );
}

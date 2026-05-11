"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API, apiFetch, useAuthGuard } from "@/lib/api";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface ObservacionItem {
  id:             string;
  tipo:           "critico" | "importante" | "sugerencia";
  ubicacion:      string;
  observacion:    string;
  texto_actual:   string;
  texto_sugerido: string;
  columna:        string;
  fila:           number;
}

interface RevisionResponse {
  revision_id:       string;
  nombre_archivo:    string;
  tipo_documento:    string;
  observaciones:     ObservacionItem[];
  total_criticos:    number;
  total_importantes: number;
  total_sugerencias: number;
}

interface AplicarResponse {
  archivo_base64: string;
  nombre_archivo: string;
  formato:        string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
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
            padding: "12px 18px", borderRadius: 8, cursor: "pointer",
            border: "1.5px solid rgba(27,58,92,0.15)",
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

// ─── ErrorBanner ──────────────────────────────────────────────────────────────
function ErrorBanner({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      background: "#FCEBEB", border: "1.5px solid rgba(198,40,40,0.25)",
      borderRadius: 10, padding: "14px 18px", marginBottom: 20,
      display: "flex", alignItems: "flex-start", gap: 10,
      animation: "fadeUp 0.3s ease both",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14,
        color: "#C62828", lineHeight: 1.5, flex: 1, margin: 0,
      }}>{msg}</p>
      <button onClick={onClose} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#C62828", fontSize: 16, padding: 0, flexShrink: 0,
      }}>✕</button>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24, color = "#2E86AB" }: { size?: number; color?: string }) {
  return (
    <span style={{
      width: size, height: size, flexShrink: 0,
      border: `${Math.max(2, size / 10)}px solid rgba(46,134,171,0.2)`,
      borderTopColor: color, borderRadius: "50%",
      display: "inline-block", animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RevisarPage() {
  const router = useRouter();
  const ready  = useAuthGuard();

  const [step,      setStep]      = useState<1|2|3|4>(1);
  const [archivo,   setArchivo]   = useState<File | null>(null);
  const [tipoDoc,   setTipoDoc]   = useState<"AR"|"ATS">("AR");
  const [revision,  setRevision]  = useState<RevisionResponse | null>(null);
  const [aceptadas, setAceptadas] = useState<Set<string>>(new Set());
  const [formato,   setFormato]   = useState<"excel"|"pdf">("excel");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [dragOver,  setDragOver]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!ready) return null;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const tipoArchivo = (f: File): "pdf" | "excel" => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ext === "pdf" ? "pdf" : "excel";
  };

  const handleFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "xlsx", "xls"].includes(ext || "")) {
      setError("Solo se aceptan archivos PDF, XLSX o XLS.");
      return;
    }
    setArchivo(f);
    setError("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const toggle = (id: string) => setAceptadas(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const resetTodo = () => {
    setStep(1);
    setArchivo(null);
    setRevision(null);
    setAceptadas(new Set());
    setFormato("excel");
    setError("");
    setLoading(false);
  };

  // ── Handler analizar ────────────────────────────────────────────────────────
  async function handleAnalizar() {
    if (!archivo) return;
    setLoading(true);
    setError("");
    setStep(2);
    try {
      const b64 = await fileToBase64(archivo);
      const res = await apiFetch(`${API}/revision/analizar`, {
        method: "POST",
        body: JSON.stringify({
          archivo_base64: b64,
          tipo_archivo:   tipoArchivo(archivo),
          tipo_documento: tipoDoc,
          nombre_archivo: archivo.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Error al analizar el documento.");
      setRevision(data);
      setStep(3);
    } catch (e: any) {
      setError(e.message || "No se pudo analizar el documento. Intenta de nuevo.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  // ── Handler aplicar ─────────────────────────────────────────────────────────
  async function handleAplicar() {
    if (!revision || aceptadas.size === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`${API}/revision/aplicar`, {
        method: "POST",
        body: JSON.stringify({
          revision_id:             revision.revision_id,
          observaciones_aceptadas: [...aceptadas],
          formato_salida:          formato,
        }),
      });
      const data: AplicarResponse = await res.json();
      if (!res.ok) throw new Error((data as any)?.detail || "Error al aplicar correcciones.");
      const mime = formato === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";
      triggerDownload(data.archivo_base64, data.nombre_archivo, mime);
      setStep(4);
    } catch (e: any) {
      setError(e.message || "No se pudo aplicar las correcciones. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Badge helpers ────────────────────────────────────────────────────────────
  const badgeStyle = (tipo: ObservacionItem["tipo"]): React.CSSProperties => {
    if (tipo === "critico")    return { background: "#FCEBEB", color: "#A32D2D" };
    if (tipo === "importante") return { background: "#FAEEDA", color: "#854F0B" };
    return { background: "#E1F5EE", color: "#0F6E56" };
  };

  const badgeLabel = (tipo: ObservacionItem["tipo"]) => {
    if (tipo === "critico")    return "🔴 Crítico";
    if (tipo === "importante") return "🟡 Importante";
    return "🟢 Sugerencia";
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Nav onBack={() => router.push("/dashboard")} />

      <main style={{ padding: "44px 24px 80px", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: "0 4px 14px rgba(46,134,171,0.28)",
              }}>🔍</div>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 400,
                color: "#1B3A5C", letterSpacing: "-0.02em",
              }}>Revisor HSE</h1>
            </div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15, color: "#7A8EA0", lineHeight: 1.6,
            }}>
              Sube un AR o ATS existente y la IA lo audita según GTC 45, ISO 45001 y Decreto 1072.
            </p>
          </div>

          {/* ── Error banner ── */}
          {error && <ErrorBanner msg={error} onClose={() => setError("")} />}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STEP 1 — Cargar documento                                       */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <div style={{
                background: "#fff", borderRadius: 18,
                border: "1.5px solid rgba(27,58,92,0.08)",
                boxShadow: "0 4px 24px rgba(27,58,92,0.07)",
                padding: "clamp(24px, 5vw, 36px)",
              }}>

                {/* Selector tipo documento */}
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12, fontWeight: 700, color: "#5A7080",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  marginBottom: 10,
                }}>Tipo de documento</p>
                <div style={{
                  display: "inline-flex", borderRadius: 10,
                  border: "1.5px solid rgba(27,58,92,0.12)",
                  overflow: "hidden", marginBottom: 28,
                }}>
                  {(["AR", "ATS"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTipoDoc(t)}
                      style={{
                        padding: "10px 28px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14, fontWeight: 700,
                        cursor: "pointer", border: "none",
                        background: tipoDoc === t
                          ? "linear-gradient(135deg, #1B3A5C, #2E86AB)"
                          : "#fff",
                        color: tipoDoc === t ? "#fff" : "#7A8EA0",
                        transition: "all 0.2s ease",
                      }}
                    >{t}</button>
                  ))}
                </div>

                {/* Label upload */}
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12, fontWeight: 700, color: "#5A7080",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  marginBottom: 10,
                }}>Documento a revisar</p>

                {/* Zona drag & drop */}
                {!archivo ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? "#2E86AB" : "rgba(27,58,92,0.20)"}`,
                      borderRadius: 12, padding: "40px 32px",
                      textAlign: "center", cursor: "pointer",
                      background: dragOver ? "rgba(46,134,171,0.06)" : "rgba(46,134,171,0.03)",
                      transition: "all 0.2s ease", marginBottom: 20,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 15, fontWeight: 600, color: "#1B3A5C", marginBottom: 6,
                    }}>
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13, color: "#7A8EA0",
                    }}>
                      PDF, Excel (.xlsx, .xls) — máx. 10 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                  </div>
                ) : (
                  /* Archivo seleccionado */
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "#F0F8FF",
                    border: "1.5px solid rgba(46,134,171,0.22)",
                    borderRadius: 12, padding: "14px 18px",
                    marginBottom: 20, animation: "fadeUp 0.25s ease both",
                  }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>
                      {tipoArchivo(archivo) === "pdf" ? "📄" : "📊"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14, fontWeight: 700, color: "#1B3A5C",
                        margin: 0, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{archivo.name}</p>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 12, color: "#7A8EA0", margin: 0, marginTop: 2,
                      }}>{formatBytes(archivo.size)}</p>
                    </div>
                    <button
                      onClick={() => { setArchivo(null); setError(""); }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#7A8EA0", fontSize: 18, padding: 4,
                        flexShrink: 0, lineHeight: 1,
                      }}
                    >✕</button>
                  </div>
                )}

                {/* Disclaimer Excel */}
                {archivo && tipoArchivo(archivo) === "excel" && (
                  <div style={{
                    background: "#FAEEDA",
                    borderLeft: "3px solid #EF9F27",
                    borderRadius: "0 8px 8px 0",
                    padding: "10px 14px", marginBottom: 20,
                    animation: "fadeUp 0.25s ease both",
                  }}>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12, color: "#633806", lineHeight: 1.6, margin: 0,
                    }}>
                      <strong>⚠</strong> Para que GenerAR pueda revisar tu documento Excel, debe contener al menos
                      estas columnas: <strong>Paso o Actividad</strong>, <strong>Peligro o Riesgo</strong>,{" "}
                      <strong>Consecuencia</strong>, <strong>Controles o Medidas</strong>.
                      Los nombres exactos pueden variar — GenerAR los detecta automáticamente.
                    </p>
                  </div>
                )}

                {/* Botón analizar */}
                <button
                  onClick={handleAnalizar}
                  disabled={!archivo || loading}
                  style={{
                    width: "100%", padding: "15px",
                    borderRadius: 11, border: "none",
                    cursor: !archivo ? "not-allowed" : "pointer",
                    background: archivo
                      ? "linear-gradient(135deg, #1B3A5C, #2E86AB)"
                      : "rgba(27,58,92,0.08)",
                    color: archivo ? "#fff" : "#A0B0BC",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em",
                    boxShadow: archivo ? "0 3px 14px rgba(46,134,171,0.28)" : "none",
                    transition: "all 0.22s ease",
                  }}
                >
                  Analizar con IA →
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STEP 2 — Analizando                                             */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div style={{ display: "flex", justifyContent: "center", animation: "fadeUp 0.4s ease both" }}>
              <div style={{
                background: "#fff", borderRadius: 18,
                border: "1.5px solid rgba(27,58,92,0.08)",
                boxShadow: "0 4px 24px rgba(27,58,92,0.07)",
                padding: "60px 48px", textAlign: "center",
                maxWidth: 460, width: "100%",
              }}>
                <div style={{ marginBottom: 28 }}>
                  <Spinner size={48} />
                </div>
                <h3 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 22, fontWeight: 400, color: "#1B3A5C",
                  letterSpacing: "-0.02em", marginBottom: 10,
                }}>GenerAR está revisando tu documento...</h3>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14, color: "#7A8EA0", lineHeight: 1.6,
                }}>
                  La IA analiza peligros, controles y cumplimiento normativo GTC 45
                </p>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STEP 3 — Sugerencias                                            */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {step === 3 && revision && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>

              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 400,
                  color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 4,
                }}>
                  Revisión completada — {revision.nombre_archivo}
                </h2>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14, color: "#7A8EA0",
                }}>
                  {revision.observaciones.length} observaciones encontradas
                </p>
              </div>

              {/* Métricas */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 14, marginBottom: 28,
              }}>
                {[
                  { label: "Críticos",    value: revision.total_criticos,    bg: "#FCEBEB", color: "#A32D2D", icon: "🔴" },
                  { label: "Importantes", value: revision.total_importantes, bg: "#FAEEDA", color: "#854F0B", icon: "🟡" },
                  { label: "Sugerencias", value: revision.total_sugerencias, bg: "#E1F5EE", color: "#0F6E56", icon: "🟢" },
                ].map(m => (
                  <div key={m.label} style={{
                    background: m.bg, borderRadius: 12, padding: "18px 20px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 22 }}>{m.icon}</span>
                    <div>
                      <p style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: 28, fontWeight: 400, color: m.color,
                        margin: 0, lineHeight: 1,
                      }}>{m.value}</p>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 12, fontWeight: 600, color: m.color,
                        margin: 0, marginTop: 2, opacity: 0.8,
                      }}>{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lista observaciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                {revision.observaciones.map((obs, idx) => {
                  const isAceptada = aceptadas.has(obs.id);
                  return (
                    <div
                      key={obs.id}
                      style={{
                        background: "#fff", borderRadius: 14,
                        border: isAceptada
                          ? "2px solid #5DCAA5"
                          : "1.5px solid rgba(27,58,92,0.08)",
                        boxShadow: "0 2px 16px rgba(27,58,92,0.06)",
                        overflow: "hidden",
                        transition: "border-color 0.2s ease",
                        animation: `fadeUp 0.35s ease ${idx * 0.05}s both`,
                      }}
                    >
                      {/* Header tarjeta */}
                      <div style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid rgba(27,58,92,0.06)",
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{
                            ...badgeStyle(obs.tipo),
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: 11, fontWeight: 800,
                            letterSpacing: "0.04em",
                            padding: "4px 10px", borderRadius: 100,
                          }}>{badgeLabel(obs.tipo)}</span>
                          <span style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: 12, color: "#7A8EA0",
                          }}>{obs.ubicacion}</span>
                        </div>
                      </div>

                      {/* Antes / Después */}
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: 0, padding: "16px 20px",
                        borderBottom: "1px solid rgba(27,58,92,0.06)",
                      }}>
                        <div style={{ paddingRight: 12, borderRight: "1px solid rgba(27,58,92,0.06)" }}>
                          <p style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: 11, fontWeight: 700, color: "#A0B0BC",
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            marginBottom: 8,
                          }}>Texto actual</p>
                          <div style={{ background: "#FCEBEB", borderRadius: 8, padding: "10px 12px" }}>
                            <p style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: 13, color: "#791F1F", lineHeight: 1.6, margin: 0,
                              textDecoration: "line-through",
                              textDecorationColor: "#E24B4A",
                            }}>{obs.texto_actual || "—"}</p>
                          </div>
                        </div>
                        <div style={{ paddingLeft: 12 }}>
                          <p style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: 11, fontWeight: 700, color: "#A0B0BC",
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            marginBottom: 8,
                          }}>Sugerencia IA</p>
                          <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "10px 12px" }}>
                            <p style={{
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: 13, color: "#085041", lineHeight: 1.6, margin: 0,
                            }}>{obs.texto_sugerido || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer tarjeta */}
                      <div style={{
                        padding: "14px 20px",
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                      }}>
                        <p style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 13, color: "#4A6070", lineHeight: 1.5,
                          flex: 1, margin: 0,
                        }}>{obs.observacion}</p>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => toggle(obs.id)}
                            style={{
                              padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: 13, fontWeight: 700,
                              transition: "all 0.2s ease",
                              border: "1.5px solid #5DCAA5",
                              background: isAceptada ? "#0F6E56" : "#E1F5EE",
                              color: isAceptada ? "#fff" : "#0F6E56",
                            }}
                          >
                            {isAceptada ? "✓ Aceptada" : "Aceptar"}
                          </button>
                          <button
                            onClick={() => { if (isAceptada) toggle(obs.id); }}
                            style={{
                              padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: 13, fontWeight: 700,
                              border: "1.5px solid rgba(27,58,92,0.12)",
                              background: "#F5F8FB", color: "#7A8EA0",
                              transition: "all 0.2s ease",
                              opacity: isAceptada ? 1 : 0.5,
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selector formato + botón aplicar */}
              <div style={{
                background: "#fff", borderRadius: 16,
                border: "1.5px solid rgba(27,58,92,0.08)",
                boxShadow: "0 4px 24px rgba(27,58,92,0.07)",
                padding: "24px 28px",
              }}>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12, fontWeight: 700, color: "#5A7080",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  marginBottom: 12,
                }}>Formato de descarga</p>

                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {([
                    { val: "excel" as const, label: "Excel (.xlsx)", icon: "📊" },
                    { val: "pdf"   as const, label: "PDF",           icon: "📄" },
                  ]).map(f => (
                    <button
                      key={f.val}
                      onClick={() => setFormato(f.val)}
                      style={{
                        padding: "10px 20px", borderRadius: 9, cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 14, fontWeight: 600,
                        transition: "all 0.2s ease",
                        border: formato === f.val
                          ? "2px solid #2E86AB"
                          : "1.5px solid rgba(27,58,92,0.12)",
                        background: formato === f.val
                          ? "rgba(46,134,171,0.07)"
                          : "#fff",
                        color: formato === f.val ? "#1B3A5C" : "#7A8EA0",
                        display: "flex", alignItems: "center", gap: 7,
                      }}
                    >
                      <span>{f.icon}</span> {f.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAplicar}
                  disabled={aceptadas.size === 0 || loading}
                  style={{
                    width: "100%", padding: "15px",
                    borderRadius: 11, border: "none",
                    cursor: aceptadas.size === 0 || loading ? "not-allowed" : "pointer",
                    background: aceptadas.size > 0 && !loading
                      ? "#1D9E75"
                      : "rgba(27,58,92,0.08)",
                    color: aceptadas.size > 0 && !loading ? "#fff" : "#A0B0BC",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em",
                    boxShadow: aceptadas.size > 0 && !loading
                      ? "0 3px 14px rgba(29,158,117,0.30)"
                      : "none",
                    transition: "all 0.22s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {loading
                    ? <><Spinner size={18} color="#fff" /> Aplicando correcciones...</>
                    : `Aplicar ${aceptadas.size} corrección${aceptadas.size !== 1 ? "es" : ""} y descargar`
                  }
                </button>

                {aceptadas.size === 0 && (
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 12, color: "#A0B0BC",
                    textAlign: "center", marginTop: 10,
                  }}>
                    Acepta al menos una observación para habilitar la descarga
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STEP 4 — Completado                                             */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div style={{ display: "flex", justifyContent: "center", animation: "fadeUp 0.4s ease both" }}>
              <div style={{
                background: "#fff", borderRadius: 18,
                border: "1.5px solid rgba(27,58,92,0.08)",
                boxShadow: "0 4px 24px rgba(27,58,92,0.07)",
                padding: "60px 48px", textAlign: "center",
                maxWidth: 460, width: "100%",
              }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
                <h3 style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 26, fontWeight: 400, color: "#1B3A5C",
                  letterSpacing: "-0.02em", marginBottom: 10,
                }}>Correcciones aplicadas</h3>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14, color: "#7A8EA0", lineHeight: 1.6, marginBottom: 32,
                }}>
                  Tu documento corregido se está descargando.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button
                    onClick={resetTodo}
                    style={{
                      width: "100%", padding: "14px",
                      borderRadius: 11, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                      color: "#fff",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 15, fontWeight: 700,
                      boxShadow: "0 3px 14px rgba(46,134,171,0.28)",
                    }}
                  >
                    Revisar otro documento
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    style={{
                      width: "100%", padding: "14px",
                      borderRadius: 11, cursor: "pointer",
                      background: "#fff", color: "#1B3A5C",
                      border: "1.5px solid rgba(27,58,92,0.15)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 15, fontWeight: 600,
                    }}
                  >
                    ← Ir al dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

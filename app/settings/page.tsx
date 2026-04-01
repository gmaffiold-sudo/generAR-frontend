"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  nombre:  string;
  email:   string;
  empresa: string | null;
  cargo:   string | null;
}
interface Credits {
  plan:               string;
  creditos_totales:   number;
  creditos_usados:    number;
  creditos_restantes: number;
  fecha_vencimiento:  string;
  estado_suscripcion: string;
}
interface Transaccion {
  id:          string;
  nombre_plan: string;
  monto:       number;
  moneda:      string;
  estado:      string;
  tipo:        string;
  fecha_pago:  string;
}
interface Miembro {
  id:             string;
  nombre:         string;
  email:          string;
  fecha_registro: string;
  activo:         boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("generar_token");
}
function formatDate(iso: string): string {
  try {
    const n = iso.replace(" UTC", "").replace(" ", "T") + "Z";
    return new Date(n).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}
function formatCOP(centavos: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(centavos / 100);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 18, radius = 8 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg, rgba(27,58,92,0.06) 25%, rgba(27,58,92,0.10) 50%, rgba(27,58,92,0.06) 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  title, icon, danger, children,
}: {
  title: string; icon: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: danger ? "1.5px solid rgba(198,40,40,0.25)" : "1.5px solid rgba(27,58,92,0.08)",
      boxShadow: "0 2px 16px rgba(27,58,92,0.05)", overflow: "hidden", marginBottom: 20,
    }}>
      <div style={{
        padding: "18px 28px",
        borderBottom: danger ? "1px solid rgba(198,40,40,0.15)" : "1px solid rgba(27,58,92,0.07)",
        background: danger
          ? "rgba(198,40,40,0.03)"
          : "linear-gradient(135deg, rgba(27,58,92,0.03), rgba(46,134,171,0.04))",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 17, fontWeight: 400,
          color: danger ? "#C62828" : "#1B3A5C",
        }}>{title}</h2>
      </div>
      <div style={{ padding: "24px 28px" }}>{children}</div>
    </div>
  );
}

// ─── Profile Field ─────────────────────────────────────────────────────────────
function ProfileField({ label, value, loading }: { label: string; value?: string | null; loading: boolean }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "#7A8EA0", marginBottom: 6,
      }}>{label}</p>
      {loading ? <Skeleton w={200} h={16} /> : (
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 15, fontWeight: 600, color: value ? "#1B3A5C" : "#A0B0BC",
          padding: "10px 14px", borderRadius: 9,
          background: "rgba(27,58,92,0.03)",
          border: "1.5px solid rgba(27,58,92,0.08)",
        }}>
          {value || "—"}
        </p>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Nav() {
  const router = useRouter();
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
          onClick={() => router.push("/dashboard")}
          onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8,
            cursor: "pointer", border: "1.5px solid rgba(27,58,92,0.15)",
            background: h ? "rgba(27,58,92,0.04)" : "#fff", color: "#1B3A5C",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s ease",
          }}>
          ← Dashboard
        </button>
      </div>
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();

  const [profile,         setProfile]         = useState<Profile | null>(null);
  const [credits,         setCredits]         = useState<Credits | null>(null);
  const [transacciones,   setTransacciones]   = useState<Transaccion[]>([]);
  const [rol,             setRol]             = useState<"admin" | "usuario" | null>(null);
  const [equipo,          setEquipo]          = useState<Miembro[]>([]);
  const [loadingProfile,  setLoadingProfile]  = useState(true);
  const [loadingCredits,  setLoadingCredits]  = useState(true);
  const [loadingTx,       setLoadingTx]       = useState(true);
  const [loadingEquipo,   setLoadingEquipo]   = useState(true);

  // Invite form state
  const [inviteNombre,    setInviteNombre]    = useState("");
  const [inviteEmail,     setInviteEmail]     = useState("");
  const [inviting,        setInviting]        = useState(false);
  const [inviteSuccess,   setInviteSuccess]   = useState("");
  const [inviteError,     setInviteError]     = useState("");
  const [removingId,      setRemovingId]      = useState<string | null>(null);

  // Danger zone state
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [deleteSuccess,   setDeleteSuccess]   = useState(false);
  const [deleteError,     setDeleteError]     = useState("");
  const [currentPw,       setCurrentPw]       = useState("");
  const [newPw,           setNewPw]           = useState("");
  const [confirmPw,       setConfirmPw]       = useState("");
  const [changingPw,      setChangingPw]      = useState(false);
  const [changePwSuccess, setChangePwSuccess] = useState(false);
  const [changePwError,   setChangePwError]   = useState("");

  // Route protection
  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }

    // Verificar que no es sub-usuario
    fetch("https://hse-risk-analyzer-production.up.railway.app/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => {
      if (d.rol === "usuario") router.replace("/dashboard");
    })
    .catch(() => {});
  }, [router]);

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    // Profile (also captures rol)
    setLoadingProfile(true);
    fetch(`${API}/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setProfile(d);
          setRol(d.rol === "usuario" ? "usuario" : "admin");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    // Credits
    setLoadingCredits(true);
    fetch(`${API}/user/credits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCredits(d); })
      .catch(() => {})
      .finally(() => setLoadingCredits(false));

    // Transacciones
    setLoadingTx(true);
    fetch(`${API}/user/transacciones`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setTransacciones(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingTx(false));

    // Equipo (solo para admins — el backend devolverá 403 para sub-usuarios, ignoramos)
    setLoadingEquipo(true);
    fetch(`${API}/user/equipo`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setEquipo(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingEquipo(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { setChangePwError("Las contraseñas no coinciden."); return; }
    if (newPw.length < 8)    { setChangePwError("Mínimo 8 caracteres."); return; }
    setChangingPw(true); setChangePwError(""); setChangePwSuccess(false);
    try {
      const res  = await fetch(`${API}/user/change-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangePwSuccess(true);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setTimeout(() => {
        localStorage.removeItem("generar_token");
        router.replace("/login");
        }, 3000);
          
      else {
        setChangePwError(data?.detail || "Error al cambiar contraseña.");
      }
    } catch {
      setChangePwError("No se pudo conectar con el servidor.");
    } finally {
      setChangingPw(false);
    }
  };

  const handleDeleteRequest = async () => {
    setDeleting(true); setDeleteError("");
    try {
      const res  = await fetch(`${API}/user/request-deletion`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteSuccess(true);
        setShowConfirm(false);
      } else {
        setDeleteError(data?.detail || "Error al procesar la solicitud.");
      }
    } catch { setDeleteError("No se pudo conectar con el servidor."); }
    finally { setDeleting(false); }
  };

  const handleInvite = async () => {
    if (!inviteNombre.trim() || !inviteEmail.trim()) {
      setInviteError("Completa nombre y email para invitar."); return;
    }
    setInviting(true); setInviteError(""); setInviteSuccess("");
    try {
      const res  = await fetch(`${API}/user/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ nombre: inviteNombre.trim(), email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteSuccess(`Invitación enviada a ${inviteEmail.trim()}.`);
        setInviteNombre(""); setInviteEmail("");
        // Refresh equipo list
        fetch(`${API}/user/equipo`, { headers: { Authorization: `Bearer ${getToken()}` } })
          .then(r => r.ok ? r.json() : [])
          .then(d => setEquipo(Array.isArray(d) ? d : []))
          .catch(() => {});
      } else {
        setInviteError(data?.detail || "Error al enviar la invitación.");
      }
    } catch { setInviteError("No se pudo conectar con el servidor."); }
    finally { setInviting(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      const res  = await fetch(`${API}/user/equipo/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setEquipo(prev => prev.map(m => m.id === memberId ? { ...m, activo: false } : m));
      }
    } catch {}
    finally { setRemovingId(null); }
  };

  const pct = credits
    ? Math.round((credits.creditos_usados / credits.creditos_totales) * 100)
    : 0;
  const barColor = pct >= 90 ? "#E05252" : pct >= 70 ? "#F4A261" : "#2E86AB";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; background: #F5F8FB; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>

      <Nav />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Page title */}
        <div style={{ marginBottom: 32, animation: "fadeUp 0.5s ease both" }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 400, color: "#1B3A5C", letterSpacing: "-0.02em", marginBottom: 5,
          }}>Configuración de cuenta</h1>
          <p style={{ fontSize: 14, color: "#7A8EA0" }}>Gestiona tu perfil, suscripción y datos de cuenta.</p>
        </div>

        {/* ── SECCIÓN 1: Perfil ── */}
        <div style={{ animation: "fadeUp 0.5s ease 0.05s both" }}>
          <SectionCard title="Perfil" icon="👤">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <ProfileField label="Nombre completo" value={profile?.nombre} loading={loadingProfile} />
              <ProfileField label="Correo electrónico" value={profile?.email} loading={loadingProfile} />
              <ProfileField label="Empresa" value={profile?.empresa} loading={loadingProfile} />
              <ProfileField label="Cargo" value={profile?.cargo} loading={loadingProfile} />
            </div>
          </SectionCard>
        </div>

        {/* ── SECCIÓN 2: Suscripción (solo admin) ── */}
        {rol !== "usuario" && (
        <div style={{ animation: "fadeUp 0.5s ease 0.10s both" }}>
          <SectionCard title="Suscripción" icon="💳">
            {loadingCredits ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Skeleton w={160} h={16} />
                <Skeleton w="80%" h={10} radius={4} />
                <Skeleton w={120} h={14} />
              </div>
            ) : credits ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{
                      fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1B3A5C", fontWeight: 400,
                    }}>{credits.creditos_restantes}</span>
                    <span style={{ fontSize: 14, color: "#7A8EA0", fontWeight: 500 }}>
                      / {credits.creditos_totales} créditos
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: "rgba(27,58,92,0.10)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: "#7A8EA0" }}>{credits.creditos_usados} usados</span>
                    <span style={{ fontSize: 12, color: "#7A8EA0" }}>Vence {formatDate(credits.fecha_vencimiento)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: "#7A8EA0",
                      letterSpacing: "0.07em", textTransform: "uppercase",
                    }}>Plan</span>
                    <span style={{
                      background: "rgba(46,134,171,0.09)", border: "1px solid rgba(46,134,171,0.20)",
                      borderRadius: 100, padding: "2px 10px",
                      fontSize: 12, fontWeight: 700, color: "#2E86AB",
                    }}>{credits.plan}</span>
                    <span style={{
                      background: credits.estado_suscripcion === "activa" ? "rgba(39,174,96,0.12)" : "rgba(224,82,82,0.12)",
                      border: `1px solid ${credits.estado_suscripcion === "activa" ? "rgba(39,174,96,0.25)" : "rgba(224,82,82,0.25)"}`,
                      borderRadius: 100, padding: "2px 10px",
                      fontSize: 12, fontWeight: 700,
                      color: credits.estado_suscripcion === "activa" ? "#1A7A44" : "#C62828",
                    }}>{credits.estado_suscripcion}</span>
                  </div>
                </div>
                <a href="/pricing" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 9, textDecoration: "none",
                  border: "1.5px solid rgba(27,58,92,0.18)",
                  background: "#fff", color: "#1B3A5C",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700,
                  transition: "all 0.18s ease", whiteSpace: "nowrap", alignSelf: "flex-start",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(46,134,171,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(46,134,171,0.30)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,58,92,0.18)"; }}
                >
                  📦 Cambiar plan
                </a>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: "#7A8EA0" }}>No tienes una suscripción activa. <a href="/pricing" style={{ color: "#2E86AB", fontWeight: 600 }}>Ver planes →</a></p>
            )}
          </SectionCard>
        </div>
        )} {/* end admin-only subscripcion */}

        {/* ── SECCIÓN 2.5: Equipo (solo admin) ── */}
        {rol !== "usuario" && (
        <div style={{ animation: "fadeUp 0.5s ease 0.12s both" }}>
          <SectionCard title="Equipo" icon="👥">
            {(() => {
              const planLower = credits?.plan?.toLowerCase() ?? "";
              const limite    = planLower.includes("business")      ? 9
                              : planLower.includes("professional")  ? 2
                              : 0;
              const activos   = equipo.filter(m => m.activo).length;

              if (loadingEquipo) {
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Skeleton w={180} h={14} /> <Skeleton w="70%" h={14} />
                  </div>
                );
              }

              if (limite === 0) {
                return (
                  <div style={{
                    background: "rgba(244,162,97,0.08)", border: "1.5px solid rgba(244,162,97,0.25)",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "flex-start", gap: 10,
                  }}>
                    <span style={{ fontSize: 18 }}>🔒</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#92600A", marginBottom: 4 }}>
                        Tu plan no permite sub-usuarios
                      </p>
                      <p style={{ fontSize: 13, color: "#7A8EA0", lineHeight: 1.5 }}>
                        Actualiza a <strong>Professional</strong> (hasta 2 miembros) o <strong>Business</strong> (hasta 9 miembros) para invitar a tu equipo.
                      </p>
                      <a href="/pricing" style={{
                        display: "inline-block", marginTop: 10,
                        color: "#2E86AB", fontWeight: 700, fontSize: 13, textDecoration: "none",
                      }}>Ver planes →</a>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {/* Límite del plan */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
                    padding: "10px 14px", borderRadius: 9,
                    background: "rgba(46,134,171,0.06)", border: "1px solid rgba(46,134,171,0.15)",
                  }}>
                    <span style={{ fontSize: 15 }}>👤</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "#1B3A5C", fontWeight: 600 }}>
                      {activos} de {limite} miembros disponibles en tu plan
                    </span>
                  </div>

                  {/* Lista de miembros */}
                  {equipo.length === 0 ? (
                    <p style={{ fontSize: 14, color: "#7A8EA0", marginBottom: 24 }}>
                      Aún no has invitado ningún miembro a tu equipo.
                    </p>
                  ) : (
                    <div style={{ marginBottom: 24 }}>
                      {equipo.map(m => (
                        <div key={m.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 14px", borderRadius: 10, marginBottom: 8,
                          background: m.activo ? "#fff" : "rgba(27,58,92,0.03)",
                          border: m.activo ? "1.5px solid rgba(27,58,92,0.10)" : "1.5px solid rgba(27,58,92,0.06)",
                          opacity: m.activo ? 1 : 0.6,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: "50%",
                              background: m.activo
                                ? "linear-gradient(135deg, #1B3A5C, #2E86AB)"
                                : "rgba(27,58,92,0.20)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
                            }}>
                              {m.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#1B3A5C", marginBottom: 2 }}>
                                {m.nombre}
                                {!m.activo && <span style={{ marginLeft: 8, fontSize: 11, color: "#A0B0BC" }}>inactivo</span>}
                              </p>
                              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "#7A8EA0" }}>{m.email}</p>
                            </div>
                          </div>
                          {m.activo && (
                            <button
                              onClick={() => handleRemoveMember(m.id)}
                              disabled={removingId === m.id}
                              style={{
                                padding: "6px 12px", borderRadius: 7,
                                border: "1.5px solid rgba(198,40,40,0.25)",
                                background: "rgba(198,40,40,0.05)", color: "#C62828",
                                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700,
                                cursor: removingId === m.id ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", gap: 5,
                                transition: "all 0.18s ease",
                                opacity: removingId === m.id ? 0.6 : 1,
                              }}
                            >
                              {removingId === m.id ? (
                                <span style={{ width: 10, height: 10, border: "1.5px solid rgba(198,40,40,0.3)", borderTopColor: "#C62828", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                              ) : "✕"}
                              Eliminar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario de invitación */}
                  {activos < limite && (
                    <div style={{ borderTop: "1px solid rgba(27,58,92,0.07)", paddingTop: 20 }}>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#7A8EA0", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
                        Invitar nuevo miembro
                      </p>
                      {inviteSuccess && (
                        <div style={{ background: "rgba(39,174,96,0.08)", border: "1.5px solid rgba(39,174,96,0.22)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
                          <span>✅</span>
                          <span style={{ fontSize: 13, color: "#1A7A44" }}>{inviteSuccess}</span>
                        </div>
                      )}
                      {inviteError && (
                        <div style={{ background: "rgba(198,40,40,0.06)", border: "1.5px solid rgba(198,40,40,0.22)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ flexShrink: 0 }}>⚠️</span>
                          <span style={{ fontSize: 13, color: "#C62828" }}>{inviteError}</span>
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px", marginBottom: 12 }}>
                        <div>
                          <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#1B3A5C", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Nombre</label>
                          <input
                            type="text" value={inviteNombre} placeholder="Nombre del miembro"
                            onChange={e => { setInviteNombre(e.target.value); setInviteError(""); setInviteSuccess(""); }}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, outline: "none", border: "1.5px solid rgba(27,58,92,0.15)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#1B3A5C", background: "#fff", boxSizing: "border-box" as const }}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#1B3A5C", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Email</label>
                          <input
                            type="email" value={inviteEmail} placeholder="correo@empresa.com"
                            onChange={e => { setInviteEmail(e.target.value); setInviteError(""); setInviteSuccess(""); }}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, outline: "none", border: "1.5px solid rgba(27,58,92,0.15)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#1B3A5C", background: "#fff", boxSizing: "border-box" as const }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleInvite} disabled={inviting}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "10px 20px", borderRadius: 9, border: "none",
                          cursor: inviting ? "not-allowed" : "pointer",
                          background: inviting ? "rgba(46,134,171,0.40)" : "linear-gradient(135deg, #1B3A5C, #2E86AB)",
                          color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700,
                          transition: "all 0.18s ease",
                        }}
                      >
                        {inviting && <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
                        {inviting ? "Enviando..." : "✉️ Enviar invitación"}
                      </button>
                    </div>
                  )}
                  {activos >= limite && (
                    <p style={{ fontSize: 13, color: "#7A8EA0", fontStyle: "italic" }}>
                      Has alcanzado el límite de tu plan. <a href="/pricing" style={{ color: "#2E86AB", fontWeight: 600 }}>Actualiza para agregar más →</a>
                    </p>
                  )}
                </>
              );
            })()}
          </SectionCard>
        </div>
        )} {/* end admin-only equipo */}

        {/* ── SECCIÓN 3: Historial de pagos (solo admin) ── */}
        {rol !== "usuario" && (
        <div style={{ animation: "fadeUp 0.5s ease 0.15s both" }}>
          <SectionCard title="Historial de pagos" icon="🧾">
            {loadingTx ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Skeleton w={110} h={13} />
                    <Skeleton w={120} h={13} />
                    <Skeleton w={80} h={13} />
                    <Skeleton w={90} h={13} />
                    <Skeleton w={70} h={13} />
                  </div>
                ))}
              </div>
            ) : transacciones.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
                  background: "linear-gradient(135deg, rgba(27,58,92,0.05), rgba(46,134,171,0.08))",
                  border: "1px solid rgba(46,134,171,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                }}>💳</div>
                <p style={{ fontSize: 15, color: "#1B3A5C", fontFamily: "'DM Serif Display', serif", marginBottom: 6 }}>
                  Aún no tienes pagos registrados
                </p>
                <p style={{ fontSize: 13, color: "#7A8EA0" }}>
                  Aquí aparecerán tus transacciones cuando adquieras un plan.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "150px 1fr 110px 120px 100px",
                  padding: "10px 0 10px",
                  borderBottom: "1px solid rgba(27,58,92,0.08)",
                  marginBottom: 4,
                }}>
                  {["Fecha", "Plan", "Tipo", "Monto", "Estado"].map(col => (
                    <span key={col} style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 10, fontWeight: 700, color: "#7A8EA0",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>{col}</span>
                  ))}
                </div>
                {/* Rows */}
                {transacciones.map((t, i) => (
                  <div key={t.id} style={{
                    display: "grid", gridTemplateColumns: "150px 1fr 110px 120px 100px",
                    padding: "12px 0", alignItems: "center",
                    borderBottom: i < transacciones.length - 1 ? "1px solid rgba(27,58,92,0.05)" : "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#7A8EA0", fontWeight: 500 }}>
                      {formatDate(t.fecha_pago)}
                    </span>
                    <span style={{ fontSize: 13, color: "#1B3A5C", fontWeight: 600 }}>{t.nombre_plan}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
                      background: t.tipo === "top-up" ? "rgba(46,134,171,0.08)" : "rgba(27,58,92,0.06)",
                      border: `1px solid ${t.tipo === "top-up" ? "rgba(46,134,171,0.20)" : "rgba(27,58,92,0.12)"}`,
                      borderRadius: 100, padding: "3px 10px", width: "fit-content",
                      color: t.tipo === "top-up" ? "#2E86AB" : "#1B3A5C",
                    }}>
                      {t.tipo === "top-up" ? "➕" : "📦"} {t.tipo === "top-up" ? "Top-up" : "Suscripción"}
                    </span>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#1B3A5C" }}>
                      {formatCOP(t.monto)}
                    </span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: t.estado === "APROBADO" ? "rgba(39,174,96,0.10)" : "rgba(244,162,97,0.10)",
                      border: `1px solid ${t.estado === "APROBADO" ? "rgba(39,174,96,0.25)" : "rgba(244,162,97,0.25)"}`,
                      borderRadius: 100, padding: "3px 10px",
                      fontSize: 11, fontWeight: 700, width: "fit-content",
                      color: t.estado === "APROBADO" ? "#1A7A44" : "#92600A",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.estado === "APROBADO" ? "#27AE60" : "#F4A261", flexShrink: 0 }} />
                      {t.estado === "APROBADO" ? "Aprobado" : t.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
        )} {/* end admin-only historial de pagos */}

        {/* ── SECCIÓN 3.5: Cambiar contraseña ── */}
        <SectionCard title="Cambiar contraseña" icon="🔐">
          <div style={{ maxWidth: 400 }}>
            {changePwSuccess && (
              <div style={{ background: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#1B7A3E" }}>✅ Contraseña actualizada. Redirigiendo al login...</p>
              </div>
            )}
            {changePwError && (
              <div style={{ background: "rgba(224,82,82,0.06)", border: "1px solid rgba(224,82,82,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#C04040" }}>⚠️ {changePwError}</p>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1B3A5C", marginBottom: 6 }}>Contraseña actual</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid rgba(27,58,92,0.15)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1B3A5C", marginBottom: 6 }}>Nueva contraseña</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid rgba(27,58,92,0.15)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#1B3A5C", marginBottom: 6 }}>Confirmar nueva contraseña</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: "1.5px solid rgba(27,58,92,0.15)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <button onClick={handleChangePw} disabled={changingPw}
              style={{ padding: "11px 24px", borderRadius: 9, border: "none", cursor: changingPw ? "not-allowed" : "pointer", background: changingPw ? "rgba(27,58,92,0.2)" : "linear-gradient(135deg, #1B3A5C, #2E86AB)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700 }}>
              {changingPw ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </div>
        </SectionCard>

        {/* ── SECCIÓN 4: Zona de peligro (solo admin) ── */}
        {rol !== "usuario" && (
        <div style={{ animation: "fadeUp 0.5s ease 0.20s both" }}>
          <SectionCard title="Zona de peligro" icon="⚠️" danger>
            <p style={{ fontSize: 14, color: "#5A7080", lineHeight: 1.6, marginBottom: 20 }}>
              Eliminar tu cuenta es una acción <strong style={{ color: "#C62828" }}>irreversible</strong>.
              Perderás todos tus datos, historial de análisis y suscripción activa.
            </p>

            {deleteSuccess ? (
              <div style={{
                background: "rgba(39,174,96,0.08)", border: "1.5px solid rgba(39,174,96,0.22)",
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
                <p style={{ fontSize: 14, color: "#1A7A44", lineHeight: 1.5 }}>
                  Te enviamos un email de confirmación para eliminar tu cuenta.
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
              </div>
            ) : (
              <>
                {deleteError && (
                  <div style={{
                    background: "rgba(198,40,40,0.06)", border: "1.5px solid rgba(198,40,40,0.22)",
                    borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                    display: "flex", gap: 8, alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: 13, color: "#C62828" }}>{deleteError}</p>
                  </div>
                )}

                {!showConfirm ? (
                  <DeleteButton
                    label="Eliminar mi cuenta"
                    onClick={() => { setShowConfirm(true); setDeleteError(""); }}
                  />
                ) : (
                  <div style={{
                    background: "rgba(198,40,40,0.04)", border: "1.5px solid rgba(198,40,40,0.20)",
                    borderRadius: 12, padding: "20px 20px",
                  }}>
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 14, fontWeight: 700, color: "#C62828", marginBottom: 8,
                    }}>
                      ¿Estás seguro? Esta acción no se puede deshacer.
                    </p>
                    <p style={{ fontSize: 13, color: "#7A8EA0", marginBottom: 18, lineHeight: 1.5 }}>
                      Se te enviará un email de confirmación al correo registrado.
                      Tendrás 24 horas para confirmar antes de que el enlace expire.
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <DeleteButton
                        label={deleting ? "Enviando..." : "Sí, enviarme el email"}
                        onClick={handleDeleteRequest}
                        loading={deleting}
                      />
                      <button
                        onClick={() => { setShowConfirm(false); setDeleteError(""); }}
                        style={{
                          padding: "10px 18px", borderRadius: 9, border: "1.5px solid rgba(27,58,92,0.18)",
                          background: "#fff", color: "#1B3A5C", cursor: "pointer",
                          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
                          transition: "all 0.18s ease",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>
        </div>
        )} {/* end admin-only zona de peligro */}
      </main>
    </>
  );
}

function DeleteButton({ label, onClick, loading }: { label: string; onClick: () => void; loading?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick} disabled={loading}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "10px 20px", borderRadius: 9, border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        background: loading ? "rgba(198,40,40,0.40)" : h ? "#A81E1E" : "#C62828",
        color: "#fff",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 700,
        boxShadow: h && !loading ? "0 4px 16px rgba(198,40,40,0.35)" : "none",
        transform: h && !loading ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s ease",
      }}
    >
      {loading && (
        <span style={{
          width: 13, height: 13,
          border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff",
          borderRadius: "50%", display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
      )}
      {label}
    </button>
  );
}

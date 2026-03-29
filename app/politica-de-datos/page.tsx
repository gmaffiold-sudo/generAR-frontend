export const metadata = {
  title: "Política de Tratamiento de Datos Personales — GenerAR",
  description:
    "Política de Tratamiento de Datos Personales de GenerAR, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.",
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:    "#1B3A5C",
  accent:     "#2E86AB",
  white:      "#FFFFFF",
  gray50:     "#F9FAFB",
  gray100:    "#F3F4F6",
  gray200:    "#E5E7EB",
  gray400:    "#9CA3AF",
  gray500:    "#6B7280",
  gray600:    "#4B5563",
  gray700:    "#374151",
  gray800:    "#1F2937",
  gray900:    "#111827",
  amber50:    "#FFFBEB",
  amber200:   "#FDE68A",
  amber800:   "#92400E",
  primaryBg:  "rgba(27,58,92,0.05)",
  primaryBg2: "rgba(27,58,92,0.10)",
  accentBg:   "rgba(46,134,171,0.10)",
  whiteMuted: "rgba(255,255,255,0.60)",
  whiteFaint: "rgba(255,255,255,0.20)",
  whiteDim:   "rgba(255,255,255,0.40)",
  whiteGhost: "rgba(255,255,255,0.30)",
  whiteBorder:"rgba(255,255,255,0.10)",
};

const FONT = "'Plus Jakarta Sans', sans-serif";

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionTitle({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
      <span style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
        background: C.primary, color: C.white, fontSize: 13, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
      }}>
        {number}
      </span>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.primary, lineHeight: 1.3, margin: 0 }}>
        {children}
      </h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 15, fontWeight: 700, color: C.accent,
      marginTop: 24, marginBottom: 8,
      borderLeft: `4px solid ${C.accent}`, paddingLeft: 12,
    }}>
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: C.gray700, lineHeight: 1.7, marginBottom: 12, marginTop: 0 }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ marginBottom: 12, marginLeft: 8, padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: C.gray700, lineHeight: 1.7, marginBottom: 6 }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: C.accent, marginTop: 9 }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DefItem({ term, def }: { term: string; def: string }) {
  return (
    <div style={{ marginBottom: 12, paddingLeft: 16, borderLeft: `2px solid ${C.gray200}` }}>
      <span style={{ fontWeight: 600, color: C.primary, fontSize: 15 }}>{term}: </span>
      <span style={{ fontSize: 15, color: C.gray700 }}>{def}</span>
    </div>
  );
}

function PrincipleItem({ code, title, def }: { code: string; title: string; def: string }) {
  return (
    <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
      <span style={{
        flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.accent,
        background: C.accentBg, padding: "2px 8px", borderRadius: 4, height: "fit-content", marginTop: 2,
      }}>
        {code}
      </span>
      <p style={{ fontSize: 15, color: C.gray700, lineHeight: 1.7, margin: 0 }}>
        <span style={{ fontWeight: 600, color: C.gray900 }}>Principio de {title}: </span>
        {def}
      </p>
    </div>
  );
}

function RightItem({ code, title, def }: { code: string; title: string; def: string }) {
  return (
    <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
      <span style={{
        flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.primary,
        background: C.primaryBg2, padding: "2px 8px", borderRadius: 4, height: "fit-content", marginTop: 2,
      }}>
        {code}
      </span>
      <p style={{ fontSize: 15, color: C.gray700, lineHeight: 1.7, margin: 0 }}>
        <span style={{ fontWeight: 600, color: C.gray900 }}>{title}: </span>
        {def}
      </p>
    </div>
  );
}

function ThirdPartyCard({ code, name, role, detail, url }: {
  code: string; name: string; role: string; detail: string; url: string;
}) {
  return (
    <div style={{ marginBottom: 16, borderRadius: 12, border: `1px solid ${C.gray200}`, overflow: "hidden" }}>
      <div style={{
        background: C.primaryBg, padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${C.gray200}`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>{code}</span>
        <span style={{ fontWeight: 700, color: C.primary, fontSize: 15 }}>{name}</span>
        <span style={{ fontSize: 11, color: C.gray500, marginLeft: "auto" }}>{role}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: 15, color: C.gray700, lineHeight: 1.7, marginBottom: 8, marginTop: 0 }}>{detail}</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, color: C.accent, textDecoration: "none", wordBreak: "break-all" }}>
          Política de privacidad: {url}
        </a>
      </div>
    </div>
  );
}

function Divider() {
  return <hr style={{ margin: "32px 0", border: "none", borderTop: `1px solid ${C.gray100}` }} />;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.primaryBg, borderRadius: 8, padding: "12px 16px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: C.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, marginTop: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: 14, color: C.gray800, wordBreak: "break-all", margin: 0 }}>{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PoliticaDatosPage() {
  const tocItems: [string, string][] = [
    ["1", "Responsable"], ["2", "Definiciones"], ["3", "Principios"], ["4", "Datos"], ["5", "Finalidad"],
    ["6", "Terceros"],    ["7", "Derechos"],     ["8", "Procedimiento"], ["9", "Seguridad"], ["10", "Vigencia"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.gray50, fontFamily: FONT }}>

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: C.primary, borderBottom: `1px solid ${C.whiteBorder}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}>
        <div style={{ maxWidth: 896, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="https://generar.co" style={{ display: "flex", alignItems: "baseline", gap: 2, textDecoration: "none" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: "-0.02em", lineHeight: 1 }}>Gener</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.accent, letterSpacing: "-0.02em", lineHeight: 1 }}>AR</span>
          </a>
          <span style={{ fontSize: 11, color: C.whiteMuted, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Política de Datos
          </span>
        </div>
      </nav>

      {/* ── Hero banner ── */}
      <div style={{ background: C.primary }}>
        <div style={{ maxWidth: 896, margin: "0 auto", padding: "48px 24px 56px" }}>
          <p style={{ color: C.accent, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>
            Cumplimiento Legal · Ley 1581 de 2012 · Decreto 1377 de 2013
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: C.white, lineHeight: 1.2, marginBottom: 16, marginTop: 0 }}>
            Política de Tratamiento<br />de Datos Personales
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: C.whiteMuted }}>
            <span>generar.co</span>
            <span style={{ color: C.whiteFaint }}>·</span>
            <span>Cali, Valle del Cauca, Colombia</span>
            <span style={{ color: C.whiteFaint }}>·</span>
            <span>Última actualización: 2026</span>
          </div>
        </div>
      </div>

      {/* ── Table of contents ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.gray200}` }}>
        <div style={{ maxWidth: 896, margin: "0 auto", padding: "20px 24px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, marginTop: 0 }}>
            Contenido
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tocItems.map(([n, label]) => (
              <a key={n} href={`#seccion-${n}`} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, color: C.gray600, textDecoration: "none",
                minWidth: 110,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", background: C.primaryBg2,
                  color: C.primary, fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {n}
                </span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 896, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{
          background: C.white, borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: `1px solid ${C.gray100}`,
          padding: "48px",
        }}>

          {/* ── 1. Identificación ── */}
          <section id="seccion-1">
            <SectionTitle number="1">Identificación del Responsable del Tratamiento</SectionTitle>

                  

            {/* Imagen del responsable */}
            <img
              src="/images/responsable_tratamiento.png"
              alt="Datos del responsable"
              style={{ maxWidth: 400, borderRadius: 12, margin: "16px 0" }}
            />

            {/* Info cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
              <InfoCard label="Nombre comercial"    value="GenerAR" />
              <InfoCard label="Sitio web"           value="https://generar.co" />
              <InfoCard label="Correo electrónico"  value="soporte@generar.co" />
              <InfoCard label="Ciudad"              value="Cali, Valle del Cauca, Colombia" />
            </div>

            <Body>
              El Responsable del Tratamiento, en calidad de persona natural que desarrolla actividades comerciales y
              tecnológicas a través de la plataforma GenerAR (en adelante &quot;el Responsable&quot;), adopta la presente
              Política de Tratamiento de Datos Personales en cumplimiento de la Ley Estatutaria 1581 de 2012 y el
              Decreto Reglamentario 1377 de 2013.
            </Body>
          </section>

          <Divider />

          {/* ── 2. Definiciones ── */}
          <section id="seccion-2">
            <SectionTitle number="2">Definiciones</SectionTitle>
            <Body>Para efectos de la presente Política, los siguientes términos tendrán el significado que se indica:</Body>
            <DefItem term="Autorización"              def="Consentimiento previo, expreso e informado del Titular para llevar a cabo el Tratamiento de datos personales." />
            <DefItem term="Base de Datos"             def="Conjunto organizado de datos personales que sea objeto de Tratamiento." />
            <DefItem term="Dato Personal"             def="Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables." />
            <DefItem term="Dato Sensible"             def="Aquel que afecta la intimidad del Titular o cuyo uso indebido puede generar discriminación, tales como el origen racial o étnico, la orientación política, las convicciones religiosas, los datos de salud, la vida sexual, los datos biométricos, entre otros." />
            <DefItem term="Encargado del Tratamiento" def="Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, realice el Tratamiento de datos personales por cuenta del Responsable del Tratamiento." />
            <DefItem term="Responsable del Tratamiento" def="Persona natural o jurídica, pública o privada, que por sí misma o en asocio con otros, decida sobre la base de datos y/o el Tratamiento de los datos." />
            <DefItem term="Titular"                   def="Persona natural cuyos datos personales sean objeto de Tratamiento." />
            <DefItem term="Tratamiento"               def="Cualquier operación o conjunto de operaciones sobre datos personales, tales como la recolección, almacenamiento, uso, circulación o supresión." />
            <DefItem term="Transferencia"             def="Actividad de Tratamiento que implica la comunicación de datos personales dentro o fuera del territorio colombiano a un Responsable distinto del Responsable del Tratamiento." />
            <DefItem term="Transmisión"               def="Tratamiento de datos personales que implica la comunicación de los mismos dentro o fuera del territorio de la República de Colombia cuando tenga por objeto la realización de un Tratamiento por el Encargado por cuenta del Responsable." />
          </section>

          <Divider />

          {/* ── 3. Principios ── */}
          <section id="seccion-3">
            <SectionTitle number="3">Principios del Tratamiento</SectionTitle>
            <Body>El Responsable del Tratamiento aplicará los siguientes principios rectores en el manejo de los datos personales:</Body>
            <PrincipleItem code="3.1" title="legalidad"                    def="El Tratamiento de datos personales se realizará conforme a las disposiciones legales vigentes, en especial la Ley 1581 de 2012 y sus decretos reglamentarios." />
            <PrincipleItem code="3.2" title="finalidad"                    def="El Tratamiento obedecerá a una finalidad legítima informada al Titular, quien deberá ser informado sobre la misma." />
            <PrincipleItem code="3.3" title="libertad"                     def="El Tratamiento solo podrá realizarse con el consentimiento previo, expreso e informado del Titular. Los datos personales no podrán ser obtenidos o divulgados sin previa autorización." />
            <PrincipleItem code="3.4" title="veracidad o calidad"          def="La información sujeta a Tratamiento debe ser veraz, completa, exacta, actualizada, comprobable y comprensible." />
            <PrincipleItem code="3.5" title="transparencia"                def="En el Tratamiento debe garantizarse el derecho del Titular a obtener del Responsable o del Encargado información acerca de la existencia de datos que le conciernan." />
            <PrincipleItem code="3.6" title="acceso y circulación restringida" def="El Tratamiento solo podrá hacerse por personas autorizadas por el Titular y/o por las personas previstas en la ley." />
            <PrincipleItem code="3.7" title="seguridad"                    def="La información sujeta a Tratamiento se manejará con las medidas técnicas, humanas y administrativas necesarias para otorgar seguridad a los registros, evitando adulteración, pérdida, consulta, uso o acceso no autorizado." />
            <PrincipleItem code="3.8" title="confidencialidad"             def="Todas las personas que intervengan en el Tratamiento de datos personales están obligadas a garantizar la reserva de la información." />
          </section>

          <Divider />

          {/* ── 4. Datos ── */}
          <section id="seccion-4">
            <SectionTitle number="4">Datos Personales que se Recopilan</SectionTitle>
            <Body>
              En el marco de la prestación de los servicios ofrecidos a través de la plataforma GenerAR (https://generar.co),
              el Responsable recopila las siguientes categorías de datos personales:
            </Body>

            <SubTitle>4.1 Datos de identificación y contacto</SubTitle>
            <BulletList items={[
              "Nombre completo",
              "Dirección de correo electrónico",
              "Nombre de la empresa u organización",
              "Cargo o posición desempeñada",
            ]} />

            <SubTitle>4.2 Datos de uso de la plataforma</SubTitle>
            <BulletList items={[
              "Registros de acceso e interacción con la plataforma",
              "Historial de consultas y prompts enviados a la plataforma",
              "Preferencias y configuraciones del usuario",
              "Datos de navegación y comportamiento dentro de la plataforma",
              "Información sobre el dispositivo y el navegador utilizados",
              "Dirección IP y datos de geolocalización aproximada",
            ]} />

            <SubTitle>4.3 Datos de facturación y pagos</SubTitle>
            <BulletList items={[
              "Información de pago procesada a través de un proveedor certificado de pagos electrónicos, el cual aplica sus propias políticas de privacidad y seguridad bajo estándar PCI DSS.",
            ]} />

            <div style={{
              marginTop: 16, padding: 16,
              background: C.amber50, border: `1px solid ${C.amber200}`,
              borderRadius: 12, fontSize: 14, color: C.amber800, lineHeight: 1.7,
            }}>
              <span style={{ fontWeight: 700 }}>Nota: </span>
              GenerAR no recopila datos sensibles según la definición del artículo 5 de la Ley 1581 de 2012. En caso de que
              el Titular comparta voluntariamente información de esta naturaleza en el uso de la plataforma, dicha información
              será tratada con la mayor reserva y protección.
            </div>
          </section>

          <Divider />

          {/* ── 5. Finalidad ── */}
          <section id="seccion-5">
            <SectionTitle number="5">Finalidad del Tratamiento</SectionTitle>
            <Body>Los datos personales recopilados por el Responsable serán tratados para las siguientes finalidades:</Body>

            <SubTitle>5.1 Finalidades principales</SubTitle>
            <BulletList items={[
              "Prestar y gestionar los servicios ofrecidos a través de la plataforma GenerAR.",
              "Crear, administrar y mantener la cuenta del usuario en la plataforma.",
              "Procesar pagos y gestionar transacciones comerciales.",
              "Brindar soporte técnico y atención al cliente.",
              "Enviar comunicaciones relacionadas con el servicio contratado, incluyendo notificaciones operativas, actualizaciones y alertas de seguridad.",
            ]} />

            <SubTitle>5.2 Finalidades secundarias</SubTitle>
            <BulletList items={[
              "Mejorar y optimizar los servicios y funcionalidades de la plataforma.",
              "Realizar análisis estadísticos y de uso de manera agregada y anonimizada.",
              "Enviar comunicaciones comerciales, promocionales o informativas relacionadas con los servicios de GenerAR, previa autorización del Titular.",
              "Cumplir con obligaciones legales, reglamentarias o contractuales aplicables.",
              "Prevenir fraudes, garantizar la seguridad de la plataforma y proteger los derechos del Responsable y de los usuarios.",
            ]} />
          </section>

          <Divider />

          {/* ── 6. Terceros ── */}
          <section id="seccion-6">
            <SectionTitle number="6">Transferencia y Transmisión de Datos a Terceros</SectionTitle>
            <Body>
              Para la correcta prestación de los servicios, el Responsable puede compartir datos personales con los
              siguientes terceros, quienes actúan como Encargados del Tratamiento y se encuentran sujetos a sus propias
              políticas de privacidad:
            </Body>

            <ThirdPartyCard
              code="6.1" name="Procesador de pagos" role="Pagos en línea"
              detail="Proveedor certificado de procesamiento de pagos electrónicos utilizado para gestionar las transacciones económicas realizadas en la plataforma. Los datos de pago son transmitidos directamente al procesador bajo estándares internacionales de seguridad (PCI DSS). El Responsable no almacena datos de tarjetas de crédito o débito."
            />
            <ThirdPartyCard
              code="6.2" name="Proveedor de inteligencia artificial" role="Procesamiento con IA"
              detail="Proveedor especializado de modelos de inteligencia artificial que potencia las funcionalidades de generación de contenido de la plataforma GenerAR. Los datos ingresados por el usuario pueden ser procesados por los servidores de este proveedor conforme a sus políticas de uso y privacidad, bajo estándares internacionales de seguridad."
            />
            <ThirdPartyCard
              code="6.3" name="Proveedor de infraestructura en la nube" role="Almacenamiento de datos"
              detail="Proveedor certificado de infraestructura en la nube utilizado para el almacenamiento seguro de los datos de los usuarios y del historial de uso de la plataforma, bajo estándares internacionales de seguridad y disponibilidad."
            />
            <ThirdPartyCard
              code="6.4" name="Proveedor de comunicaciones" role="Envío de correos electrónicos"
              detail="Proveedor especializado en comunicaciones digitales utilizado para el envío de notificaciones, confirmaciones y comunicaciones operativas a los usuarios registrados, bajo estándares de seguridad y privacidad internacionales."
            />

            <Body>
              El Responsable garantiza que dichos terceros han suscrito compromisos contractuales de confidencialidad y
              seguridad en el tratamiento de los datos personales. Fuera de los casos mencionados, los datos no serán
              cedidos ni vendidos a terceros sin el consentimiento expreso del Titular, salvo mandato legal o judicial.
            </Body>
          </section>

          <Divider />

          {/* ── 7. Derechos ── */}
          <section id="seccion-7">
            <SectionTitle number="7">Derechos de los Titulares</SectionTitle>
            <Body>
              De conformidad con el artículo 8 de la Ley 1581 de 2012, los Titulares de datos personales tienen los
              siguientes derechos:
            </Body>
            <RightItem code="7.1" title="Derecho de acceso o consulta"          def="Conocer, actualizar y rectificar los datos personales que reposen en las bases de datos del Responsable." />
            <RightItem code="7.2" title="Derecho de corrección o actualización"  def="Solicitar la actualización o rectificación de los datos cuando estos sean inexactos, incompletos, fraccionados, induzcan a error o hayan sido objeto de tratamiento prohibido." />
            <RightItem code="7.3" title="Derecho de supresión"                   def="Solicitar la supresión de los datos personales cuando considere que los mismos no están siendo tratados conforme a los principios, derechos y garantías previstos en la Ley 1581 de 2012, o cuando hayan dejado de ser necesarios o pertinentes para la finalidad para la cual fueron recolectados." />
            <RightItem code="7.4" title="Derecho de revocación"                  def="Revocar la autorización y/o solicitar la supresión del dato cuando en el Tratamiento no se respeten los principios, derechos y garantías constitucionales y legales. La revocación del consentimiento podrá implicar la imposibilidad de continuar prestando el servicio." />
            <RightItem code="7.5" title="Derecho a presentar quejas"             def="Presentar ante la Superintendencia de Industria y Comercio (SIC) quejas por infracciones a lo dispuesto en la Ley 1581 de 2012, una vez agotado el trámite de consulta o reclamo ante el Responsable del Tratamiento." />
            <RightItem code="7.6" title="Derecho a la información"               def="Ser informado por el Responsable del uso que se dará a los datos personales, previa solicitud del Titular." />
            <RightItem code="7.7" title="Derecho de oposición"                   def="Solicitar la suspensión del Tratamiento de los datos personales en los casos en que resulte procedente según la ley." />
          </section>

          <Divider />

          {/* ── 8. Procedimiento ── */}
          <section id="seccion-8">
            <SectionTitle number="8">Procedimiento para Ejercer los Derechos</SectionTitle>
            <Body>
              Para ejercer cualquiera de los derechos descritos en la presente Política, el Titular o su representante
              legal deberá enviar una solicitud al Responsable del Tratamiento a través del siguiente canal:
            </Body>

            {/* Contact card */}
            <div style={{
              margin: "16px 0", display: "flex", alignItems: "center", gap: 16,
              background: C.primaryBg, border: `1px solid rgba(27,58,92,0.20)`,
              borderRadius: 12, padding: "16px 20px",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: C.primary,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, marginBottom: 4 }}>
                  Correo electrónico
                </p>
                <a href="mailto:soporte@generar.co" style={{ color: C.accent, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                  soporte@generar.co
                </a>
              </div>
            </div>

            <Body>La solicitud deberá contener como mínimo la siguiente información:</Body>
            <BulletList items={[
              "Nombre completo e identificación del Titular.",
              "Descripción clara y precisa de los datos personales respecto de los cuales se solicita el ejercicio del derecho.",
              "Documentos que acrediten la identidad del Titular o la representación legal, según corresponda.",
              "Dirección de notificación (física o electrónica) donde se recibirá la respuesta.",
            ]} />

            <SubTitle>8.1 Términos de respuesta</SubTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12, marginBottom: 16 }}>
              {/* Card consulta */}
              <div style={{ borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, marginTop: 0 }}>
                  Solicitudes de consulta
                </p>
                <p style={{ fontSize: 36, fontWeight: 800, color: C.primary, margin: 0, lineHeight: 1 }}>10</p>
                <p style={{ fontSize: 13, color: C.gray500, margin: "4px 0 8px" }}>días hábiles máximo</p>
                <p style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, margin: 0 }}>
                  Prorrogable hasta 5 días hábiles adicionales, informando los motivos de la demora.
                </p>
              </div>
              {/* Card reclamo */}
              <div style={{ borderRadius: 12, border: `1px solid ${C.gray200}`, padding: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, marginTop: 0 }}>
                  Solicitudes de reclamo
                </p>
                <p style={{ fontSize: 36, fontWeight: 800, color: C.primary, margin: 0, lineHeight: 1 }}>15</p>
                <p style={{ fontSize: 13, color: C.gray500, margin: "4px 0 8px" }}>días hábiles máximo</p>
                <p style={{ fontSize: 13, color: C.gray600, lineHeight: 1.6, margin: 0 }}>
                  Prorrogable hasta 8 días hábiles adicionales, informando los motivos de la demora.
                </p>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── 9. Seguridad ── */}
          <section id="seccion-9">
            <SectionTitle number="9">Medidas de Seguridad</SectionTitle>
            <Body>
              El Responsable del Tratamiento adopta las medidas técnicas, humanas y administrativas que sean necesarias
              para proteger los datos personales de los Titulares contra acceso no autorizado, pérdida, alteración,
              divulgación o destrucción. Entre las medidas implementadas se encuentran:
            </Body>
            <BulletList items={[
              "Cifrado de datos en tránsito mediante protocolos TLS/HTTPS.",
              "Almacenamiento seguro de datos a través de proveedores certificados con estándares internacionales de seguridad.",
              "Control de acceso basado en roles para el personal autorizado.",
              "Monitoreo periódico de la seguridad de los sistemas y la plataforma.",
              "Uso de procesadores de pago certificados bajo estándar PCI DSS.",
              "Revisión y actualización periódica de las políticas y procedimientos de seguridad.",
              "Capacitación y sensibilización del personal involucrado en el tratamiento de datos.",
            ]} />
            <Body>
              En caso de presentarse una vulneración de seguridad que pueda afectar los datos personales de los Titulares,
              el Responsable comunicará el incidente a los afectados y a la Superintendencia de Industria y Comercio en
              los términos establecidos por la normativa aplicable.
            </Body>
          </section>

          <Divider />

          {/* ── 10. Vigencia ── */}
          <section id="seccion-10">
            <SectionTitle number="10">Vigencia de la Política y de las Bases de Datos</SectionTitle>
            <Body>
              La presente Política de Tratamiento de Datos Personales rige a partir de su publicación en el sitio web{" "}
              <a href="https://generar.co" style={{ color: C.accent, textDecoration: "none" }}>https://generar.co</a>{" "}
              y estará vigente mientras el Responsable desarrolle las actividades relacionadas con la plataforma GenerAR.
            </Body>
            <Body>
              Los datos personales recopilados serán conservados por el tiempo que sea necesario para cumplir con las
              finalidades descritas en la presente Política o para satisfacer requerimientos legales, contractuales o
              regulatorios. Una vez cumplida la finalidad del tratamiento y vencidos los plazos legales de conservación,
              los datos serán suprimidos de forma segura de las bases de datos del Responsable.
            </Body>
            <Body>
              El Responsable se reserva el derecho de modificar la presente Política en cualquier momento, con el fin de
              adaptarla a novedades legislativas, cambios en los servicios o mejoras en los procesos de tratamiento de
              datos. Cualquier modificación será notificada a los Titulares a través del sitio web{" "}
              <a href="https://generar.co" style={{ color: C.accent, textDecoration: "none" }}>https://generar.co</a>{" "}
              con antelación razonable.
            </Body>
          </section>

        </div>

        {/* ── Legal badge ── */}
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 12, color: C.gray400 }}>
          <span>Ley 1581 de 2012</span>
          <span style={{ color: C.gray200 }}>·</span>
          <span>Decreto 1377 de 2013</span>
          <span style={{ color: C.gray200 }}>·</span>
          <span>Última actualización: 2026</span>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: C.primary, marginTop: 48 }}>
        <div style={{
          maxWidth: 896, margin: "0 auto", padding: "40px 24px",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.white, letterSpacing: "-0.02em" }}>Gener</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.accent, letterSpacing: "-0.02em" }}>AR</span>
            </div>
            <p style={{ fontSize: 12, color: C.whiteDim, margin: 0 }}>Cali, Valle del Cauca, Colombia</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <a href="mailto:soporte@generar.co" style={{ fontSize: 14, color: C.whiteMuted, textDecoration: "none" }}>
              soporte@generar.co
            </a>
            <a href="https://generar.co" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: C.accent, color: C.white, fontSize: 14, fontWeight: 600,
              padding: "10px 20px", borderRadius: 8, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Volver a generar.co
            </a>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.whiteBorder}` }}>
          <div style={{ maxWidth: 896, margin: "0 auto", padding: "16px 24px", textAlign: "center", fontSize: 11, color: C.whiteGhost }}>
            © 2026 GenerAR · Todos los derechos reservados · En cumplimiento de la Ley 1581 de 2012
          </div>
        </div>
      </footer>

    </div>
  );
}

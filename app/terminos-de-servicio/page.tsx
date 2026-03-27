import React from "react";

export default function TerminosDeServicio() {
  // ─── Design tokens ───────────────────────────────────────────────
  const C = {
    navy: "#1B3A5C",
    blue: "#2E86AB",
    blueLight: "#E8F4FA",
    bg: "#F5F8FB",
    surface: "#FFFFFF",
    ink: "#1A2535",
    inkMuted: "#4A5568",
    inkFaint: "#8A97A8",
    rule: "#D8E3EC",
    warn: "#7B4F1A",
    warnBg: "#FFF8EF",
    warnBorder: "#D4956A",
  } as const;

  // ─── Reusable style fragments ────────────────────────────────────
  const prose: React.CSSProperties = {
    color: C.inkMuted,
    fontSize: 15,
    lineHeight: 1.8,
    fontWeight: 300,
    marginBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const strong: React.CSSProperties = { fontWeight: 600, color: C.ink };

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; }
        a { color: ${C.blue}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: C.bg, minHeight: "100vh", color: C.ink }}>

        {/* ══════════════════════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════════════════════ */}
        <nav style={{
          background: C.navy,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 12px rgba(27,58,92,0.18)",
        }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              lineHeight: 1,
            }}>
              Gener
            </span>
            <span style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: C.blue,
              lineHeight: 1,
            }}>
              AR
            </span>
          </a>

          <span style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            generar.co
          </span>
        </nav>

        {/* ══════════════════════════════════════════════════════════
            HERO BAND
        ══════════════════════════════════════════════════════════ */}
        <div style={{
          background: C.navy,
          color: "#fff",
          textAlign: "center",
          padding: "72px 32px 56px",
          borderBottom: `3px solid ${C.blue}`,
        }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.blue,
            marginBottom: 16,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Documento Legal
          </p>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            marginBottom: 20,
          }}>
            Términos de Servicio
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 14,
            fontWeight: 300,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Última actualización:{" "}
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>26 de marzo de 2025</span>
            &nbsp;·&nbsp; Versión{" "}
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>1.0</span>
            &nbsp;·&nbsp; Cali, Valle del Cauca, Colombia
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════════════════ */}
        <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* Notice box */}
          <div style={{
            background: C.blueLight,
            borderLeft: `4px solid ${C.blue}`,
            borderRadius: 6,
            padding: "18px 22px",
            marginBottom: 40,
            fontSize: 14,
            color: C.navy,
            fontWeight: 400,
            lineHeight: 1.7,
          }}>
            <strong style={{ fontWeight: 600 }}>Lea este documento con atención.</strong>{" "}
            Al acceder o utilizar la plataforma GenerAR (generar.co), usted acepta quedar vinculado por estos Términos de Servicio.
            Si no está de acuerdo con alguna de las condiciones aquí establecidas, le rogamos abstenerse de usar el servicio.
          </div>

          {/* ── Table of contents ── */}
          <div style={{
            background: C.surface,
            border: `1px solid ${C.rule}`,
            borderRadius: 10,
            padding: "28px 28px 22px",
            marginBottom: 52,
          }}>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 15,
              color: C.inkMuted,
              letterSpacing: "0.04em",
              marginBottom: 16,
            }}>
              Contenido
            </p>
            <ol style={{
              paddingLeft: 20,
              columns: 2,
              columnGap: 32,
              listStyle: "decimal",
            }}>
              {[
                ["#s1", "Aceptación de los Términos"],
                ["#s2", "Descripción del Servicio"],
                ["#s3", "Registro y Cuenta de Usuario"],
                ["#s4", "Planes y Pagos"],
                ["#s5", "Política de Reembolsos"],
                ["#s6", "Uso Aceptable de la Plataforma"],
                ["#s7", "Propiedad Intelectual"],
                ["#s8", "Limitación de Responsabilidad"],
                ["#s9", "Privacidad y Datos Personales"],
                ["#s10", "Suspensión y Cancelación"],
                ["#s11", "Modificaciones al Servicio"],
                ["#s12", "Ley Aplicable y Jurisdicción"],
                ["#s13", "Contacto"],
              ].map(([href, label]) => (
                <li key={href} style={{ fontSize: 13.5, marginBottom: 6, breakInside: "avoid", color: C.inkMuted }}>
                  <a href={href} style={{ color: C.blue, textDecoration: "none" }}>{label}</a>
                </li>
              ))}
            </ol>
          </div>

          {/* ──────────────────────────────────────────────────────
              SECTION HELPER
          ────────────────────────────────────────────────────── */}
          {/* We'll render each section inline below */}

          {/* ── S1: Aceptación ── */}
          <Section id="s1" num="01" title="Aceptación de los Términos" C={C}>
            <p style={prose}>
              Estos Términos de Servicio (en adelante, "los Términos") rigen el acceso y uso de la plataforma GenerAR, disponible en{" "}
              <strong style={strong}>generar.co</strong> (en adelante, "la Plataforma"), operada por{" "}
              <Placeholder>NOMBRE DEL RESPONSABLE</Placeholder>, persona natural identificada con cédula de ciudadanía{" "}
              <Placeholder>CÉDULA</Placeholder>, domiciliada en la ciudad de Cali, Valle del Cauca, Colombia (en adelante, "el Operador").
            </p>
            <img
              src="/images/responsable_tratamiento.png"
              alt="Datos del responsable"
              style={{ maxWidth: 400, borderRadius: 12, margin: "16px 0" }}
            />
            <p style={prose}>
              Al acceder a la Plataforma, crear una cuenta, o utilizar cualquiera de sus funcionalidades, usted (en adelante, "el Usuario") declara haber leído, comprendido y aceptado íntegramente los presentes Términos, así como la Política de Datos Personales de GenerAR. Esta aceptación tiene carácter vinculante y constituye un acuerdo legalmente válido entre el Usuario y el Operador.
            </p>
            <p style={prose}>
              Si el Usuario actúa en nombre de una empresa u organización, garantiza que cuenta con las facultades necesarias para obligar a dicha entidad con los presentes Términos.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              El uso de la Plataforma está restringido a personas mayores de dieciocho (18) años o que cuenten con capacidad legal plena de acuerdo con la legislación colombiana.
            </p>
          </Section>

          {/* ── S2: Descripción ── */}
          <Section id="s2" num="02" title="Descripción del Servicio" C={C}>
            <p style={prose}>
              GenerAR es una plataforma de software como servicio (SaaS) que emplea tecnología de Inteligencia Artificial (IA) para asistir a profesionales y organizaciones en la generación de Análisis de Riesgos en Higiene, Seguridad y Medio Ambiente (HSE). La Plataforma permite a los Usuarios crear, personalizar, gestionar y exportar documentos de análisis de riesgo a partir de información ingresada por el propio Usuario.
            </p>
            <p style={prose}>Entre las funcionalidades principales se incluyen, sin limitarse a ellas:</p>
            <InlineList C={C} items={[
              "Generación automatizada de Análisis de Riesgos HSE mediante IA.",
              "Personalización de plantillas y parámetros de análisis.",
              "Almacenamiento y gestión de documentos generados.",
              "Exportación de informes en formatos digitales.",
              "Panel de usuario con historial de análisis.",
            ]} />
            <p style={{ ...prose, marginBottom: 0 }}>
              El Operador se reserva el derecho de actualizar, ampliar o modificar las funcionalidades del servicio sin previo aviso, en los términos previstos en la Sección 11 de estos Términos.
            </p>
          </Section>

          {/* ── S3: Registro ── */}
          <Section id="s3" num="03" title="Registro y Cuenta de Usuario" C={C}>
            <p style={prose}>
              Para acceder a las funcionalidades de GenerAR, el Usuario deberá crear una cuenta proporcionando información veraz, completa y actualizada. El Usuario es el único responsable de la exactitud de los datos suministrados en el proceso de registro.
            </p>
            <p style={prose}>El Usuario se compromete a:</p>
            <InlineList C={C} items={[
              "Mantener la confidencialidad de sus credenciales de acceso (usuario y contraseña).",
              "No compartir su cuenta ni sus credenciales con terceros.",
              <>Notificar de forma inmediata al Operador ante cualquier uso no autorizado de su cuenta a través del correo <strong style={strong}>soporte@generar.co</strong>.</>,
              "Actualizar su información de perfil cuando esta sufra variaciones.",
            ]} />
            <p style={prose}>
              El Operador no será responsable de ningún daño o pérdida derivada del incumplimiento por parte del Usuario de sus obligaciones de confidencialidad. Toda actividad realizada desde una cuenta se presumirá efectuada por el titular de la misma.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              Se permite una cuenta por Usuario. La creación de cuentas múltiples o fraudulentas constituye causal de suspensión inmediata.
            </p>
          </Section>

          {/* ── S4: Planes y Pagos ── */}
          <Section id="s4" num="04" title="Planes y Pagos" C={C}>
            <p style={prose}>
              GenerAR ofrece los siguientes planes de suscripción mensual, facturados en pesos colombianos (COP) e IVA incluido según la normativa tributaria vigente:
            </p>

            {/* Plans grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, margin: "20px 0 24px" }}>
              {[
                { name: "Starter", price: "$79.900", featured: false },
                { name: "Professional", price: "$179.900", featured: true },
                { name: "Business", price: "$399.900", featured: false },
              ].map(({ name, price, featured }) => (
                <div key={name} style={{
                  background: featured ? C.blueLight : C.surface,
                  border: `1.5px solid ${featured ? C.blue : C.rule}`,
                  borderRadius: 10,
                  padding: "20px 16px",
                  textAlign: "center",
                }}>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.inkMuted,
                    marginBottom: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {name}
                  </p>
                  <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 28,
                    color: C.navy,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}>
                    {price}
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: C.inkFaint,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 300,
                  }}>
                    COP / mes
                  </p>
                </div>
              ))}
            </div>

            <p style={prose}>
              Las características, límites de uso y beneficios específicos de cada plan se describen en la página de precios de generar.co y pueden ser modificados con previo aviso al Usuario.
            </p>
            <p style={prose}>
              El pago se realizará de forma anticipada al inicio de cada período de facturación mensual, a través de los medios de pago habilitados en la Plataforma. La suscripción se renovará automáticamente de forma mensual, salvo que el Usuario la cancele antes del inicio del siguiente ciclo.
            </p>
            <p style={prose}>
              El Operador utiliza pasarelas de pago de terceros para procesar las transacciones. Los datos de tarjeta u otros instrumentos de pago no son almacenados directamente por el Operador.
            </p>
            <Callout C={C}>
              <strong style={{ fontWeight: 600 }}>Importante:</strong> Los precios indicados están sujetos a modificaciones. El Operador notificará al Usuario con al menos quince (15) días calendario de anticipación cualquier cambio en las tarifas de los planes activos.
            </Callout>
          </Section>

          {/* ── S5: Reembolsos ── */}
          <Section id="s5" num="05" title="Política de Reembolsos" C={C}>
            <p style={prose}>
              Con carácter general, los pagos realizados a GenerAR no son reembolsables, dado que el acceso al servicio se habilita de forma inmediata tras la confirmación del pago y el servicio se presta de manera continua durante el período contratado.
            </p>
            <p style={prose}>No obstante lo anterior, el Operador considerará solicitudes de reembolso únicamente en los siguientes casos excepcionales:</p>
            <InlineList C={C} items={[
              <><strong style={strong}>Falla técnica grave:</strong> cuando la Plataforma presente una interrupción total o sustancial del servicio por un período continuo superior a setenta y dos (72) horas dentro del ciclo de facturación vigente, imputable directamente al Operador y no a causas ajenas (fuerza mayor, servicios de terceros, incidentes de infraestructura fuera del control del Operador).</>,
              <><strong style={strong}>Cobro duplicado:</strong> cuando se verifique que se realizaron dos o más cargos idénticos al Usuario en el mismo período de facturación.</>,
            ]} />
            <p style={prose}>
              Para solicitar un reembolso, el Usuario deberá enviar su solicitud debidamente sustentada a <strong style={strong}>soporte@generar.co</strong> dentro de los diez (10) días calendario siguientes al evento que origina la solicitud. El Operador evaluará el caso y comunicará su decisión dentro de los quince (15) días hábiles siguientes a la recepción de la solicitud completa.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              La cancelación voluntaria de la suscripción no genera derecho a reembolso proporcional por el tiempo no utilizado del período en curso.
            </p>
          </Section>

          {/* ── S6: Uso Aceptable ── */}
          <Section id="s6" num="06" title="Uso Aceptable de la Plataforma" C={C}>
            <p style={prose}>
              El Usuario se obliga a utilizar GenerAR de conformidad con la ley colombiana, los presentes Términos y las buenas prácticas de uso de servicios digitales. En particular, el Usuario se compromete a no:
            </p>
            <InlineList C={C} items={[
              "Utilizar la Plataforma para fines ilegales, fraudulentos o contrarios al orden público.",
              "Ingresar información falsa, engañosa o que induzca a error en los análisis de riesgo generados.",
              "Intentar acceder sin autorización a los sistemas, servidores o bases de datos del Operador.",
              "Realizar ingeniería inversa, descompilar, desensamblar o intentar obtener el código fuente de la Plataforma.",
              "Reproducir, vender, sublicenciar o distribuir el acceso a la Plataforma a terceros sin autorización escrita del Operador.",
              "Introducir virus, malware, código malicioso o cualquier elemento que pueda dañar los sistemas del Operador o de otros usuarios.",
              "Realizar usos que generen una carga desproporcionada o abusiva sobre la infraestructura de la Plataforma.",
              "Suplantar la identidad de otras personas u organizaciones al usar el servicio.",
            ]} />
            <p style={{ ...prose, marginBottom: 0 }}>
              El incumplimiento de cualquiera de estas obligaciones podrá dar lugar a la suspensión o cancelación inmediata de la cuenta, sin perjuicio de las acciones legales a que hubiere lugar.
            </p>
          </Section>

          {/* ── S7: Propiedad Intelectual ── */}
          <Section id="s7" num="07" title="Propiedad Intelectual" C={C}>
            <p style={prose}>
              <strong style={strong}>Propiedad del Operador.</strong> La Plataforma GenerAR, incluyendo su diseño, código fuente, algoritmos, interfaces, marcas, logotipos, textos, metodologías y demás elementos que la componen, es de propiedad exclusiva del Operador y se encuentra protegida por las leyes colombianas e internacionales de propiedad intelectual. El acceso a la Plataforma no confiere al Usuario ningún derecho de propiedad sobre estos elementos.
            </p>
            <p style={prose}>
              <strong style={strong}>Licencia de uso.</strong> El Operador otorga al Usuario una licencia personal, intransferible, no exclusiva y revocable para acceder y utilizar la Plataforma durante la vigencia de su suscripción activa, únicamente para los fines descritos en la Sección 2 de estos Términos.
            </p>
            <p style={prose}>
              <strong style={strong}>Contenido del Usuario.</strong> El Usuario conserva la titularidad sobre la información que ingresa en la Plataforma para generar sus análisis. Sin embargo, el Usuario autoriza al Operador a procesar dicha información de manera automatizada con el único fin de prestar el servicio. El Operador no utilizará el contenido del Usuario con fines distintos a la prestación del servicio, salvo anonimización para mejora de modelos, en los términos de la Política de Datos Personales.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              <strong style={strong}>Documentos generados.</strong> Los análisis de riesgo generados por la IA de GenerAR a partir de los datos del Usuario son de uso libre del Usuario para sus operaciones internas. No obstante, el Usuario no podrá presentar dichos documentos como de su autoría intelectual exclusiva ni comercializarlos como producto propio derivado de la Plataforma.
            </p>
          </Section>

          {/* ── S8: Limitación de Responsabilidad ── */}
          <Section id="s8" num="08" title="Limitación de Responsabilidad" C={C}>
            <Callout C={C}>
              <strong style={{ fontWeight: 600 }}>Advertencia esencial:</strong> Los Análisis de Riesgos HSE generados por GenerAR son documentos de apoyo elaborados mediante Inteligencia Artificial. No constituyen asesoría profesional en seguridad, salud ocupacional o medio ambiente, ni reemplazan el criterio de un profesional competente y certificado.
            </Callout>
            <p style={prose}>
              <strong style={strong}>Herramienta de apoyo.</strong> Los análisis de riesgo producidos por la Plataforma son una herramienta de asistencia y orientación. El Usuario es el único responsable de revisar, validar, ajustar y aprobar dichos documentos antes de implementarlos en sus operaciones, proyectos o procesos. GenerAR no garantiza que los análisis generados sean completos, exactos, suficientes o adecuados para situaciones específicas.
            </p>
            <p style={prose}>
              <strong style={strong}>Responsabilidad del Usuario.</strong> Corresponde exclusivamente al Usuario:
            </p>
            <InlineList C={C} items={[
              "Verificar que el análisis generado cumple con la normativa HSE aplicable a su actividad y jurisdicción.",
              "Someter el documento a revisión por parte del personal competente o autoridades correspondientes.",
              "Asumir las consecuencias de la implementación de los análisis en sus operaciones.",
            ]} />
            <p style={prose}>
              <strong style={strong}>Exclusión de garantías.</strong> La Plataforma se presta "tal como está" y "según disponibilidad". El Operador no garantiza que el servicio sea ininterrumpido, libre de errores, o que los resultados sean precisos en todas las circunstancias.
            </p>
            <p style={prose}>
              <strong style={strong}>Límite de indemnización.</strong> En ningún caso la responsabilidad total del Operador frente al Usuario, por cualquier concepto derivado del uso de la Plataforma, excederá el monto total efectivamente pagado por el Usuario durante los tres (3) meses inmediatamente anteriores al evento que origina el reclamo.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              El Operador no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación lucro cesante, pérdida de datos, daño reputacional o interrupción de actividades, aun cuando hubiera sido advertido de la posibilidad de tales daños.
            </p>
          </Section>

          {/* ── S9: Privacidad ── */}
          <Section id="s9" num="09" title="Privacidad y Datos Personales" C={C}>
            <p style={prose}>
              El tratamiento de los datos personales del Usuario se rige por la Política de Datos Personales de GenerAR, disponible en <strong style={strong}>generar.co/privacidad</strong>, la cual forma parte integral de estos Términos y está elaborada en cumplimiento de la Ley 1581 de 2012 (Ley de Protección de Datos Personales de Colombia) y sus decretos reglamentarios.
            </p>
            <p style={prose}>
              Al aceptar estos Términos, el Usuario otorga su consentimiento expreso e informado para el tratamiento de sus datos personales conforme a los fines, condiciones y mecanismos descritos en dicha Política.
            </p>
            <p style={prose}>
              En términos generales, el Operador recopila únicamente los datos necesarios para la prestación del servicio, no comercializa datos personales con terceros y aplica medidas de seguridad razonables para su protección.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              El Usuario podrá ejercer en cualquier momento sus derechos de acceso, corrección, supresión, portabilidad y revocación del consentimiento mediante solicitud enviada a <strong style={strong}>soporte@generar.co</strong>.
            </p>
          </Section>

          {/* ── S10: Suspensión y Cancelación ── */}
          <Section id="s10" num="10" title="Suspensión y Cancelación de Cuentas" C={C}>
            <p style={prose}>
              <strong style={strong}>Cancelación por el Usuario.</strong> El Usuario podrá cancelar su suscripción en cualquier momento desde el panel de su cuenta o mediante solicitud a <strong style={strong}>soporte@generar.co</strong>. La cancelación tendrá efecto al término del período de facturación en curso, sin que proceda reembolso proporcional.
            </p>
            <p style={prose}>
              <strong style={strong}>Suspensión o cancelación por el Operador.</strong> El Operador podrá suspender o cancelar el acceso del Usuario a la Plataforma, con o sin previo aviso según la gravedad del caso, cuando:
            </p>
            <InlineList C={C} items={[
              "El Usuario incumpla cualquiera de las disposiciones de estos Términos.",
              "Se detecte uso fraudulento, abusivo o contrario a la ley.",
              "El pago de la suscripción no sea procesado exitosamente tras los intentos de cobro correspondientes.",
              "Una autoridad competente lo ordene.",
              "El Operador discontinúe el servicio, con previo aviso de al menos treinta (30) días calendario.",
            ]} />
            <p style={{ ...prose, marginBottom: 0 }}>
              <strong style={strong}>Efectos de la cancelación.</strong> Ante la cancelación de una cuenta, el Usuario perderá el acceso a la Plataforma y a los documentos almacenados en ella. Se recomienda al Usuario exportar o respaldar sus análisis antes de proceder a la cancelación. El Operador podrá conservar cierta información del Usuario en cumplimiento de obligaciones legales, conforme a lo indicado en la Política de Datos Personales.
            </p>
          </Section>

          {/* ── S11: Modificaciones ── */}
          <Section id="s11" num="11" title="Modificaciones al Servicio y a los Términos" C={C}>
            <p style={prose}>
              El Operador se reserva el derecho de modificar, actualizar, suspender temporalmente o descontinuar total o parcialmente el servicio o sus funcionalidades en cualquier momento, con el objetivo de mejorar la Plataforma, cumplir con requerimientos legales o por razones operativas.
            </p>
            <p style={prose}>
              Las modificaciones a los presentes Términos serán notificadas al Usuario mediante alguno de los siguientes mecanismos: aviso en la Plataforma, correo electrónico a la dirección registrada, o publicación de la versión actualizada en generar.co con la indicación de la fecha de vigencia.
            </p>
            <p style={prose}>
              Los cambios entrarán en vigor a los quince (15) días calendario siguientes a su notificación, salvo que la naturaleza del cambio requiera aplicación inmediata por razones legales. El uso continuado de la Plataforma después del período de notificación se entenderá como aceptación de los términos modificados.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              Si el Usuario no está de acuerdo con las modificaciones, deberá cancelar su suscripción antes de la fecha de entrada en vigor de los cambios.
            </p>
          </Section>

          {/* ── S12: Ley Aplicable ── */}
          <Section id="s12" num="12" title="Ley Aplicable y Jurisdicción" C={C}>
            <p style={prose}>
              Los presentes Términos de Servicio se rigen exclusivamente por las leyes de la República de Colombia, incluyendo pero sin limitarse al Código de Comercio, el Estatuto del Consumidor (Ley 1480 de 2011), la Ley 1581 de 2012 y demás normativa aplicable a los servicios digitales y contratos electrónicos.
            </p>
            <p style={{ ...prose, marginBottom: 0 }}>
              Ante cualquier controversia, reclamación o diferencia que surja en relación con la interpretación, ejecución o incumplimiento de estos Términos, las partes acuerdan someterse, en primer lugar, a una instancia de arreglo directo. Si en el término de treinta (30) días hábiles no se alcanza un acuerdo, las partes se someterán a la jurisdicción ordinaria de los Jueces y Tribunales competentes de la ciudad de Cali, Valle del Cauca, Colombia, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
            </p>
          </Section>

          {/* ── S13: Contacto ── */}
          <Section id="s13" num="13" title="Contacto" C={C}>
            <p style={prose}>
              Para cualquier consulta, solicitud, reclamo o notificación relacionada con estos Términos de Servicio o con el funcionamiento de la Plataforma, el Usuario podrá contactar al Operador a través de los siguientes canales:
            </p>
            <InlineList C={C} items={[
              <><strong style={strong}>Correo electrónico:</strong> soporte@generar.co</>,
              <><strong style={strong}>Sitio web:</strong> generar.co</>,
              <><strong style={strong}>Ciudad:</strong> Cali, Valle del Cauca, Colombia</>,
              <><strong style={strong}>Responsable:</strong>{" "}<Placeholder>NOMBRE DEL RESPONSABLE</Placeholder>, C.C.{" "}<Placeholder>CÉDULA</Placeholder></>,
            ]} />
            <p style={{ ...prose, marginBottom: 0 }}>
              El Operador se compromete a dar respuesta a las solicitudes dentro de los plazos establecidos por la normativa colombiana o, en su defecto, en un término razonable no superior a quince (15) días hábiles.
            </p>

            {/* Back to top */}
            <a
              href="#"
              style={{
                display: "inline-block",
                marginTop: 28,
                fontSize: 13,
                color: C.blue,
                textDecoration: "none",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              ↑ Volver al inicio
            </a>
          </Section>

        </main>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <footer style={{
          background: C.navy,
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
          padding: "40px 24px",
          fontSize: 13,
          fontWeight: 300,
          lineHeight: 2.2,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <p>
            <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>GenerAR</span>
            {" "}·{" "}
            <a href="https://generar.co" style={{ color: C.blue, textDecoration: "none" }}>generar.co</a>
            {" "}·{" "}
            <a href="mailto:soporte@generar.co" style={{ color: C.blue, textDecoration: "none" }}>soporte@generar.co</a>
          </p>
          <p>Cali, Valle del Cauca, Colombia · Persona Natural</p>
          <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} GenerAR. Todos los derechos reservados.
          </p>
        </footer>

      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface Colors {
  navy: string;
  blue: string;
  blueLight: string;
  bg: string;
  surface: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  rule: string;
  warn: string;
  warnBg: string;
  warnBorder: string;
}

function Section({
  id,
  num,
  title,
  children,
  C,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
  C: Colors;
}) {
  return (
    <section
      id={id}
      style={{ marginBottom: 52, scrollMarginTop: 80 }}
    >
      {/* Section header */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: `1.5px solid ${C.rule}`,
      }}>
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 32,
          color: C.rule,
          lineHeight: 1,
          flexShrink: 0,
          minWidth: 44,
          userSelect: "none",
        }}>
          {num}
        </span>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22,
          letterSpacing: "-0.02em",
          color: C.navy,
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function InlineList({ items, C }: { items: React.ReactNode[]; C: Colors }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "12px 0" }}>
      {items.map((item, i) => (
        <li key={i} style={{
          paddingLeft: 20,
          position: "relative",
          color: "#4A5568",
          fontSize: 15,
          fontWeight: 300,
          lineHeight: 1.75,
          marginBottom: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            color: C.blue,
            fontWeight: 500,
            lineHeight: 1.75,
          }}>—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Callout({ children, C }: { children: React.ReactNode; C: Colors }) {
  return (
    <div style={{
      background: C.warnBg,
      border: `1.5px solid ${C.warnBorder}`,
      borderRadius: 8,
      padding: "14px 18px",
      margin: "16px 0",
      fontSize: 14,
      color: C.warn,
      lineHeight: 1.7,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {children}
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: "#EEF2FF",
      border: "1px dashed #93A8D4",
      borderRadius: 4,
      padding: "1px 7px",
      fontSize: 13,
      color: "#3D5A9E",
      fontStyle: "italic",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 400,
    }}>
      [{children}]
    </span>
  );
}

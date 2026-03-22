export const COLORS = {
  navy: "#1E3A8A",
  blue: "#2563EB",
  cyan: "#06B6D4",
  orange: "#F97316",
  gray: "#F1F5F9",
  text: "#334155"
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #EEF2FF; margin: 0; padding: 0; color: ${COLORS.text}; }
    .outer { padding: 40px 20px; }
    .container { max-width: 580px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(30,58,138,0.12); }
    .header { background: linear-gradient(135deg, ${COLORS.navy} 0%, #1d4ed8 100%); padding: 40px 40px 32px; text-align: center; position: relative; }
    .header-accent { position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: rgba(6,182,212,0.15); border-radius: 0 0 0 120px; }
    .logo-text { color: white; font-size: 26px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px; }
    .logo-text span { color: ${COLORS.cyan}; }
    .tagline { color: rgba(255,255,255,0.6); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
    .content { padding: 44px 40px; }
    .greeting { font-size: 26px; font-weight: 900; color: ${COLORS.navy}; margin: 0 0 16px; line-height: 1.2; }
    .body-text { font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px; }
    .cta-box { background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border: 1px solid #BFDBFE; border-radius: 16px; padding: 28px; margin: 28px 0; text-align: center; }
    .cta-label { font-size: 11px; font-weight: 800; color: #3B82F6; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, ${COLORS.blue} 0%, #1d4ed8 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; letter-spacing: -0.3px; box-shadow: 0 8px 20px rgba(37,99,235,0.35); }
    .button-orange { background: linear-gradient(135deg, ${COLORS.orange} 0%, #ea580c 100%); box-shadow: 0 8px 20px rgba(249,115,22,0.35); }
    .steps { margin: 28px 0; }
    .step { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; padding: 14px 16px; background: #F8FAFC; border-radius: 12px; border-left: 3px solid ${COLORS.blue}; }
    .step-num { width: 26px; height: 26px; background: ${COLORS.blue}; color: white; border-radius: 50%; font-size: 12px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-text { font-size: 14px; color: #475569; line-height: 1.5; font-weight: 500; }
    .step-title { font-weight: 700; color: ${COLORS.navy}; }
    .divider { height: 1px; background: #E2E8F0; margin: 28px 0; }
    .small { font-size: 12px; color: #94a3b8; line-height: 1.6; }
    .link-text { color: ${COLORS.blue}; word-break: break-all; font-size: 12px; }
    .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 28px 40px; text-align: center; }
    .footer-logo { color: ${COLORS.navy}; font-size: 14px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px; }
    .footer-text { font-size: 11px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
<div class="outer">
  <div class="container">
    <div class="header">
      <div class="header-accent"></div>
      <div class="logo-text">FACULTY<span>MATCH</span></div>
      <div class="tagline">Conectando Talento Académico Global</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="footer-logo">FACULTYMATCH</div>
      <div class="footer-text">
        &copy; 2026 FacultyMatch Network &mdash; Elevando los estándares de la educación superior global.<br>
        Si no solicitaste este correo, puedes ignorarlo de forma segura.
      </div>
    </div>
  </div>
</div>
</body>
</html>
`;

export const getFacultyConfirmEmail = (name: string, confirmLink: string) => baseTemplate(`
  <div class="greeting">¡Bienvenido, ${name}!</div>
  <p class="body-text">
    Ya casi estás dentro. Solo necesitamos confirmar tu correo electrónico para activar tu cuenta y empezar a conectarte con instituciones universitarias de todo el mundo.
  </p>

  <div class="cta-box">
    <div class="cta-label">Paso siguiente</div>
    <p style="font-size:14px;color:#475569;margin:0 0 18px;">Haz clic en el botón para confirmar tu cuenta y acceder a tu dashboard de docente.</p>
    <a href="${confirmLink}" class="button">Confirmar mi cuenta &rarr;</a>
  </div>

  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-text"><span class="step-title">Confirma tu email</span><br>Haz clic en el botón de arriba para activar tu acceso.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-text"><span class="step-title">Completa tu perfil</span><br>Añade tu foto, experiencia, áreas de especialidad y preferencias.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-text"><span class="step-title">Empieza a recibir ofertas</span><br>Tu perfil estará visible para instituciones verificadas de todo el mundo.</div>
    </div>
  </div>

  <div class="divider"></div>
  <p class="small">Si el botón no funciona, copia este enlace en tu navegador:</p>
  <p class="link-text">${confirmLink}</p>
`);

export const getFacultyWelcomeEmail = (name: string) => baseTemplate(`
  <div class="greeting">¡Tu perfil está activo, ${name}!</div>
  <p class="body-text">
    Ya formas parte de la red global de talento académico más exclusiva. Ahora solo queda completar tu perfil para maximizar tu visibilidad ante las mejores instituciones.
  </p>
  <div class="cta-box">
    <div class="cta-label">Accede a tu dashboard</div>
    <p style="font-size:14px;color:#475569;margin:0 0 18px;">Completa tu perfil, sube tu CV y configura tus preferencias de contacto.</p>
    <a href="https://facultymatch.app/app/faculty" class="button">Ir a mi perfil &rarr;</a>
  </div>
  <div class="steps">
    <div class="step">
      <div class="step-num">✓</div>
      <div class="step-text"><span class="step-title">Perfil creado</span><br>Tu cuenta ha sido registrada correctamente.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-text"><span class="step-title">Completa tus datos</span><br>Añade áreas de especialidad, idiomas, experiencia docente y bio profesional.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-text"><span class="step-title">Sé visible</span><br>Tu perfil aparecerá en búsquedas de instituciones universitarias verificadas.</div>
    </div>
  </div>
  <p class="body-text" style="margin-top:24px;">Si tienes alguna pregunta, responde directamente a este correo. Nuestro equipo estará encantado de ayudarte.</p>
`);

export const getInstitutionWelcomeEmail = (name: string, institution: string) => baseTemplate(`
  <div class="greeting">Bienvenido a FacultyMatch, ${name}</div>
  <p class="body-text">
    Hemos activado la cuenta institucional para <strong>${institution}</strong>. Ya puedes empezar a explorar nuestro repositorio de talento académico verificado.
  </p>
  <div class="cta-box">
    <div class="cta-label">Empieza a buscar docentes</div>
    <p style="font-size:14px;color:#475569;margin:0 0 18px;">Accede al buscador de perfiles, aplica filtros por área, idioma y modalidad.</p>
    <a href="https://facultymatch.app/app/institution" class="button button-orange">Buscar Docentes &rarr;</a>
  </div>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-text"><span class="step-title">Completa el perfil institucional</span><br>Añade el nombre, logo y datos de contacto de tu institución.</div>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-text"><span class="step-title">Busca y filtra talento</span><br>Accede al directorio completo con filtros por área, idioma y modalidad.</div>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <div class="step-text"><span class="step-title">Contacta directamente</span><br>Envía solicitudes de colaboración y guarda tus perfiles favoritos.</div>
    </div>
  </div>
  <p class="body-text" style="margin-top:24px;">Gracias por confiar en FacultyMatch para construir los claustros de excelencia de tu institución.</p>
`);

export const getConfirmEmail = (link: string) => baseTemplate(`
  <div class="greeting">Confirma tu cuenta</div>
  <p class="body-text">Gracias por unirte a FacultyMatch. Confirma tu dirección de correo para activar tu cuenta.</p>
  <div class="cta-box">
    <a href="${link}" class="button">Confirmar mi cuenta &rarr;</a>
  </div>
  <div class="divider"></div>
  <p class="small">Si el botón no funciona, copia este enlace en tu navegador:</p>
  <p class="link-text">${link}</p>
`);

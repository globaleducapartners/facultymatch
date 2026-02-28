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
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${COLORS.gray}; margin: 0; padding: 0; color: ${COLORS.text}; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: ${COLORS.navy}; padding: 40px; text-align: center; }
    .content { padding: 40px; line-height: 1.6; }
    .footer { background: #fafafa; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 16px 32px; background: ${COLORS.blue}; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
    .logo { color: white; font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px; }
    .tagline { color: ${COLORS.cyan}; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TALENTIA</div>
      <div class="tagline">Faculty Network</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; 2026 Talentia Faculty Network. <br>
      Elevando los estándares de la educación superior global.
    </div>
  </div>
</body>
</html>
`;

export const getFacultyWelcomeEmail = (name: string) => baseTemplate(`
  <h1 style="color: ${COLORS.navy}; font-size: 28px; margin-bottom: 20px;">¡Bienvenido a Talentia, ${name}!</h1>
  <p>Tu perfil docente ha sido creado con éxito. Ahora formas parte de la red global de talento académico más exclusiva.</p>
  <p>Para empezar a recibir oportunidades de instituciones líderes, te recomendamos:</p>
  <ul>
    <li>Completar tu dossier académico con áreas y subáreas.</li>
    <li>Subir tu CV y evidencias de investigación.</li>
    <li>Configurar tus reglas de visibilidad y bloqueos.</li>
  </ul>
  <a href="https://talentia.education/login" class="button" style="background: ${COLORS.blue}">Completar mi perfil</a>
  <p style="margin-top: 30px; font-size: 14px;">Si tienes alguna duda, nuestro equipo de soporte académico está a tu disposición.</p>
`);

export const getInstitutionWelcomeEmail = (name: string, institution: string) => baseTemplate(`
  <h1 style="color: ${COLORS.navy}; font-size: 28px; margin-bottom: 20px;">Bienvenido a Talentia, ${name}</h1>
  <p>Hemos activado la cuenta institucional para <strong>${institution}</strong>.</p>
  <p>Ya puedes empezar a explorar nuestro repositorio de talento verificado y construir claustros de excelencia para tus programas.</p>
  <p>Tu cuenta incluye:</p>
  <ul>
    <li>Acceso al directorio global de docentes.</li>
    <li>Búsqueda avanzada por áreas y especialidades.</li>
    <li>Creación de shortlists para nuevos programas.</li>
  </ul>
  <a href="https://talentia.education/login" class="button" style="background: ${COLORS.orange}">Buscar Docentes</a>
  <p style="margin-top: 30px; font-size: 14px;">Has iniciado tu periodo de prueba Essential de 30 días.</p>
`);

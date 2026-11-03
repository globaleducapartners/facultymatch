// Plantilla de carta sobria para envíos desde /control/mailing: sin botones ni
// bandas de color, tipografía con serifa y una sola columna estrecha. Para
// comunicaciones personales y de tono institucional.
const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildLetterHtml(subject: string, text: string): string {
  const linked = escapeHtml(text).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#1B4FD8;text-decoration:underline;word-break:break-all;">$1</a>'
  );
  const paragraphs = linked
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 20px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;">
<tr><td align="center" style="padding:40px 20px 48px;">
  <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
    <tr><td style="padding:0 0 24px;border-bottom:1px solid #D9DFEA;">
      <img src="https://www.facultymatch.app/icon-192.png" width="24" height="24" alt="" style="vertical-align:middle;border-radius:5px;margin-right:8px;">
      <span style="font-family:-apple-system,'Segoe UI',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.3px;color:#0D2240;vertical-align:middle;">facultymatch</span>
    </td></tr>
    <tr><td style="padding:32px 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.75;color:#1F2937;">
      ${paragraphs}
    </td></tr>
    <tr><td style="padding:20px 0 0;border-top:1px solid #D9DFEA;font-family:-apple-system,'Segoe UI',Arial,sans-serif;font-size:12px;line-height:1.6;color:#8A94A8;">
      FacultyMatch · Grupo Global Educa SL · <a href="https://www.facultymatch.app" style="color:#8A94A8;">www.facultymatch.app</a><br>
      Recibes este mensaje porque tienes una cuenta en FacultyMatch. Si prefieres no recibir más mensajes como este, responde con la palabra «baja» y lo gestionamos.
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

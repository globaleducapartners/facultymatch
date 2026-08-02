import { Resend } from 'resend';
import { getFacultyWelcomeEmail, getInstitutionWelcomeEmail, getFacultyConfirmEmail, getActivationEmail } from './templates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || 'FacultyMatch <noreply@facultymatch.app>';

export async function sendWelcomeEmail(email: string, name: string, role: string, institution?: string) {
  const subject = role === 'faculty'
    ? `¡Bienvenido a FacultyMatch, ${name}! Tu perfil docente está listo`
    : `Bienvenido a FacultyMatch | Cuenta institucional de ${institution}`;

  const html = role === 'faculty'
    ? getFacultyWelcomeEmail(name)
    : getInstitutionWelcomeEmail(name, institution || '');

  console.log(`[EMAIL] Sending welcome to ${email}: ${subject}`);

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({ from: FROM, to: email, subject, html });
      if (error) console.error('Resend error:', error);
      return { data, error };
    } catch (e) {
      console.error('Email service failed:', e);
    }
  } else {
    console.warn('RESEND_API_KEY not set. Email skipped.');
  }
}

export async function sendConfirmationEmail(email: string, name: string, confirmLink: string) {
  const subject = '¡Confirma tu correo para activar tu cuenta en FacultyMatch!';
  const html = getFacultyConfirmEmail(name, confirmLink);

  console.log(`[EMAIL] Sending confirmation to ${email}`);

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({ from: FROM, to: email, subject, html });
      if (error) console.error('Resend confirmation error:', error);
      return { data, error };
    } catch (e) {
      console.error('Confirmation email failed:', e);
    }
  }
}

// Compartido por src/app/app/institution/page.tsx y .../institution/profile/page.tsx
// (las dos pantallas de edición de perfil institucional) — antes cada una
// tenía su propia copia casi idéntica de este email.
export async function sendInstitutionProfileUpdatedEmail(email: string, institutionName: string) {
  const subject = 'Perfil institucional actualizado — FacultyMatch';
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;max-width:600px;">
<tr><td style="background:#0B1220;padding:24px 40px;text-align:center;border-radius:16px 16px 0 0;">
  <span style="color:#fff;font-size:20px;font-weight:900;">FACULTY<span style="color:#2563EB;">MATCH</span></span>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 12px;color:#0B1220;font-size:22px;font-weight:900;">Perfil actualizado correctamente</h2>
  <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
    Hemos guardado los cambios en el perfil de <strong style="color:#0B1220;">${institutionName}</strong>.
  </p>
  <a href="https://www.facultymatch.app/app/institution" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;">
    Ver mi dashboard →
  </a>
</td></tr>
<tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
  <p style="margin:0;font-size:11px;color:#94a3b8;">FacultyMatch · www.facultymatch.app</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  if (resend) {
    resend.emails.send({ from: FROM, to: [email], subject, html })
      .catch(e => console.warn('[sendInstitutionProfileUpdatedEmail] failed:', e));
  }
}

export async function sendActivationEmail(email: string, name: string, activationLink: string) {
  const subject = `¡Bienvenido a FacultyMatch, ${name}! Activa tu cuenta`;
  const html = getActivationEmail(name, activationLink);

  console.log(`[EMAIL] Sending activation to ${email}`);

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({ from: FROM, to: email, subject, html });
      if (error) console.error('Resend activation error:', error);
      return { data, error };
    } catch (e) {
      console.error('Activation email failed:', e);
    }
  } else {
    console.warn('RESEND_API_KEY not set. Activation email skipped.');
  }
}

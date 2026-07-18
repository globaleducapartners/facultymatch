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

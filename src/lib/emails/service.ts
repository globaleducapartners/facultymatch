import { Resend } from 'resend';
import { getFacultyWelcomeEmail, getInstitutionWelcomeEmail } from './templates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWelcomeEmail(email: string, name: string, role: string, institution?: string) {
  const subject = role === 'faculty' 
    ? '¡Bienvenido a Talentia! Tu perfil docente está listo'
    : `Bienvenido a Talentia | Cuenta institucional de ${institution}`;
  
  const html = role === 'faculty'
    ? getFacultyWelcomeEmail(name)
    : getInstitutionWelcomeEmail(name, institution || '');

  console.log(`[EMAIL MOCK] Sending to ${email}: ${subject}`);
  
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Talentia <no-reply@talentia.education>',
        to: email,
        subject,
        html,
      });
      
      if (error) {
        console.error('Error sending email via Resend:', error);
      }
      return { data, error };
    } catch (e) {
      console.error('Email service failed:', e);
    }
  } else {
    console.warn('RESEND_API_KEY is not set. Email not sent via provider.');
  }
}

# Configuración de Supabase para FacultyMatch

## 1. Proveedores de SSO (Google & Microsoft)
Para activar el inicio de sesión con Google y Azure (Microsoft), sigue estos pasos:

### Google
1. Ve a **Authentication** → **Providers** → **Google**.
2. Activa **Enable Google Provider**.
3. Introduce el **Client ID** y **Client Secret** obtenidos de Google Cloud Console.
4. Asegúrate de añadir la **Redirect URL** que te proporciona Supabase en la configuración de Google Cloud (ej: `https://fezwnczyntrzfpsusgod.supabase.co/auth/v1/callback`).

### Azure (Microsoft)
1. Ve a **Authentication** → **Providers** → **Azure**.
2. Activa **Enable Azure Provider**.
3. Introduce el **Client ID** y **Client Secret** obtenidos de Azure Portal (App Registration).
4. Introduce el **Tenant ID** (o usa `common`).
5. Añade la **Redirect URL** en Azure Portal.

## 2. URLs de Redirección
En **Authentication** → **URL Configuration**, asegúrate de tener:
- **Site URL**: `https://facultymatch.vercel.app`
- **Redirect URLs**:
  - `http://localhost:3000/**`
  - `https://facultymatch.vercel.app/**`

## 3. Personalización de Emails
En **Authentication** → **Email Templates**:

### Confirm signup
Copia el siguiente código en el cuerpo del mensaje (HTML):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #F1F5F9; margin: 0; padding: 0; color: #334155; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { background: #1E3A8A; padding: 40px; text-align: center; }
    .content { padding: 40px; line-height: 1.6; }
    .footer { background: #fafafa; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 16px 32px; background: #2563EB; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
    .logo { color: white; font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px; }
    .tagline { color: #06B6D4; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FACULTY<span style="color: #2563EB">MATCH</span></div>
      <div class="tagline">Conectando Talento Académico</div>
    </div>
    <div class="content">
      <h1 style="color: #1E3A8A; font-size: 28px; margin-bottom: 20px;">Confirma tu cuenta</h1>
      <p>Gracias por unirte a FacultyMatch. Por favor, confirma tu dirección de correo electrónico para activar tu cuenta y empezar a configurar tu perfil.</p>
      <a href="{{ .ConfirmationURL }}" class="button">Confirmar cuenta</a>
      <p style="margin-top: 30px; font-size: 14px; color: #94a3b8;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
      <p style="font-size: 12px; color: #2563EB; word-break: break-all;">{{ .ConfirmationURL }}</p>
    </div>
    <div class="footer">
      &copy; 2026 FacultyMatch Network. <br>
      Elevando los estándares de la educación superior global.
    </div>
  </div>
</body>
</html>
```

## 4. Configuración de SMTP (Resend)
Para asegurar la entrega de emails, ve a **Settings** → **Auth** → **SMTP Settings** y configura los campos con tu cuenta de Resend:
- **Enable SMTP**: ON
- **Sender name**: FacultyMatch
- **Sender email**: no-reply@tu-dominio.com (debe estar verificado en Resend)
- **Host**: `smtp.resend.com`
- **Port**: `465` o `587`
- **User**: `resend`
- **Pass**: Tu API Key de Resend

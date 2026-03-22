# Configuración de Autenticación Supabase (Proyecto Correcto: ssbuxzqsvofgzuxslmhd)

Para que el sistema de autenticación funcione correctamente en producción, asegúrate de que el proyecto de Supabase activo sea `ssbuxzqsvofgzuxslmhd` y sigue estos pasos:

## 1. Configurar Providers SSO (Google y Microsoft)

### Google
1. Ve a **Authentication** -> **Providers** -> **Google**.
2. Activa **Enable Google Provider**.
3. En **Google Cloud Console** -> **OAuth Client**:
   - **Authorized JavaScript origins**: 
     - `https://facultymatch.vercel.app`
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `https://ssbuxzqsvofgzuxslmhd.supabase.co/auth/v1/callback`

### Microsoft (Azure)
1. Ve a **Authentication** -> **Providers** -> **Azure**.
2. Activa **Enable Azure Provider**.
3. En **Azure Portal** -> **App Registrations**:
   - **Redirect URIs**:
     - `https://ssbuxzqsvofgzuxslmhd.supabase.co/auth/v1/callback`

## 2. URL Configuration (Redirects)

Ve a **Authentication** -> **URL Configuration**:

### Site URL
- `https://facultymatch.vercel.app`

### Additional Redirect URLs
Añade las siguientes (obligatorias para que el flujo sea estable):
- `https://facultymatch.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback`
- `https://facultymatch.vercel.app/dashboard`
- `https://facultymatch.vercel.app/onboarding`
- `https://facultymatch.vercel.app/**`

## 3. Desactivar Confirmación de Email (Recomendado para Desarrollo)

Para evitar que los usuarios se queden "bloqueados" esperando un correo:
1. Ve a **Authentication** -> **Sign In / Providers**.
2. En **Email**, desactiva **Confirm email**.
3. Esto permite que el usuario inicie sesión inmediatamente tras el registro.

## 4. Variables de Entorno (Vercel)

Asegúrate de que en Vercel las variables apunten EXCLUSIVAMENTE al nuevo proyecto:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://ssbuxzqsvofgzuxslmhd.supabase.co`
- `NEXT_PUBLIC_SITE_URL`: `https://facultymatch.vercel.app`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (La anon key del nuevo proyecto)
- `SUPABASE_SERVICE_ROLE_KEY`: (La service role key del nuevo proyecto)

> **Nota:** Si tienes `DATABASE_URL` apuntando al proyecto antiguo (`fezwnczy...`), elimínala o actualízala a la nueva cadena de conexión (pooler mode).

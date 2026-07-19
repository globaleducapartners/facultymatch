# FacultyMatch — Contexto del proyecto para Claude Code

## Qué es

FacultyMatch (facultymatch.app) es un directorio de talento docente: los
profesores crean un perfil, un equipo humano lo verifica, y las
instituciones buscan en el directorio. Modelo tipo Idealista: cuenta
única con switcher faculty/institución, sin doble rol en el registro.

El director del proyecto (Miguel) NO es programador. Trabaja así:

- Explica lo que quiere en lenguaje natural.
- Tú implementas POR FASES: antes de escribir código, presenta un
  diagnóstico (qué existe, qué falta, qué debe configurar él) y un plan.
  Implementa fase a fase y muestra cada una antes de continuar.
- Sé quirúrgico: cambios mínimos, sin "mejoras" no pedidas, sin cambios
  de comportamiento colados en migraciones con otro propósito.

## Stack

- Next.js (App Router) + Supabase (proyecto propio, org "Global Educa")
- Emails transaccionales: Resend (`lib/emails/service.ts` + `templates.ts`)
- Hosting: Vercel (cuenta propia de Miguel), deploy desde GitHub
- PDF: @react-pdf/renderer (`components/pdf/VerifiedProfilePdf.tsx`)

## Reglas de trabajo INVIOLABLES

1. **Migraciones SQL**: NUNCA se aplican automáticamente. Se escriben en
   `supabase/migrations/`, se muestran completas a Miguel, y ÉL las pega
   en el SQL Editor del dashboard de Supabase. Formato: transacción
   (BEGIN/COMMIT), backup con RLS activado antes de mutar datos,
   backfill explícito para filas existentes, y sección de verificación
   como SEGUNDA pasada aparte (el SQL Editor solo muestra el último
   resultado). El historial del CLI (`supabase_migrations.schema_migrations`)
   NO existe en este proyecto: las migraciones aplicadas se documentan
   en el header del archivo.
2. **Credenciales**: nunca en el chat ni hardcodeadas. Variables de
   entorno (`.env.local` en local, panel de Vercel en producción).
   Existentes: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
   `NEXT_PUBLIC_SITE_URL`, keys de Supabase. ⚠️ Tras el cierre de
   Orchids se deben rotar la service role de Supabase y la key de
   Resend — comprobar si ya se hizo.
3. **SQL con datos reales**: cuidado con `IN (..., NULL)` (nunca matchea
   NULL), con defaults que bloqueen a usuarios existentes, y con
   `CREATE OR REPLACE FUNCTION` que pierda campos de la versión vigente.

## Máquina de estados del perfil (fuente de verdad ÚNICA)

`faculty_profiles.estado_perfil` (text + CHECK constraint):

```
pendiente_verificacion → incompleto → en_revision → verificado
                                            ↘ rechazado → (editar) → en_revision
activo (legacy, ya no debería quedar ninguno) · suspendido (admin)
```

- `user_profiles.verification_status` está DEPRECATED (era un default
  engañoso: marcaba 'approved' a todos). No leerlo; solo se mantiene
  sincronizado como espejo al verificar.
- Registro → email de activación (tokens propios, hash SHA-256, 24h,
  cooldown reenvío 60s, respuesta neutra anti-enumeración) →
  `incompleto` → onboarding → publicar → `en_revision` → panel
  /app/control (superadmin) verifica (→ `verificado`, con
  `verificado_por` uuid, `verificado_en`, email + notificación + PDF +
  slug público) o rechaza (motivo obligatorio → `rechazado`).
- Re-verificación: editar campos sensibles de un perfil `verificado` lo
  devuelve a `en_revision`. Lista cerrada en
  `lib/profile-sensitivity.ts` (9 campos: full_name, academic_level,
  degrees, aneca_accreditation, is_phd, institutions_taught,
  current_institution, google_scholar_id, orcid_id). linkedin_url,
  website, bio, foto, idiomas NO desverifican.

## Datos y decisiones ya tomadas (no rediscutir)

- Consolidación aplicada: 7 perfiles `verificado` reales, ~22
  `incompleto` (21 falsos aprobados del sistema viejo + 1 en curso).
  Los verificados legacy tienen `verificado_por/verificado_en` desde
  `user_profiles.verified_by/verified_at` (email → uuid).
- Enum de visibilidad se llama `visibility_mode`, valores `public` y
  `private` (NO existe `hidden`).
- Fotos de perfil viven en `user_profiles.avatar_url` (NO existe
  `faculty_profiles.avatar_url`). La foto cuenta en el cálculo de
  completitud.
- `user_profiles.email` se sincroniza desde `auth.users` (backfill +
  trigger en alta + trigger en cambio de email).
- El trigger `handle_new_user()` crea faculty_profiles con
  `visibility = 'private'` (los perfiles nuevos no salen en búsqueda).
- Rol institución: NO hay bifurcación en el registro. El rol emerge
  cuando alguien intenta buscar en el directorio (patrón just-in-time,
  ya implementado en /app).

## PENDIENTE DE CONFIRMAR al arrancar (primera tarea)

1. ¿Se aplicó la migración `20260719000001_backfill_email_user_profiles.sql`?
   Verificar: `SELECT count(*) FROM user_profiles WHERE role='faculty' AND email IS NULL;` debe dar 0.
2. Filtro del directorio público: `search/page.tsx` debe filtrar
   `estado_perfil = 'verificado' AND visibility = 'public'`. Estaba
   pendiente de corregir cuando cerró Orchids. Revisar también otros
   puntos de listado público (API de búsqueda, sitemap, URLs públicas).
3. Plan de prueba de Fase 4:
   `scripts/test-plan-verificacion-completo.md` — ¿se ejecutó completo?
4. Rotación de keys post-Orchids (ver regla 2).

## SIGUIENTE GRAN FASE: Fase 5 — Vía IA del onboarding

Implementar "Crea tu perfil con IA en 1 minuto": el usuario sube su CV
(PDF/Word, máx. 10 MB, o texto pegado) y la IA rellena un borrador del
perfil que él revisa antes de guardar.

- El system prompt EXACTO está en `docs/prompt-extraccion-cv.md` (raíz
  del repo). Es material de producción: guardarlo como constante del
  servidor, NO modificarlo, NO resumirlo, NO "mejorarlo".
- Endpoint `POST /api/onboarding/extract-cv`: extraer texto del
  documento en el servidor y enviar SOLO texto al modelo. API de
  Anthropic, modelo `claude-haiku-4-5`, `temperature: 0`.
- Validar la respuesta con Zod contra el esquema del prompt. 1 reintento
  si falla; después, mensaje amable + wizard manual. Nunca mostrar
  errores de parsing al usuario.
- Rate limit: 3 extracciones por usuario/día, persistido en DB.
- UI: tarjeta en el onboarding junto al wizard de 5 pasos; estados
  subiendo → "Leyendo tu CV..." → pantalla de revisión con badges de
  confianza (alta/media), tooltip de evidencia, campos vacíos
  "complétalo tú". NADA se guarda hasta confirmar; al confirmar, usar
  las MISMAS server actions del wizard (así estado_perfil y
  re-verificación funcionan igual).
- Privacidad: borrar el CV del storage tras confirmar. Nota visible:
  "Tu CV solo se usa para rellenar tu perfil."
- Puntos de reentrada: botón permanente en /app/perfil y tarjeta en
  /app si completitud < 70% (descartable, no reaparece tras 2 cierres).
- Requiere `ANTHROPIC_API_KEY` en variables de entorno (Miguel la crea
  en console.anthropic.com, exclusiva para este proyecto y con límite
  de gasto).

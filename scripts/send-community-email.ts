// Correo de agradecimiento + Invita y Gana para los docentes registrados.
// Envío individual (nombre y enlace personal de cada uno), nunca en copia oculta.
//
//   bun scripts/send-community-email.ts list                     → quién lo recibiría (no envía nada)
//   bun scripts/send-community-email.ts preview <carpeta>        → guarda las dos versiones en HTML
//   bun scripts/send-community-email.ts test <email> [--sin-verificar]
//                                                                → envía UNA prueba a esa dirección
//   bun scripts/send-community-email.ts send --yes               → envío real a todos los pendientes
//
// Lee las claves de .env.local. Registra cada envío en email_logs
// (template "community_invite") y no repite a quien ya lo recibió.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getCommunityInviteEmail, firstNameOf, COMMUNITY_EMAIL_SUBJECT } from "../src/lib/emails/templates";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const SITE = "https://www.facultymatch.app";
const TEMPLATE = "community_invite";
const FROM = process.env.RESEND_FROM_EMAIL || "FacultyMatch <noreply@facultymatch.app>";
const REPLY_TO = "support@facultymatch.app";

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

type Recipient = { id: string; email: string; name: string; verified: boolean; already: boolean };

async function loadRecipients(): Promise<Recipient[]> {
  const { data: users } = await admin.from("user_profiles").select("id, email, full_name").eq("role", "faculty");
  const { data: fps } = await admin.from("faculty_profiles").select("user_id, estado_perfil");
  const { data: logs } = await admin.from("email_logs").select("recipient_email").eq("template", TEMPLATE);
  const estado = new Map((fps || []).map((f) => [f.user_id, f.estado_perfil]));
  const done = new Set((logs || []).map((l) => (l.recipient_email || "").toLowerCase()));
  // Sin cuentas de prueba, y una sola por persona (si hay dos con el mismo
  // nombre completo, se queda la verificada o, si no, la primera).
  const eligible = (users || []).filter(
    (u) => u.email && estado.get(u.id) !== "suspendido" && !/prueba|@facultymatch\.app$/i.test(u.email as string),
  );
  const byName = new Map<string, (typeof eligible)[number]>();
  for (const u of eligible) {
    const key = (u.full_name || u.email || "").trim().toLowerCase();
    const prev = byName.get(key);
    if (!prev || (estado.get(u.id) === "verificado" && estado.get(prev.id) !== "verificado")) byName.set(key, u);
  }
  return [...byName.values()]
    .map((u) => ({
      id: u.id,
      email: u.email as string,
      name: firstNameOf(u.full_name),
      verified: estado.get(u.id) === "verificado",
      already: done.has((u.email as string).toLowerCase()),
    }));
}

const link = (id: string) => `${SITE}/signup?ref=${id}`;
const [cmd, arg] = process.argv.slice(2);
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOne(to: string, r: { id: string; name: string; verified: boolean }, subjectPrefix = "") {
  return resend.emails.send({
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject: subjectPrefix + COMMUNITY_EMAIL_SUBJECT(r.name),
    html: getCommunityInviteEmail({ name: r.name, referralLink: link(r.id), verified: r.verified }),
    headers: { "List-Unsubscribe": `<mailto:${REPLY_TO}?subject=baja>` },
  });
}

async function main() {
  if (cmd === "list") {
    const rs = await loadRecipients();
    const pending = rs.filter((r) => !r.already);
    console.log(`Docentes: ${rs.length} · ya enviado: ${rs.length - pending.length} · pendientes: ${pending.length}`);
    console.log(`Verificados: ${pending.filter((r) => r.verified).length} · sin verificar: ${pending.filter((r) => !r.verified).length}`);
    for (const r of pending) console.log(`${r.verified ? "V" : "-"}  ${(r.name || "(sin nombre)").padEnd(16)} ${r.email}`);
  } else if (cmd === "preview") {
    const dir = arg || ".";
    mkdirSync(dir, { recursive: true });
    for (const verified of [true, false]) {
      writeFileSync(`${dir}/correo-comunidad-${verified ? "verificado" : "sin-verificar"}.html`,
        getCommunityInviteEmail({ name: "María", referralLink: link("00000000-0000-0000-0000-000000000000"), verified }));
    }
    console.log("Guardado en", dir);
  } else if (cmd === "test") {
    if (!arg?.includes("@")) throw new Error("Falta la dirección de prueba");
    const { data: u } = await admin.from("user_profiles").select("id, full_name").eq("email", arg).maybeSingle();
    const id = u?.id || "00000000-0000-0000-0000-000000000000";
    const verified = !process.argv.includes("--sin-verificar");
    const res = await sendOne(arg, { id, name: firstNameOf(u?.full_name) || "María", verified }, "[PRUEBA] ");
    console.log(res.error ? `Error: ${res.error.message}` : `Prueba enviada a ${arg} (id ${res.data?.id})`);
  } else if (cmd === "send") {
    if (!process.argv.includes("--yes")) throw new Error("Añade --yes para confirmar el envío real");
    const pending = (await loadRecipients()).filter((r) => !r.already);
    console.log(`Enviando a ${pending.length} docentes…`);
    let ok = 0, fail = 0;
    for (const r of pending) {
      const res = await sendOne(r.email, r);
      if (res.error) { fail++; console.log(`✗ ${r.email}: ${res.error.message}`); }
      else {
        ok++;
        await admin.from("email_logs").insert({
          recipient_id: r.id, recipient_email: r.email, template: TEMPLATE,
          subject: COMMUNITY_EMAIL_SUBJECT(r.name), metadata: { resend_id: res.data?.id, verified: r.verified },
        });
      }
      await new Promise((s) => setTimeout(s, 700));
    }
    console.log(`Hecho: ${ok} enviados, ${fail} con error.`);
  } else {
    console.log("Uso: list | preview <carpeta> | test <email> [--sin-verificar] | send --yes");
  }
}
main().catch((e) => { console.error(e.message); process.exit(1); });

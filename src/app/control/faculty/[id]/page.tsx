import { createAdminClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import {
  Mail, Eye, GraduationCap, Globe, MapPin, Award, BookOpen, FileText,
  Languages, Phone, Link as LinkIcon, Calendar, Clock, ChevronRight,
  EyeOff, CheckCircle2, XCircle, AlertTriangle, MessageSquare, User,
  Trash2, Ban, Send, Bell,
} from "lucide-react";
import Link from "next/link";
import { FacultyActions } from "./FacultyActionsClient";

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status?: string | null }) {
  if (status === "verificado")
    return <span className="text-xs font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1.5 w-fit"><CheckCircle2 size={12} /> Verificado</span>;
  if (status === "rechazado")
    return <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1.5 w-fit"><XCircle size={12} /> Rechazado</span>;
  if (status === "en_revision")
    return <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1.5 w-fit"><Clock size={12} /> En revisión</span>;
  if (status === "incompleto")
    return <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1.5 w-fit"><AlertTriangle size={12} /> Incompleto</span>;
  if (status === "pendiente_verificacion")
    return <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1.5 w-fit"><Clock size={12} /> Pendiente verificación</span>;
  return <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1.5 w-fit"><Clock size={12} /> {status || "Desconocido"}</span>;
}

function StatCard({ icon: Icon, label, value, color = "blue" }: {
  icon: React.ElementType; label: string; value: number | string; color?: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color] || colors.blue}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-navy">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="text-sm font-semibold text-navy mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-4">
      <Icon size={14} className="text-talentia-blue" />
      {title}
    </h3>
  );
}

export default async function FacultyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  // Fetch user profile
  const { data: userProfile } = await admin
    .from("user_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!userProfile) notFound();

  // Fetch auth user metadata
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  const userEmail = userProfile.email || authUser?.user?.email || "—";

  // Fetch faculty profile
  const { data: facultyProfile } = await admin
    .from("faculty_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  // Fetch expertise
  const { data: expertise } = await admin
    .from("faculty_expertise")
    .select("*")
    .eq("faculty_id", id);

  // Fetch documents
  const { data: documents } = await admin
    .from("faculty_documents")
    .select("*")
    .eq("faculty_id", id)
    .order("created_at", { ascending: false });

  // Fetch contacts count
  const { count: contactCount } = await admin
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("faculty_id", id);

  // Fetch email logs
  const { data: emailLogs } = await admin
    .from("email_logs")
    .select("*")
    .eq("recipient_id", id)
    .order("sent_at", { ascending: false })
    .limit(20);

  // Fetch admin notifications
  const { data: notifications } = await admin
    .from("admin_notifications")
    .select("*")
    .eq("faculty_id", id)
    .order("sent_at", { ascending: false })
    .limit(20);

  const fp = facultyProfile || {};
  const visibility = fp.visibility || "public";
  const viewCount = fp.view_count ?? 0;
  const isHidden = visibility === "private";
  const isVerified = fp.estado_perfil === "verificado";

  // Calculate profile completeness
  const fields = [fp.headline, fp.bio, fp.location, fp.country, fp.website, fp.contact_email, fp.avatar_url, fp.banner_url];
  const filledFields = fields.filter(Boolean).length;
  const completeness = Math.round((filledFields / fields.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
        <Link href="/control/faculty" className="hover:text-navy transition-colors">Todos los docentes</Link>
        <ChevronRight size={14} />
        <span className="text-navy font-bold truncate">{userProfile.full_name || "Sin nombre"}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-talentia-blue to-blue-700 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
            {(userProfile.full_name || "?").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-navy tracking-tight">{userProfile.full_name || "Sin nombre"}</h1>
            <p className="text-gray-500 font-medium mt-0.5">{fp.headline || "Sin cargo académico"}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={fp.estado_perfil} />
              {isHidden && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 flex items-center gap-1.5">
                  <EyeOff size={12} /> Oculto
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <FacultyActions
        facultyId={id}
        isHidden={isHidden}
        isVerified={isVerified}
        verificationStatus={fp.estado_perfil}
        facultyName={userProfile.full_name?.split(" ")[0] || "Docente"}
      />

      {/* Main grid: Left column + Right column */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle icon={User} title="Información personal" />
            <div className="space-y-0">
              <InfoRow icon={Mail} label="Email" value={userEmail} />
              {fp.phone && <InfoRow icon={Phone} label="Teléfono" value={fp.phone} />}
              {fp.location && <InfoRow icon={MapPin} label="Ubicación" value={fp.location} />}
              {fp.city && fp.country && (
                <InfoRow icon={Globe} label="Ciudad / País" value={`${fp.city}, ${fp.country}`} />
              )}
              {fp.country && !fp.city && <InfoRow icon={Globe} label="País" value={fp.country} />}
              <InfoRow icon={Calendar} label="Registro" value={fmtDate(userProfile.created_at)} />
              {fp.verificado_en && (
                <InfoRow icon={CheckCircle2} label="Verificado el" value={fmtDate(fp.verificado_en)} />
              )}
              <InfoRow icon={User} label="Rol" value={userProfile.role} />
              <InfoRow icon={CheckCircle2} label="Onboarding completado" value={userProfile.onboarding_completed ? "Sí" : "No"} />
            </div>
          </div>

          {/* Bio */}
          {fp.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={MessageSquare} title="Biografía" />
              <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">{fp.bio}</p>
            </div>
          )}

          {/* Academic Profile */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle icon={GraduationCap} title="Perfil académico" />
            <div className="space-y-0">
              {fp.academic_level && <InfoRow icon={Award} label="Nivel académico" value={fp.academic_level} />}
              {fp.is_phd && <InfoRow icon={Award} label="PhD" value="Sí" />}
              {fp.aneca_accreditation && (
                <InfoRow icon={Award} label="Acreditación ANECA" value={fp.aneca_accreditation} />
              )}
              {fp.website && (
                <InfoRow icon={LinkIcon} label="Sitio web" value={
                  <a href={fp.website} target="_blank" rel="noopener noreferrer" className="text-talentia-blue hover:underline">
                    {fp.website}
                  </a>
                } />
              )}
              {fp.google_scholar_id && (
                <InfoRow icon={LinkIcon} label="Google Scholar" value={
                  <a href={`https://scholar.google.com/citations?user=${fp.google_scholar_id}`} target="_blank" rel="noopener noreferrer" className="text-talentia-blue hover:underline">
                    {fp.google_scholar_id}
                  </a>
                } />
              )}
              {fp.orcid_id && (
                <InfoRow icon={LinkIcon} label="ORCID" value={
                  <a href={`https://orcid.org/${fp.orcid_id}`} target="_blank" rel="noopener noreferrer" className="text-talentia-blue hover:underline">
                    {fp.orcid_id}
                  </a>
                } />
              )}
            </div>

            {/* Expertise areas */}
            {expertise && expertise.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Áreas de conocimiento</p>
                <div className="space-y-3">
                  {expertise.map((exp: any) => (
                    <div key={exp.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-talentia-blue flex-shrink-0" />
                        <span className="text-sm font-bold text-navy">{exp.area}</span>
                      </div>
                      {exp.subarea && (
                        <p className="text-xs text-gray-500 ml-6 mt-0.5">{exp.subarea}</p>
                      )}
                      {exp.topics && Array.isArray(exp.topics) && exp.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 ml-6 mt-1.5">
                          {exp.topics.map((t: string, i: number) => (
                            <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-talentia-blue">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact info */}
          {(fp.contact_email || fp.contact_whatsapp || fp.contact_linkedin) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={Mail} title="Información de contacto pública" />
              <div className="space-y-0">
                {fp.contact_email && <InfoRow icon={Mail} label="Email contacto" value={fp.contact_email} />}
                {fp.contact_whatsapp && <InfoRow icon={Phone} label="WhatsApp" value={fp.contact_whatsapp} />}
                {fp.contact_linkedin && (
                  <InfoRow icon={LinkIcon} label="LinkedIn" value={
                    <a href={fp.contact_linkedin} target="_blank" rel="noopener noreferrer" className="text-talentia-blue hover:underline">
                      {fp.contact_linkedin}
                    </a>
                  } />
                )}
              </div>
            </div>
          )}

          {/* Degrees */}
          {fp.degrees && Array.isArray(fp.degrees) && fp.degrees.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={GraduationCap} title="Títulos académicos" />
              <div className="space-y-3">
                {fp.degrees.map((d: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <GraduationCap size={16} className="text-talentia-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-navy">{d.degree || d.title || "Sin título"}</p>
                      {d.institution && <p className="text-xs text-gray-500">{d.institution}</p>}
                      {d.year && <p className="text-[10px] text-gray-400 font-semibold">{d.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {fp.languages && Array.isArray(fp.languages) && fp.languages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={Languages} title="Idiomas" />
              <div className="flex flex-wrap gap-2">
                {fp.languages.map((lang: any, i: number) => (
                  <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                    {lang.language || lang.name || lang}
                    {lang.level ? ` · ${lang.level}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents && documents.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={FileText} title="Documentos ({documents.length})" />
              <div className="grid gap-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FileText size={16} className="text-talentia-blue flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {doc.doc_type || "Documento"} · {fmtDate(doc.created_at)}
                        {doc.is_public ? " · Público" : " · Privado"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Stats & Metadata */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Eye} label="Visitas" value={viewCount} color="blue" />
            <StatCard icon={Mail} label="Contactos" value={contactCount ?? 0} color="green" />
            <StatCard icon={GraduationCap} label="Documentos" value={documents?.length ?? 0} color="purple" />
            <StatCard icon={Award} label="Completitud" value={`${completeness}%`} color="orange" />
          </div>

          {/* Visibility info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionTitle icon={EyeOff} title="Visibilidad" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy font-semibold">Estado</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  isHidden ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  {isHidden ? "Oculto" : "Visible"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy font-semibold">Nombre visible</span>
                <span className="text-xs text-gray-500 font-bold">{fp.name_visibility || "public"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy font-semibold">Notificaciones</span>
                <span className="text-xs text-gray-500 font-bold">
                  {fp.notify_messages ? "Activadas" : "Desactivadas"}
                </span>
              </div>
            </div>
          </div>

          {/* Modality & Availability */}
          {fp.modalities && Array.isArray(fp.modalities) && fp.modalities.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <SectionTitle icon={Calendar} title="Modalidades" />
              <div className="flex flex-wrap gap-2">
                {(fp.modalities || []).map((m: string, i: number) => (
                  <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-talentia-blue">
                    {m}
                  </span>
                ))}
              </div>
              {fp.availability && (
                <p className="text-xs text-gray-500 mt-3 font-semibold">Disponibilidad: {fp.availability}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email History */}
      {emailLogs && emailLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionTitle icon={Mail} title="Historial de emails ({emailLogs.length})" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plantilla</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destinatario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {emailLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-6 py-3 text-sm text-gray-500">{fmtDate(log.sent_at)}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-talentia-blue">
                        {log.template}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-navy">{log.subject}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{log.recipient_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications History */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <SectionTitle icon={Bell} title="Notificaciones enviadas ({notifications.length})" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th className="text-left px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asunto</th>
                  <th className="text-center px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Leída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notifications.map((notif: any) => (
                  <tr key={notif.id}>
                    <td className="px-6 py-3 text-sm text-gray-500">{fmtDate(notif.sent_at)}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-navy">{notif.subject}</td>
                    <td className="px-6 py-3 text-center">
                      {notif.read_at ? (
                        <span className="text-xs text-green-600 font-bold">Sí ({fmtDate(notif.read_at)})</span>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
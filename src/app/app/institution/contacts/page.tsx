import { createClient, createAdminClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ContactThread } from "./ContactThread";

const SUBJECT_LABELS: Record<string, string> = {
  profesor_adjunto: "Profesor Adjunto",
  conferenciante: "Conferenciante",
  tutor_tfm: "Tutor TFM",
  diseno_curricular: "Diseño Curricular",
  otro: "Otro",
};

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: institution } = await supabase
    .from("institutions")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!institution) redirect("/app/institution");

  const admin = createAdminClient();

  const { data: contacts } = await admin
    .from("contacts")
    .select("*")
    .eq("institution_id", institution?.id)
    .order("created_at", { ascending: false });

  const facultyIds = contacts?.map((c: any) => c.faculty_id).filter(Boolean) ?? [];

  const [{ data: facultyUsers }, { data: facultyProfiles }] = await Promise.all([
    facultyIds.length > 0
      ? admin.from("user_profiles").select("id, full_name, avatar_url").in("id", facultyIds)
      : Promise.resolve({ data: [] as any[] }),
    facultyIds.length > 0
      ? admin.from("faculty_profiles").select("id, headline, contact_whatsapp").in("id", facultyIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const facultyMap: Record<string, { full_name: string; avatar_url: string | null; headline: string; contact_whatsapp: string | null }> = {};
  (facultyUsers ?? []).forEach((u: any) => {
    facultyMap[u.id] = { full_name: u.full_name ?? "Docente", avatar_url: u.avatar_url ?? null, headline: "", contact_whatsapp: null };
  });
  (facultyProfiles ?? []).forEach((fp: any) => {
    if (facultyMap[fp.id]) {
      facultyMap[fp.id].headline = fp.headline ?? "";
      facultyMap[fp.id].contact_whatsapp = fp.contact_whatsapp ?? null;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
          <Link href="/app/institution/home"><ChevronLeft size={24} /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-navy">Conversaciones</h1>
          <p className="text-gray-500 font-medium">Tus propuestas y respuestas de docentes.</p>
        </div>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact: any) => {
            const faculty = facultyMap[contact.faculty_id];
            return (
              <ContactThread
                key={contact.id}
                contact={contact}
                faculty={faculty ?? { full_name: "Docente", avatar_url: null, headline: "", contact_whatsapp: null }}
                institutionName={institution?.name ?? "Tu institución"}
                subjectLabel={SUBJECT_LABELS[contact.subject] ?? contact.subject ?? ""}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
          <div className="bg-blue-50 p-6 rounded-full text-talentia-blue mb-6"><Mail size={48} /></div>
          <h3 className="text-xl font-bold text-navy mb-2">No has iniciado conversaciones aún</h3>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">
            Cuando encuentres un docente que encaje con tu programa, podrás contactarle directamente desde el directorio.
          </p>
          <Button asChild className="mt-8 bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 rounded-xl px-8">
            <Link href="/app/institution/search">Buscar docentes</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

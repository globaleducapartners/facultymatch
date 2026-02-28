import { createClient } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, MapPin, ChevronLeft, Search, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: institution } = await supabase
    .from("institutions")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: contacts } = await supabase
    .from("contacts")
    .select(`
      *,
      faculty_profiles (
        full_name,
        headline,
        avatar_url
      )
    `)
    .eq("institution_id", institution?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
          <Link href="/app/institution">
            <ChevronLeft size={24} />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-navy">Contactos enviados</h1>
          <p className="text-gray-500 font-medium">Historial de propuestas enviadas a docentes.</p>
        </div>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-16 h-16 bg-talentia-blue/10 text-talentia-blue rounded-xl flex items-center justify-center shrink-0">
                  {contact.faculty_profiles?.avatar_url ? (
                    <img src={contact.faculty_profiles.avatar_url} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-xl font-black">{contact.faculty_profiles?.full_name?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-navy">{contact.faculty_profiles?.full_name}</h3>
                      <p className="text-sm font-medium text-gray-500">{contact.faculty_profiles?.headline}</p>
                    </div>
                    <Badge className={`${
                      contact.status === 'sent' ? 'bg-blue-50 text-blue-600' : 
                      contact.status === 'replied' ? 'bg-green-50 text-green-600' : 
                      'bg-gray-50 text-gray-600'
                    } border-none px-4 py-1.5 rounded-full text-xs font-bold`}>
                      {contact.status === 'sent' && <Clock size={14} className="mr-1.5 inline" />}
                      {contact.status === 'replied' && <CheckCircle2 size={14} className="mr-1.5 inline" />}
                      {contact.status === 'sent' ? 'Enviada' : contact.status === 'replied' ? 'Respondida' : 'Archivada'}
                    </Badge>
                  </div>

                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-talentia-blue" />
                        {contact.subject}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-talentia-blue" />
                        {contact.modality}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-talentia-blue" />
                        {contact.dates}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm italic leading-relaxed">
                      "{contact.message}"
                    </p>
                  </div>

                  <div className="flex justify-end text-xs font-medium text-gray-400">
                    Enviada el {new Date(contact.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center text-center">
          <div className="bg-blue-50 p-6 rounded-full text-talentia-blue mb-6">
            <Mail size={48} />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No has enviado contactos aún</h3>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">
            Cuando encuentres un docente que encaje con tu programa, podrás contactarle directamente desde aquí.
          </p>
          <Button asChild className="mt-8 bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 rounded-xl px-8">
            <Link href="/app/institution">Buscar docentes</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase-server";
import { Mail, Archive, CheckCircle2, Building2, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface ContactRequest {
  id: string;
  message: string;
  status: string;
  created_at: string;
  institution: {
    name: string;
    country: string;
  };
}

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: requests } = await supabase
    .from("contacts")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", facultyProfile?.id)
    .order("created_at", { ascending: false });

  async function updateStatus(id: string, status: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("contacts").update({ status }).eq("id", id);
    revalidatePath("/app/faculty/requests");
  }

  const pendingRequests = (requests as ContactRequest[] | null)?.filter(r => r.status === 'sent' || r.status === 'pending') || [];
  const repliedRequests = (requests as ContactRequest[] | null)?.filter(r => r.status === 'replied') || [];
  const archivedRequests = (requests as ContactRequest[] | null)?.filter(r => r.status === 'archived') || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Solicitudes</h1>
          <p className="text-gray-500 font-medium">Gestiona tus contactos e invitaciones institucionales.</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 w-full md:w-auto overflow-x-auto justify-start flex-nowrap">
          <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <Mail size={16} /> Pendientes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="replied" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <CheckCircle2 size={16} /> Respondidas ({repliedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-xl data-[state=active]:bg-talentia-blue data-[state=active]:text-white flex items-center gap-2 px-6 py-2.5">
            <Archive size={16} /> Archivadas ({archivedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-50">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req: ContactRequest) => (
                  <div key={req.id} className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-white transition-colors">
                          <Building2 size={24} className="text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-navy">{req.institution?.name}</h4>
                            <Badge variant="secondary" className="bg-blue-50 text-talentia-blue font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-blue-100">
                              Institución
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-gray-700">{req.message?.substring(0, 100)}...</p>
                          <div className="flex items-center gap-4 pt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {req.institution?.country}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <form action={async () => { "use server"; await updateStatus(req.id, 'replied'); }}>
                          <Button type="submit" className="bg-talentia-blue hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-6">
                            Responder
                          </Button>
                        </form>
                        <form action={async () => { "use server"; await updateStatus(req.id, 'archived'); }}>
                          <Button type="submit" variant="ghost" className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 h-10 w-10">
                            <Archive size={18} />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center space-y-4">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Mail size={32} className="text-gray-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-navy font-bold">Bandeja de entrada vacía</p>
                    <p className="text-gray-500 text-sm font-medium">No has recibido ninguna solicitud nueva por ahora.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replied">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-50">
              {repliedRequests.length > 0 ? (
                repliedRequests.map((req: ContactRequest) => (
                  <div key={req.id} className="p-6 hover:bg-gray-50/50 transition-colors opacity-75">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-2xl">
                          <Building2 size={24} className="text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-navy">{req.institution?.name}</h4>
                          <p className="text-sm text-gray-600">{req.message?.substring(0, 100)}...</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 uppercase text-[9px] font-black tracking-widest px-3 py-1">Respondida</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <p className="text-gray-500 font-medium">No has respondido ninguna solicitud todavía.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-50">
              {archivedRequests.length > 0 ? (
                archivedRequests.map((req: ContactRequest) => (
                  <div key={req.id} className="p-6 hover:bg-gray-50/50 transition-colors opacity-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-2xl">
                          <Archive size={24} className="text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-navy">{req.institution?.name}</h4>
                          <p className="text-sm text-gray-600">Archivada el {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <p className="text-gray-500 font-medium">No tienes solicitudes archivadas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

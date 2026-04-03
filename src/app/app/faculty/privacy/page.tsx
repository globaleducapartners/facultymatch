import { createClient, createAdminClient } from "@/lib/supabase-server";
import { ShieldCheck, Eye, EyeOff, Lock, UserPlus, Search, X, AlertCircle, Sparkles, Star } from "lucide-react";
import { UNIVERSITIES } from "@/data/universities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: facultyProfile } = await supabase
    .from("faculty_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Plan lives in user_profiles (set by Stripe webhook)
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("plan, subscription_status, subscription_current_period_end")
    .eq("id", user.id)
    .single();

  const { data: visibilityRules } = await supabase
    .from("visibility_rules")
    .select("*, institution:institutions(name, country)")
    .eq("faculty_id", facultyProfile?.id)
    .eq("rule", "block");

  // Pro: plan set by Stripe webhook in user_profiles
  const isPremium = userProfile?.plan === "faculty-pro" && userProfile?.subscription_status === "active";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.facultymatch.app";
  const profileToken = facultyProfile?.profile_token;
  const uniqueLink = profileToken ? `${siteUrl}/faculty/invite/${profileToken}` : null;

  const preferredInstitutions: string[] =
    (facultyProfile?.preferred_institutions as string[] | null) || [];

  async function updateVisibility(formData: FormData) {
    "use server";
    const mode = formData.get("visibilityMode") as "public" | "institutions_only" | "hidden";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const admin = createAdminClient();
    await admin.from("faculty_profiles")
      .upsert({ id: user.id, user_id: user.id, visibility: mode }, { onConflict: "id" });
    revalidatePath("/app/faculty/privacy");
    redirect("/app/faculty/privacy?saved=1");
  }

  async function generateUniqueLink() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const token = crypto.randomUUID();
    const admin = createAdminClient();
    await admin.from("faculty_profiles")
      .upsert({ id: user.id, user_id: user.id, profile_token: token }, { onConflict: "id" });
    revalidatePath("/app/faculty/privacy");
  }

  async function unblockInstitution(id: string) {
    "use server";
    const supabase = await createClient();
    await supabase.from("visibility_rules").delete().eq("id", id);
    revalidatePath("/app/faculty/privacy");
  }

  async function blockInstitution(formData: FormData) {
    "use server";
    const name = formData.get("institutionName") as string;
    if (!name) return;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const admin = createAdminClient();
    const { data: inst } = await admin
      .from("institutions").select("id").ilike("name", `%${name}%`).limit(1).maybeSingle();
    if (inst) {
      await admin.from("visibility_rules").insert({
        faculty_id: user.id,
        institution_id: inst.id,
        rule: "block",
      });
      revalidatePath("/app/faculty/privacy");
    }
  }

  async function addPreferredInstitution(formData: FormData) {
    "use server";
    const name = (formData.get("preferredName") as string)?.trim();
    if (!name) return;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const admin = createAdminClient();
    const { data: fp } = await admin
      .from("faculty_profiles").select("preferred_institutions").eq("id", user.id).maybeSingle();
    const current = (fp?.preferred_institutions as string[] | null) || [];
    if (!current.includes(name) && current.length < 5) current.push(name);
    await admin.from("faculty_profiles")
      .upsert({ id: user.id, user_id: user.id, preferred_institutions: current }, { onConflict: "id" });
    revalidatePath("/app/faculty/privacy");
  }

  async function removePreferredInstitution(formData: FormData) {
    "use server";
    const name = formData.get("preferredName") as string;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const admin = createAdminClient();
    const { data: fp } = await admin
      .from("faculty_profiles").select("preferred_institutions").eq("id", user.id).maybeSingle();
    const updated = ((fp?.preferred_institutions as string[] | null) || []).filter(i => i !== name);
    await admin.from("faculty_profiles")
      .upsert({ id: user.id, user_id: user.id, preferred_institutions: updated }, { onConflict: "id" });
    revalidatePath("/app/faculty/privacy");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-navy">Visibilidad & Privacidad</h1>
        <p className="text-gray-500 font-medium">
          Tú tienes el control total de quién puede ver tu perfil académico.
        </p>
      </div>

      {saved === "1" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-green-800 font-bold text-sm">
          ✓ Configuración guardada correctamente
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <Eye size={22} className="text-talentia-blue" />
                Modo de visibilidad
              </CardTitle>
              <CardDescription className="font-medium">
                Selecciona cómo quieres que las instituciones te encuentren.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateVisibility}>
                <RadioGroup
                  name="visibilityMode"
                  defaultValue={facultyProfile?.visibility || "public"}
                  className="space-y-4"
                >
                  {[
                    {
                      value: "public",
                      id: "public",
                      label: "Público",
                      desc: "Visible para cualquier usuario y motores de búsqueda.",
                      badge: null,
                    },
                    {
                      value: "institutions_only",
                      id: "institutions",
                      label: "Solo instituciones",
                      desc: "Solo las instituciones verificadas en FacultyMatch pueden ver tu perfil completo.",
                      badge: "Recomendado",
                    },
                    {
                      value: "hidden",
                      id: "hidden",
                      label: "Oculto",
                      desc: "Nadie podrá encontrarte. Mantienes tu perfil pero no apareces en búsquedas.",
                      badge: null,
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all cursor-pointer"
                    >
                      <RadioGroupItem value={opt.value} id={opt.id} className="mt-1" />
                      <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-navy">{opt.label}</span>
                          {opt.badge && (
                            <Badge className="bg-talentia-blue text-white text-[8px] font-black uppercase tracking-widest border-none">
                              {opt.badge}
                            </Badge>
                          )}
                          {opt.value === "hidden" && (
                            <Lock size={14} className="text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                          {opt.desc}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="mt-8">
                  <Button
                    type="submit"
                    className="bg-talentia-blue hover:bg-blue-700 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-blue-100"
                  >
                    Guardar configuración
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-navy flex items-center gap-2">
                <ShieldCheck size={22} className="text-energy-orange" />
                Privacidad Profesional
              </CardTitle>
              <CardDescription className="font-medium">
                Bloquea instituciones específicas para que nunca puedan ver tu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isPremium ? (
                /* ── Premium gate ── */
                <div className="rounded-2xl border-2 border-dashed border-talentia-blue/30 bg-blue-50/40 p-6 space-y-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-talentia-blue">
                    <Sparkles size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Plan Professional</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 max-w-sm mx-auto">
                    El bloqueo de instituciones específicas es exclusivo del <strong>Plan Professional</strong>.
                    Mantén tu perfil invisible para tu centro actual o competidores directos.
                  </p>
                  <div className="text-2xl font-black text-navy">29€ <span className="text-base text-gray-400 font-bold">/ año</span></div>
                  <a
                    href="/checkout?plan=faculty-pro"
                    className="inline-flex items-center gap-2 bg-energy-orange hover:bg-orange-500 text-white font-black text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-orange-100"
                  >
                    <Sparkles size={15} /> Desbloquear Privacidad Profesional
                  </a>
                </div>
              ) : (
                /* ── Block form (premium users) ── */
                <>
                  <form action={blockInstitution} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        name="institutionName"
                        type="text"
                        list="block-university-list"
                        placeholder="Escribe el nombre del centro a bloquear..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium"
                      />
                      <datalist id="block-university-list">
                        {UNIVERSITIES.map((u) => (
                          <option key={u} value={u} />
                        ))}
                      </datalist>
                    </div>
                    <Button
                      type="submit"
                      className="bg-talentia-blue hover:bg-blue-700 text-white font-black rounded-xl px-5 shrink-0 h-auto"
                    >
                      Bloquear
                    </Button>
                  </form>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                      Instituciones bloqueadas ({visibilityRules?.length || 0})
                    </h4>
                    {visibilityRules && visibilityRules.length > 0 ? (
                      <div className="grid gap-3">
                        {visibilityRules.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-red-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-400 transition-colors">
                                <Lock size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-navy">{item.institution?.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                  {item.institution?.country}
                                </p>
                              </div>
                            </div>
                            <form
                              action={async () => {
                                "use server";
                                await unblockInstitution(item.id);
                              }}
                            >
                              <button
                                type="submit"
                                className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400 font-medium">
                          No tienes ninguna institución bloqueada.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-navy text-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <UserPlus size={22} className="text-tech-cyan" />
                Invitaciones directas
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">
                Genera un enlace único para instituciones específicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-tech-cyan shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    Este enlace permite ver tu perfil incluso si está en modo &quot;Oculto&quot;.
                    Caduca en 7 días una vez regenerado.
                  </p>
                </div>

                {uniqueLink && (
                  <div className="space-y-2">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-xs text-tech-cyan font-mono break-all leading-relaxed">
                        {uniqueLink}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                      Copia este enlace y compártelo directamente.
                    </p>
                  </div>
                )}

                <form action={generateUniqueLink}>
                  <button
                    type="submit"
                    className="w-full bg-tech-cyan hover:bg-cyan-500 text-navy font-black rounded-xl h-11 uppercase tracking-widest text-xs transition-colors"
                  >
                    {uniqueLink ? "Regenerar enlace" : "Generar enlace único"}
                  </button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* ── Visibilidad Preferente (premium) ── */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Star size={20} className="text-energy-orange" />
                Visibilidad preferente
              </CardTitle>
              <CardDescription className="font-medium text-xs">
                Aparece primero cuando estas instituciones busquen docentes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isPremium ? (
                <div className="rounded-2xl border-2 border-dashed border-energy-orange/30 bg-orange-50/40 p-5 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-energy-orange">
                    <Sparkles size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Plan Professional</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">
                    Elige hasta 5 instituciones en las que quieres aparecer entre los primeros resultados.
                  </p>
                  <div className="text-xl font-black text-navy">29€ <span className="text-sm text-gray-400 font-bold">/ año</span></div>
                  <a
                    href="/checkout?plan=faculty-pro"
                    className="inline-flex items-center gap-2 bg-energy-orange hover:bg-orange-500 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-100"
                  >
                    <Sparkles size={13} /> Activar visibilidad preferente
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 font-medium">
                    Selecciona hasta <strong>5 instituciones</strong>. Tu perfil aparecerá destacado cuando busquen docentes.
                  </p>

                  {/* Add form */}
                  {preferredInstitutions.length < 5 && (
                    <form action={addPreferredInstitution} className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                          name="preferredName"
                          type="text"
                          list="preferred-univ-list"
                          placeholder="Busca una institución..."
                          required
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-energy-orange focus:border-transparent outline-none transition-all font-medium"
                        />
                        <datalist id="preferred-univ-list">
                          {UNIVERSITIES.map((u) => <option key={u} value={u} />)}
                        </datalist>
                      </div>
                      <Button type="submit" size="sm" className="bg-energy-orange hover:bg-orange-500 text-white font-black rounded-xl px-4 shrink-0">
                        +
                      </Button>
                    </form>
                  )}

                  {/* Current list */}
                  <div className="space-y-2">
                    {preferredInstitutions.length === 0 ? (
                      <p className="text-xs text-gray-400 font-medium text-center py-4 border border-dashed border-gray-200 rounded-xl">
                        Aún no has añadido ninguna institución.
                      </p>
                    ) : (
                      preferredInstitutions.map((name) => (
                        <div key={name} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Star size={13} className="text-energy-orange shrink-0" />
                            <span className="text-sm font-bold text-navy truncate max-w-[180px]">{name}</span>
                          </div>
                          <form action={removePreferredInstitution}>
                            <input type="hidden" name="preferredName" value={name} />
                            <button type="submit" className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                              <X size={15} />
                            </button>
                          </form>
                        </div>
                      ))
                    )}
                  </div>

                  {preferredInstitutions.length >= 5 && (
                    <p className="text-xs text-orange-500 font-bold text-center">Límite de 5 instituciones alcanzado.</p>
                  )}

                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    La visibilidad preferente es una señal de interés. No garantiza contratación ni acceso prioritario a datos de contacto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 space-y-4">
            <div className="flex items-center gap-2 text-talentia-blue">
              <EyeOff size={20} />
              <h4 className="text-sm font-bold">Control de privacidad</h4>
            </div>
            <ul className="space-y-3">
              {[
                "Configura quién puede ver tu perfil",
                "Bloquea instituciones específicas",
                "Comparte invitaciones privadas",
                "Controla tus datos académicos",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-tech-cyan" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

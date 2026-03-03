import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seed() {
  console.log("Starting seed process...");

  // 1. Create 10 Faculty Users
  const faculties = [
    { email: "elena@demo.com", name: "Dr. Elena Martínez", headline: "Experta en IA y Ética", location: "Madrid, España" },
    { email: "carlos@demo.com", name: "Prof. Carlos Ruiz", headline: "Especialista en Finanzas", location: "Ciudad de México" },
    { email: "sofia@demo.com", name: "Dra. Sofía López", headline: "Psicóloga Organizacional", location: "Bogotá, Colombia" },
    { email: "javier@demo.com", name: "Ing. Javier Solís", headline: "Ingeniero de Datos", location: "Barcelona, España" },
    { email: "ana@demo.com", name: "Dra. Ana Gómez", headline: "Marketing Digital", location: "Buenos Aires" },
    { email: "roberto@demo.com", name: "Prof. Roberto Silva", headline: "Derecho Internacional", location: "Santiago, Chile" },
    { email: "laura@demo.com", name: "Dra. Laura Chen", headline: "Logística y Supply Chain", location: "Valencia, España" },
    { email: "david@demo.com", name: "Prof. David Wilson", headline: "Data Scientist", location: "Lima, Perú" },
    { email: "carmen@demo.com", name: "Dra. Carmen Vega", headline: "Investigadora Bioquímica", location: "Sevilla, España" },
    { email: "miguel@demo.com", name: "Ing. Miguel Torres", headline: "Arquitecto de Software", location: "Medellín, Colombia" },
  ];

  for (const f of faculties) {
    console.log(`Creating faculty: ${f.email}`);
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: f.email,
      password: "password123",
      email_confirm: true,
      user_metadata: { full_name: f.name, role: "faculty" }
    });

    if (userError) {
      if (userError.message.includes("already exists")) {
        console.log(`User ${f.email} already exists, skipping auth creation.`);
        // Try to find the existing user
        const { data: existingUsers } = await admin.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === f.email);
        if (existingUser) {
          await createProfiles(existingUser.id, "faculty", f.name, f.headline, f.location);
        }
      } else {
        console.error(`Error creating ${f.email}:`, userError.message);
      }
    } else {
      await createProfiles(userData.user.id, "faculty", f.name, f.headline, f.location);
    }
  }

  // 2. Create 1 Institution User
  console.log("Creating institution: admin@demo.com");
  const { data: instData, error: instError } = await admin.auth.admin.createUser({
    email: "admin@demo.com",
    password: "password123",
    email_confirm: true,
    user_metadata: { full_name: "Admin Universidad Demo", role: "institution" }
  });

  if (instError) {
    if (instError.message.includes("already exists")) {
       const { data: existingUsers } = await admin.auth.admin.listUsers();
       const existingUser = existingUsers.users.find(u => u.email === "admin@demo.com");
       if (existingUser) {
         await createProfiles(existingUser.id, "institution", "Admin Universidad Demo");
       }
    } else {
      console.error("Error creating institution:", instError.message);
    }
  } else {
    await createProfiles(instData.user.id, "institution", "Admin Universidad Demo");
  }

  console.log("Seed finished successfully!");
}

async function createProfiles(id: string, role: string, name: string, headline?: string, location?: string) {
  // User Profile
  await admin.from("user_profiles").upsert({ id, role: role as any, full_name: name });

  if (role === "faculty") {
    await admin.from("faculty_profiles").upsert({
      id,
      headline,
      location,
      visibility: "public",
      is_active: true,
      is_verified: true,
      years_experience: Math.floor(Math.random() * 15) + 5
    });
    
    // Expertise
    await admin.from("faculty_expertise").upsert({
      faculty_id: id,
      area: headline?.split(" ").pop() || "General",
      level: "Senior"
    });
  } else {
    await admin.from("institutions").upsert({
      id,
      name,
      location: "Madrid, España",
      website: "https://demo.edu"
    });
  }
}

seed().catch(console.error);

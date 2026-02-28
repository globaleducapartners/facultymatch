"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const navLinks = [
  { name: "Inicio", href: "/" },
  { name: "Docentes", href: "/faculty" },
  { name: "Instituciones", href: "/institutions" },
  { name: "Directorio", href: "/directory" },
  { name: "Recursos", href: "/resources" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || null);
      }
    };
    getUser();
  }, []);

  const dashboardHref = role === 'faculty' ? '/dashboard/educator' : '/dashboard/institution';

  return (
    <nav className="flex items-center justify-between px-6 lg:px-12 py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-talentia-blue p-2 rounded-xl text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-navy leading-none">Talentia</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Faculty Network</span>
          </div>
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm font-bold transition-colors ${
                isActive 
                  ? "text-talentia-blue border-b-2 border-talentia-blue pb-1" 
                  : "text-gray-500 hover:text-navy"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Link href={dashboardHref} className="flex items-center gap-2 bg-talentia-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <User size={18} />
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block text-sm font-bold text-navy px-6 py-2.5 hover:bg-gray-50 rounded-xl transition-colors">
              Acceder
            </Link>
            <Link href="/signup" className="bg-talentia-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Crear perfil
            </Link>
          </>
        )}
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-navy"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 lg:hidden shadow-xl animate-in fade-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-lg font-bold text-navy py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />
          {user ? (
            <Link 
              href={dashboardHref} 
              className="text-lg font-bold text-talentia-blue py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="text-lg font-bold text-navy py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Acceder
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

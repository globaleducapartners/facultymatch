"use client";

import Link from "next/link";
import { 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut, 
  Globe
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/app/auth/actions";

interface TopbarProps {
  user: {
    email?: string;
  };
  profile: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
    aneca_accreditation?: string;
  } | null;
}

export function Topbar({ user, profile }: TopbarProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-navy">Talentia</span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">Red Global de Talento Académico</span>
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Globe size={16} />
          ES
          <ChevronDown size={14} />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors relative">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-all focus:outline-none">
              <Avatar className="h-10 w-10 border border-gray-100 ring-2 ring-gray-50">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-talentia-blue/10 text-talentia-blue font-bold">
                  {profile?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
                <div className="hidden md:flex flex-col items-start mr-1">
                  <span className="text-sm font-semibold text-navy leading-none mb-0.5">{profile?.full_name}</span>
                  <span className="text-xs text-gray-400 font-medium capitalize">{profile?.role === 'faculty' ? 'Docente' : profile?.role === 'institution' ? 'Institución' : 'Admin'}</span>
                </div>

              <ChevronDown size={16} className="text-gray-400 hidden md:block" />
            </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                  <DropdownMenuItem className="rounded-lg p-2.5">
                    <Link href={`/app/${profile?.role === 'faculty' ? 'faculty' : profile?.role === 'institution' ? 'institution' : 'admin'}/settings`} className="flex items-center gap-2 w-full">
                      Configuración
                    </Link>
                  </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="rounded-lg p-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
                  <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left">
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

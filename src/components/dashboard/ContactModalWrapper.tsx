"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { ContactModal } from "./ContactModal";

interface ContactModalWrapperProps {
  facultyId: string;
  facultyName: string;
  institutionId: string;
}

export function ContactModalWrapper({ facultyId, facultyName, institutionId }: ContactModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-energy-orange hover:bg-orange-600 text-white font-bold h-14 rounded-xl shadow-xl shadow-orange-100 transition-all text-lg"
      >
        <Mail size={20} className="mr-2" /> Contactar ahora
      </Button>
      <ContactModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        facultyId={facultyId}
        facultyName={facultyName}
        institutionId={institutionId}
      />
    </>
  );
}

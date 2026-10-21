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
        className="h-12 w-full rounded-[10px] bg-fm-blue text-sm font-bold text-white transition-all hover:bg-fm-blue hover:opacity-90 active:scale-[0.98]"
      >
        <Mail size={16} className="mr-2" /> Contactar ahora
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

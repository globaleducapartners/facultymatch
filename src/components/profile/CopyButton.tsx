"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-talentia-blue hover:bg-blue-50 text-navy text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0"
      title="Copiar enlace"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-600" />
          <span className="text-green-600">Copiado</span>
        </>
      ) : (
        <>
          <Copy size={14} className="text-gray-400" />
          <span>Copiar</span>
        </>
      )}
    </button>
  );
}
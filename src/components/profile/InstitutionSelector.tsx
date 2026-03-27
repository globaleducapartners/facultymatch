"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Plus, Building2, X } from "lucide-react";

interface Institution {
  id: string;
  name: string;
  country?: string;
}

interface Props {
  name: string;
  initialValue?: string;
  placeholder?: string;
}

export function InstitutionSelector({ name, initialValue = "", placeholder = "Buscar institución..." }: Props) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<Institution[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("institutions")
        .select("id, name, country")
        .ilike("name", `%${query}%`)
        .limit(8);
      setResults(data || []);
      setShowDropdown(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (inst: Institution) => {
    setQuery(inst.name);
    setShowDropdown(false);
  };

  const exactMatch = results.some(
    (r) => r.name.toLowerCase() === query.toLowerCase()
  );
  const showAddNew = query.length >= 2 && !loading && !exactMatch;

  const inputCls =
    "w-full pl-10 pr-10 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-talentia-blue focus:border-transparent outline-none transition-all font-medium text-sm";

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input that submits the value */}
      <input type="hidden" name={name} value={query} />

      {/* Visible search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className={inputCls}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-400 font-medium">Buscando…</div>
          )}

          {!loading && results.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => handleSelect(inst)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={14} className="text-talentia-blue" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy truncate">{inst.name}</p>
                {inst.country && (
                  <p className="text-xs text-gray-400 font-medium">{inst.country}</p>
                )}
              </div>
            </button>
          ))}

          {showAddNew && (
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left border-t border-gray-50"
            >
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <Plus size={14} className="text-energy-orange" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">Usar &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-gray-400 font-medium">No encontrada — se guardará tal cual</p>
              </div>
            </button>
          )}

          {!loading && results.length === 0 && !showAddNew && (
            <div className="px-4 py-3 text-sm text-gray-400 font-medium">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
}

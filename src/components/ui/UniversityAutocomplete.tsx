"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function UniversityAutocomplete({ value, onChange, placeholder }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('universities_es')
        .select('name, short_name')
        .or(`name.ilike.%${inputValue}%,short_name.ilike.%${inputValue}%`)
        .limit(6);
      if (data) {
        setSuggestions(data.map((u: { name: string }) => u.name));
        setShowSuggestions(true);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const addItem = (item: string) => {
    if (item && !value.includes(item)) {
      onChange([...value, item]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeItem = (item: string) => {
    onChange(value.filter(v => v !== item));
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(item => (
            <span key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50
                         border border-blue-200 text-navy text-sm font-medium rounded-lg">
              {item}
              <button type="button" onClick={() => removeItem(item)}
                className="text-gray-400 hover:text-red-500 transition-colors font-bold">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addItem(inputValue); }
            }}
            placeholder={placeholder || "Escribe el nombre de la universidad..."}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white
                       focus:ring-2 focus:ring-talentia-blue focus:border-transparent
                       outline-none text-sm font-medium text-navy"
          />
          <button type="button" onClick={() => addItem(inputValue)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-navy font-bold
                       text-sm rounded-xl transition-colors whitespace-nowrap">
            Añadir
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200
                          rounded-xl shadow-lg overflow-hidden">
            {suggestions.map(s => (
              <button key={s} type="button" onClick={() => addItem(s)}
                className="w-full text-left px-4 py-3 text-sm font-medium text-navy
                           hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                {s}
              </button>
            ))}
            {inputValue && !suggestions.includes(inputValue) && (
              <button type="button" onClick={() => addItem(inputValue)}
                className="w-full text-left px-4 py-3 text-sm font-medium text-talentia-blue
                           hover:bg-blue-50 transition-colors">
                + Añadir &quot;{inputValue}&quot; (no está en la lista)
              </button>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">
        Escribe al menos 2 letras para ver sugerencias. Puedes añadir centros que no aparezcan.
      </p>
    </div>
  );
}

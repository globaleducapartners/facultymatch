"use client";
import { useState } from "react";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  suggestions?: string[];
}

export function TagInput({ value, onChange, placeholder, maxItems = 20, suggestions = [] }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  );

  const addItem = (item: string) => {
    const clean = item.trim();
    if (clean && !value.includes(clean) && value.length < maxItems) {
      onChange([...value, clean]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeItem = (item: string) => onChange(value.filter(v => v !== item));

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
                className="text-gray-400 hover:text-red-500 font-bold transition-colors">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="flex gap-2">
          <input type="text" value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(inputValue); } }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={placeholder}
            disabled={value.length >= maxItems}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white
                       focus:ring-2 focus:ring-talentia-blue focus:border-transparent
                       outline-none text-sm font-medium text-navy disabled:opacity-50" />
          <button type="button" onClick={() => addItem(inputValue)}
            disabled={!inputValue.trim() || value.length >= maxItems}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-navy font-bold
                       text-sm rounded-xl transition-colors disabled:opacity-50">
            Añadir
          </button>
        </div>
        {showSuggestions && filtered.length > 0 && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200
                          rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            {filtered.slice(0, 8).map(s => (
              <button key={s} type="button" onMouseDown={() => addItem(s)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-navy
                           hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-gray-400">{value.length}/{maxItems}</p>
      )}
    </div>
  );
}

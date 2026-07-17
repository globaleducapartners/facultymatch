"use client";

import { useState } from "react";

const SANS = `'Inter', system-ui, -apple-system, sans-serif`;

interface ChipOption {
  value: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
  allowOther?: boolean;
  otherPlaceholder?: string;
  otherLabel?: string;
  otherValue?: string;
  columns?: number;
  size?: "sm" | "md";
}

const chipBase = (active: boolean, size: "sm" | "md"): React.CSSProperties => ({
  fontFamily: SANS,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  border: "none",
  outline: "none",
  borderRadius: 999,
  fontWeight: 600,
  fontSize: size === "sm" ? 12 : 13,
  padding: size === "sm" ? "6px 14px" : "8px 16px",
  background: active ? "#1B4FD8" : "#F2F6FC",
  color: active ? "#FFFFFF" : "#4B5A7A",
  border: active ? "1px solid #1B4FD8" : "1px solid #D8E2EF",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap" as const,
});

export function ChipGroup({
  options,
  selected,
  onChange,
  multi = false,
  allowOther = false,
  otherPlaceholder = "Especificar…",
  otherLabel = "Otro",
  otherValue = "__other__",
  columns = 0,
  size = "md",
}: ChipGroupProps) {
  const [otherText, setOtherText] = useState("");

  const isSelected = (val: string) => {
    if (multi) return (selected as string[]).includes(val);
    return selected === val;
  };

  const handleClick = (val: string) => {
    if (multi) {
      const arr = selected as string[];
      const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      onChange(next);
    } else {
      onChange(val);
      setOtherText("");
    }
  };

  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (multi) {
      const arr = (selected as string[]).filter((v) => v !== otherValue);
      onChange(text ? [...arr, text] : arr);
    } else {
      onChange(text || otherValue);
    }
  };

  const showOther = allowOther && isSelected(otherValue);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  };

  return (
    <div>
      <div style={containerStyle}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={isSelected(opt.value)}
            tabIndex={0}
            onClick={() => handleClick(opt.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(opt.value);
              }
            }}
            style={chipBase(isSelected(opt.value), size)}
          >
            {opt.label}
          </button>
        ))}
        {allowOther && (
          <button
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={showOther}
            tabIndex={0}
            onClick={() => {
              if (multi) {
                handleClick(otherValue);
              } else {
                handleClick(otherValue);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(otherValue);
              }
            }}
            style={chipBase(showOther, size)}
          >
            {otherLabel}
          </button>
        )}
      </div>
      {showOther && (
        <input
          type="text"
          value={otherText}
          onChange={(e) => handleOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          autoFocus
          style={{
            fontFamily: SANS,
            width: "100%",
            fontSize: 14,
            color: "#0C1018",
            background: "#FFFFFF",
            border: "1px solid #D8E2EF",
            borderRadius: 10,
            padding: "10px 14px",
            outline: "none",
            boxSizing: "border-box",
            marginTop: 10,
            transition: "border-color 0.2s",
          }}
        />
      )}
    </div>
  );
}

// ── Searchable chip group for UNESCO areas ──────────────────────────────────

interface SearchableChipGroupProps {
  items: { value: string; label: string; group?: string }[];
  selected: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableChipGroup({
  items,
  selected,
  onChange,
  placeholder = "Buscar área…",
}: SearchableChipGroupProps) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? items.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.value.toLowerCase().includes(query.toLowerCase()) ||
          (i.group && i.group.toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  // Group by category
  const grouped: Record<string, typeof items> = {};
  for (const item of filtered) {
    const group = item.group || "Otras áreas";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          fontFamily: SANS,
          width: "100%",
          fontSize: 14,
          color: "#0C1018",
          background: "#FFFFFF",
          border: "1px solid #D8E2EF",
          borderRadius: 10,
          padding: "10px 14px",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: 12,
          transition: "border-color 0.2s",
        }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ fontFamily: SANS, fontSize: 13, color: "#9CA3AF", padding: 8 }}>
            Sin resultados para &ldquo;{query}&rdquo;
          </div>
        )}
        {filtered.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected === item.value}
            tabIndex={0}
            onClick={() => {
              onChange(item.value);
              setQuery("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(item.value);
                setQuery("");
              }
            }}
            style={chipBase(selected === item.value, "md")}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
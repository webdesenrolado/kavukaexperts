"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  /** Texto secundário (mostrado em fonte menor) */
  hint?: string;
  /** Desabilita a opção */
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Tamanho do trigger */
  size?: "sm" | "md";
  /** Largura mínima do popover (auto = igual ao trigger) */
  popoverMinWidth?: number | "auto";
}

/**
 * Dropdown estilizado, substitui <select> nativo (que herda visual do OS).
 * - Trigger com ChevronDown lucide
 * - Listbox posicionado abaixo
 * - Click fora ou ESC fecha
 * - Acessível via keyboard (Enter/Space abre, ↑↓ navega, Enter seleciona)
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  disabled = false,
  className = "",
  size = "md",
  popoverMinWidth = "auto",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Foca o item selecionado quando abre
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[focusedIndex];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        setOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(options.length - 1);
    }
  }

  const heightClass = size === "sm" ? "py-1.5 text-xs" : "py-2 text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          w-full px-3 ${heightClass}
          rounded-lg border bg-transparent
          flex items-center justify-between gap-2
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${open ? "ring-2 ring-[#ff6a00]/40 border-[#ff6a00]/60" : "hover:border-[#ff6a00]/40"}
        `}
        style={{ borderColor: open ? "#ff6a00" : "var(--border)" }}
      >
        <span className={`truncate text-left ${!selected ? "opacity-50" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border shadow-2xl py-1"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            minWidth: popoverMinWidth === "auto" ? "100%" : popoverMinWidth,
            left: 0,
            right: popoverMinWidth === "auto" ? 0 : "auto",
          }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs opacity-50 italic">Sem opções</div>
          ) : (
            options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused = idx === focusedIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`
                    w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2
                    transition-colors
                    ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    ${isFocused && !opt.disabled ? "bg-[#ff6a00]/15" : ""}
                    ${isSelected ? "text-[#ff6a00] font-semibold" : ""}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.hint && <div className="text-[10px] opacity-60 truncate">{opt.hint}</div>}
                  </div>
                  {isSelected && <Check size={14} className="shrink-0 text-[#ff6a00]" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

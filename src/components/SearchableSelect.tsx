import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Selecione...", className = "" }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`flex items-center justify-between w-full border border-slate-200 rounded-lg p-3 text-sm bg-white cursor-pointer shadow-sm ${className}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch("");
        }}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-60 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden" style={{ zIndex: 9999 }}>
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
              placeholder="Buscar..."
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-slate-400 text-center">Nenhuma opção encontrada</div>
            ) : (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`p-3 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${value === opt ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-700'}`}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

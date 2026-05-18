import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SearchableMultiSelectProps {
  options: string[];
  value: string; // Comma separated string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number;
}

export function SearchableMultiSelect({ options, value, onChange, placeholder = "Selecione...", className = "", maxSelections }: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedValues = value ? value.split(',').map(v => v.trim()).filter(v => v) : [];

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

  const handleSelect = (opt: string) => {
    if (selectedValues.includes(opt)) {
      const newVals = selectedValues.filter(v => v !== opt);
      onChange(newVals.join(', '));
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        alert(`Você pode selecionar no máximo ${maxSelections} valores.`);
        return;
      }
      const newVals = [...selectedValues, opt];
      onChange(newVals.join(', '));
    }
    setSearch("");
  };

  const removeValue = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    const newVals = selectedValues.filter(v => v !== opt);
    onChange(newVals.join(', '));
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`flex items-center justify-between w-full border border-slate-200 rounded-lg p-2 text-sm bg-white cursor-pointer shadow-sm ${className}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch("");
        }}
        style={{ minHeight: '46px' }}
      >
        <div className="flex flex-wrap gap-1 items-center flex-1 pr-2">
          {selectedValues.length === 0 ? (
            <span className="text-slate-400 p-1">{placeholder}</span>
          ) : (
            selectedValues.map((val, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 flex items-center gap-1 rounded-md text-xs border border-blue-200">
                {val}
                <button type="button" onClick={(e) => removeValue(e, val)} className="hover:text-red-500 font-bold ml-1">
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
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
              filteredOptions.map((opt, i) => {
                const isSelected = selectedValues.includes(opt);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 text-sm cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50 text-blue-700 font-medium' : 'text-slate-700'}`}
                    onClick={() => handleSelect(opt)}
                  >
                    <span>{opt}</span>
                    {isSelected && <span className="text-blue-500 text-xs text-medium">Selecionado</span>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

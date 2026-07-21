import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  onClose: () => void;
}

export default function Modal({
  isOpen,
  title,
  options,
  selectedOptions,
  onToggleOption,
  onClose
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="bg-[#F4F1EA] w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] border border-[#D1CBBB] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D1CBBB] flex items-center justify-between bg-[#E3DEC6]">
          <h3 className="font-bold text-lg text-[#3D3D3D]">{title}</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-[#3D3D3D] hover:bg-[#D1CBBB] p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {options.length === 0 ? (
            <p className="text-sm text-center text-[#666] py-8">
              Keine Optionen verfügbar. Passe sie in den Einstellungen an.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onToggleOption(option)}
                    className={`inline-flex items-center px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#728264] text-white border-[#728264] shadow-xs'
                        : 'bg-[#FCFAF5] text-[#3D3D3D] border-[#D1CBBB] hover:border-[#728264]'
                    }`}
                  >
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#D1CBBB] bg-[#FCFAF5] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#728264] hover:bg-[#5f6d53] text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md w-full sm:w-auto"
          >
            Fertig & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

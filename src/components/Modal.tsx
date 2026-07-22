import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
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
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#F4F1EA] dark:bg-[#252B21] w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] border border-[#D1CBBB] dark:border-[#384133] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D1CBBB] dark:border-[#384133] flex items-center justify-between bg-[#E3DEC6] dark:bg-[#2A3126] shrink-0">
          <h3 className="font-bold text-lg text-[#3D3D3D] dark:text-[#EAE6DB]">{title}</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-[#3D3D3D] dark:text-[#EAE6DB] hover:bg-[#D1CBBB] dark:hover:bg-[#384133] p-1.5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {options.length === 0 ? (
            <p className="text-sm text-center text-[#666] dark:text-[#A1A89A] py-8">
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
                        ? 'bg-[#728264] dark:bg-[#5C6B50] text-white border-[#728264] shadow-xs'
                        : 'bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] border-[#D1CBBB] dark:border-[#384133] hover:border-[#728264]'
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
        <div className="px-5 py-4 border-t border-[#D1CBBB] dark:border-[#384133] bg-[#FCFAF5] dark:bg-[#1C211B] flex justify-end shrink-0">
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

  return ReactDOM.createPortal(modalContent, document.body);
}

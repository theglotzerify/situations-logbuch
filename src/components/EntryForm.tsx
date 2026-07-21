import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Smile, Activity, HelpCircle, Save, Undo2 } from 'lucide-react';
import Modal from './Modal';

interface EntryFormProps {
  editEntry: LogEntry | null;
  onSave: (entry: LogEntry) => void;
  onCancelEdit: () => void;
  optionsGefuehle: string[];
  optionsKoerper: string[];
}

export default function EntryForm({
  editEntry,
  onSave,
  onCancelEdit,
  optionsGefuehle,
  optionsKoerper
}: EntryFormProps) {
  const [situation, setSituation] = useState('');
  const [gedanken, setGedanken] = useState('');
  const [verhalten, setVerhalten] = useState('');
  const [resultatKurz, setResultatKurz] = useState('');
  const [resultatLang, setResultatLang] = useState('');
  
  const [selectedGefuehle, setSelectedGefuehle] = useState<string[]>([]);
  const [selectedKoerper, setSelectedKoerper] = useState<string[]>([]);

  const [activeModal, setActiveModal] = useState<'gefuehle' | 'koerper' | null>(null);

  // Auto-resize textareas effect
  const textareaRefs = {
    situation: useRef<HTMLTextAreaElement>(null),
    gedanken: useRef<HTMLTextAreaElement>(null),
    verhalten: useRef<HTMLTextAreaElement>(null),
    resultatKurz: useRef<HTMLTextAreaElement>(null),
    resultatLang: useRef<HTMLTextAreaElement>(null),
  };

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    // Synchronize editing state
    if (editEntry) {
      setSituation(editEntry.situation);
      setGedanken(editEntry.gedanken);
      setVerhalten(editEntry.verhalten);
      setResultatKurz(editEntry.resultat_kurz);
      setResultatLang(editEntry.resultat_lang);
      setSelectedGefuehle(editEntry.gefuehle || []);
      setSelectedKoerper(editEntry.koerper || []);
    } else {
      resetForm();
    }
  }, [editEntry]);

  // Adjust height on state change
  useEffect(() => {
    Object.values(textareaRefs).forEach(ref => {
      adjustHeight(ref.current);
    });
  }, [situation, gedanken, verhalten, resultatKurz, resultatLang]);

  const resetForm = () => {
    setSituation('');
    setGedanken('');
    setVerhalten('');
    setResultatKurz('');
    setResultatLang('');
    setSelectedGefuehle([]);
    setSelectedKoerper([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least some fields are filled
    if (!situation.trim() && !gedanken.trim() && selectedGefuehle.length === 0 && selectedKoerper.length === 0) {
      alert('Bitte fülle mindestens ein Feld aus (z.B. Situation oder Gefühle), um einen Eintrag zu speichern.');
      return;
    }

    const entry: LogEntry = {
      date: editEntry ? editEntry.date : new Date().toLocaleString('de-DE'),
      situation: situation.trim(),
      gedanken: gedanken.trim(),
      gefuehle: selectedGefuehle,
      koerper: selectedKoerper,
      verhalten: verhalten.trim(),
      resultat_kurz: resultatKurz.trim(),
      resultat_lang: resultatLang.trim()
    };

    onSave(entry);
    if (!editEntry) {
      resetForm();
    }
  };

  const toggleGefuehl = (option: string) => {
    setSelectedGefuehle(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const toggleKoerper = (option: string) => {
    setSelectedKoerper(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-4">
      <div className="bg-[#F4F1EA] rounded-2xl shadow-lg border border-[#D1CBBB]/50 p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Situation */}
          <div>
            <label htmlFor="situation" className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              1. Situation
            </label>
            <textarea
              id="situation"
              ref={textareaRefs.situation}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Wo warst du? Wer war dabei? Was genau ist passiert?"
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Gedanken */}
          <div>
            <label htmlFor="gedanken" className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              2. Gedanken
            </label>
            <textarea
              id="gedanken"
              ref={textareaRefs.gedanken}
              value={gedanken}
              onChange={(e) => setGedanken(e.target.value)}
              placeholder="Was ging dir durch den Kopf? Welche automatischen Bewertungen oder Zweifel hattest du?"
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Gefühle */}
          <div>
            <label className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              3. Gefühle / Emotionen
            </label>
            <button
              type="button"
              onClick={() => setActiveModal('gefuehle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#728264] hover:bg-[#728264]/5 font-semibold text-sm transition-all"
            >
              <Smile size={18} />
              {selectedGefuehle.length > 0 
                ? `Gefühle anpassen (${selectedGefuehle.length} ausgewählt)` 
                : 'Gefühle auswählen...'}
            </button>

            {selectedGefuehle.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedGefuehle.map(g => (
                  <span 
                    key={g} 
                    onClick={() => toggleGefuehl(g)}
                    className="inline-flex items-center gap-1.5 bg-[#728264] text-[#F4F1EA] text-xs font-semibold px-2.5 py-1.5 rounded-full cursor-pointer hover:bg-[#804A4A] hover:line-through transition-all"
                    title="Klicken zum Entfernen"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Körperliche Reaktionen */}
          <div>
            <label className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              4. Körperliche Reaktionen / Physiologie
            </label>
            <button
              type="button"
              onClick={() => setActiveModal('koerper')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#728264] hover:bg-[#728264]/5 font-semibold text-sm transition-all"
            >
              <Activity size={18} />
              {selectedKoerper.length > 0 
                ? `Reaktionen anpassen (${selectedKoerper.length} ausgewählt)` 
                : 'Symptome auswählen...'}
            </button>

            {selectedKoerper.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedKoerper.map(k => (
                  <span 
                    key={k} 
                    onClick={() => toggleKoerper(k)}
                    className="inline-flex items-center gap-1.5 bg-[#728264] text-[#F4F1EA] text-xs font-semibold px-2.5 py-1.5 rounded-full cursor-pointer hover:bg-[#804A4A] hover:line-through transition-all"
                    title="Klicken zum Entfernen"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Verhalten */}
          <div>
            <label htmlFor="verhalten" className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              5. Verhalten
            </label>
            <textarea
              id="verhalten"
              ref={textareaRefs.verhalten}
              value={verhalten}
              onChange={(e) => setVerhalten(e.target.value)}
              placeholder="Wie hast du reagiert? Was hast du gesagt, getan oder vermieden?"
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Resultat (kurzfristig) */}
          <div>
            <label htmlFor="resultat_kurz" className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              6. Resultat (kurzfristig)
            </label>
            <textarea
              id="resultat_kurz"
              ref={textareaRefs.resultatKurz}
              value={resultatKurz}
              onChange={(e) => setResultatKurz(e.target.value)}
              placeholder="Was war die sofortige Auswirkung auf dich oder die Situation?"
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Resultat (langfristig) */}
          <div>
            <label htmlFor="resultat_lang" className="block text-sm font-bold text-[#3D3D3D] mb-1.5">
              7. Resultat (langfristig)
            </label>
            <textarea
              id="resultat_lang"
              ref={textareaRefs.resultatLang}
              value={resultatLang}
              onChange={(e) => setResultatLang(e.target.value)}
              placeholder="Welche dauerhaften Folgen hat dieses Verhaltensmuster für dich im Alltag?"
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-[#728264] hover:bg-[#5f6d53] text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editEntry ? 'Änderungen speichern' : 'Situation speichern'}
            </button>
            {editEntry && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="bg-transparent text-[#804A4A] border-2 border-[#804A4A] hover:bg-[#804A4A]/5 font-bold py-3.5 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2"
              >
                <Undo2 size={18} />
                Abbrechen
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Pop-up Modals for multi-select */}
      <Modal
        isOpen={activeModal === 'gefuehle'}
        title="Gefühle auswählen"
        options={optionsGefuehle}
        selectedOptions={selectedGefuehle}
        onToggleOption={toggleGefuehl}
        onClose={() => setActiveModal(null)}
      />

      <Modal
        isOpen={activeModal === 'koerper'}
        title="Körperliche Reaktionen"
        options={optionsKoerper}
        selectedOptions={selectedKoerper}
        onToggleOption={toggleKoerper}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

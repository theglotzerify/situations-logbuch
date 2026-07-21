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
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">1. Auslöser</span>
            </div>
            <label htmlFor="situation" className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Situation / Was ist passiert?
            </label>
            <p className="text-xs text-gray-500 mb-2">Wo warst du? Wer war dabei? Was genau ist passiert?</p>
            <textarea
              id="situation"
              ref={textareaRefs.situation}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="z.B. Mein Chef hat mich kurzfristig zu einem Gespräch gerufen..."
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Gedanken */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">2. Kognition</span>
            </div>
            <label htmlFor="gedanken" className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Gedanken / Was ging dir durch den Kopf?
            </label>
            <p className="text-xs text-gray-500 mb-2">Welche automatischen Gedanken oder Bewertungen hattest du?</p>
            <textarea
              id="gedanken"
              ref={textareaRefs.gedanken}
              value={gedanken}
              onChange={(e) => setGedanken(e.target.value)}
              placeholder="z.B. Ich habe bestimmt etwas falsch gemacht. Er wird mich kündigen..."
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Gefühle */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">3. Emotionen</span>
            </div>
            <label className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Gefühle / Emotionen
            </label>
            <p className="text-xs text-gray-500 mb-3">Wie hast du dich in dieser Situation gefühlt?</p>
            
            <button
              type="button"
              onClick={() => setActiveModal('gefuehle')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-[#728264] text-[#728264] hover:bg-[#728264]/5 font-semibold text-sm transition-all"
            >
              <Smile size={18} />
              {selectedGefuehle.length > 0 
                ? `Gefühle anpassen (${selectedGefuehle.length} ausgewählt)` 
                : 'Gefühle auswählen...'}
            </button>

            {selectedGefuehle.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedGefuehle.map(g => (
                  <span 
                    key={g} 
                    onClick={() => toggleGefuehl(g)}
                    className="inline-flex items-center gap-1.5 bg-[#728264] text-[#F4F1EA] text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#804A4A] hover:line-through transition-all"
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
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">4. Physiologie</span>
            </div>
            <label className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Körperliche Reaktionen
            </label>
            <p className="text-xs text-gray-500 mb-3">Welche körperlichen Symptome konntest du wahrnehmen?</p>
            
            <button
              type="button"
              onClick={() => setActiveModal('koerper')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-[#728264] text-[#728264] hover:bg-[#728264]/5 font-semibold text-sm transition-all"
            >
              <Activity size={18} />
              {selectedKoerper.length > 0 
                ? `Reaktionen anpassen (${selectedKoerper.length} ausgewählt)` 
                : 'Reaktionen auswählen...'}
            </button>

            {selectedKoerper.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedKoerper.map(k => (
                  <span 
                    key={k} 
                    onClick={() => toggleKoerper(k)}
                    className="inline-flex items-center gap-1.5 bg-[#728264] text-[#F4F1EA] text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#804A4A] hover:line-through transition-all"
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
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">5. Verhalten</span>
            </div>
            <label htmlFor="verhalten" className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Verhalten / Was hast du getan?
            </label>
            <p className="text-xs text-gray-500 mb-2">Wie hast du reagiert? Was hast du gesagt oder getan (oder vermieden)?</p>
            <textarea
              id="verhalten"
              ref={textareaRefs.verhalten}
              value={verhalten}
              onChange={(e) => setVerhalten(e.target.value)}
              placeholder="z.B. Ich habe hektisch genickt, mich sofort entschuldigt und versucht mich zu erklären..."
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Resultat (kurzfristig) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">6. Konsequenzen (Kurz)</span>
            </div>
            <label htmlFor="resultat_kurz" className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Resultat (kurzfristig)
            </label>
            <p className="text-xs text-gray-500 mb-2">Was war die sofortige Auswirkung auf dich oder die Situation?</p>
            <textarea
              id="resultat_kurz"
              ref={textareaRefs.resultatKurz}
              value={resultatKurz}
              onChange={(e) => setResultatKurz(e.target.value)}
              placeholder="z.B. Kurzfristig nahm die Anspannung ab, aber ich fühlte mich gedemütigt..."
              rows={2}
              className="w-full p-3.5 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] focus:ring-2 focus:ring-[#728264]/15 outline-none transition-all resize-none min-h-[70px]"
            />
          </div>

          {/* Resultat (langfristig) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#6e7b61] bg-[#728264]/10 py-1 px-2.5 rounded-md">7. Konsequenzen (Lang)</span>
            </div>
            <label htmlFor="resultat_lang" className="block text-sm font-bold text-[#3D3D3D] mb-1">
              Resultat (langfristig)
            </label>
            <p className="text-xs text-gray-500 mb-2">Welche dauerhaften Folgen hat dieses Verhaltensmuster für dich?</p>
            <textarea
              id="resultat_lang"
              ref={textareaRefs.resultatLang}
              value={resultatLang}
              onChange={(e) => setResultatLang(e.target.value)}
              placeholder="z.B. Ich gehe meinem Chef aus dem Weg, meine Angst vor Kritik wächst weiter..."
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

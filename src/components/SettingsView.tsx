import React, { useState, useRef } from 'react';
import { LogEntry } from '../types';
import { Download, Upload, Trash2, Plus, Edit2, AlertTriangle, RefreshCw, Sun, Moon } from 'lucide-react';

interface SettingsViewProps {
  optionsGefuehle: string[];
  optionsKoerper: string[];
  entries: LogEntry[];
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onUpdateGefuehle: (newOptions: string[]) => void;
  onUpdateKoerper: (newOptions: string[]) => void;
  onUpdateEntries: (newEntries: LogEntry[]) => void;
  onResetAll: () => void;
}

export default function SettingsView({
  optionsGefuehle,
  optionsKoerper,
  entries,
  darkMode = false,
  onToggleDarkMode,
  onUpdateGefuehle,
  onUpdateKoerper,
  onUpdateEntries,
  onResetAll
}: SettingsViewProps) {
  const [newGefuehl, setNewGefuehl] = useState('');
  const [newKoerper, setNewKoerper] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Add tag
  const handleAddGefuehl = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newGefuehl.trim();
    if (val && !optionsGefuehle.includes(val)) {
      onUpdateGefuehle([...optionsGefuehle, val]);
      setNewGefuehl('');
    }
  };

  const handleAddKoerper = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newKoerper.trim();
    if (val && !optionsKoerper.includes(val)) {
      onUpdateKoerper([...optionsKoerper, val]);
      setNewKoerper('');
    }
  };

  // Remove tag
  const handleRemoveGefuehl = (index: number) => {
    const itemToRemove = optionsGefuehle[index];
    if (confirm(`Möchtest du "${itemToRemove}" wirklich aus der Standardliste löschen?`)) {
      const updated = optionsGefuehle.filter((_, i) => i !== index);
      onUpdateGefuehle(updated);
    }
  };

  const handleRemoveKoerper = (index: number) => {
    const itemToRemove = optionsKoerper[index];
    if (confirm(`Möchtest du "${itemToRemove}" wirklich aus der Standardliste löschen?`)) {
      const updated = optionsKoerper.filter((_, i) => i !== index);
      onUpdateKoerper(updated);
    }
  };

  // Edit tag name + update in existing logs
  const handleEditGefuehl = (index: number) => {
    const oldVal = optionsGefuehle[index];
    const newVal = prompt(`Gefühl bearbeiten:`, oldVal);
    if (newVal !== null && newVal.trim() !== '' && newVal.trim() !== oldVal) {
      const cleanVal = newVal.trim();
      
      // Update options
      const updatedOptions = [...optionsGefuehle];
      updatedOptions[index] = cleanVal;
      onUpdateGefuehle(updatedOptions);

      // Update in entries
      const updatedEntries = entries.map(entry => {
        if (entry.gefuehle && entry.gefuehle.includes(oldVal)) {
          return {
            ...entry,
            gefuehle: entry.gefuehle.map(g => g === oldVal ? cleanVal : g)
          };
        }
        return entry;
      });
      onUpdateEntries(updatedEntries);
    }
  };

  const handleEditKoerper = (index: number) => {
    const oldVal = optionsKoerper[index];
    const newVal = prompt(`Körperliche Reaktion bearbeiten:`, oldVal);
    if (newVal !== null && newVal.trim() !== '' && newVal.trim() !== oldVal) {
      const cleanVal = newVal.trim();

      // Update options
      const updatedOptions = [...optionsKoerper];
      updatedOptions[index] = cleanVal;
      onUpdateKoerper(updatedOptions);

      // Update in entries
      const updatedEntries = entries.map(entry => {
        if (entry.koerper && entry.koerper.includes(oldVal)) {
          return {
            ...entry,
            koerper: entry.koerper.map(k => k === oldVal ? cleanVal : k)
          };
        }
        return entry;
      });
      onUpdateEntries(updatedEntries);
    }
  };

  // EXPORT BACKUP
  const exportBackup = () => {
    const backupData = {
      version: '2.0-react',
      exportDate: new Date().toISOString(),
      entries: entries,
      optionsGefuehle: optionsGefuehle,
      optionsKoerper: optionsKoerper
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `therapie_logbuch_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // IMPORT BACKUP
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);

        // Simple validation
        if (!parsed || (!Array.isArray(parsed.entries) && !Array.isArray(parsed))) {
          throw new Error('Ungültiges Datenformat. Keine Logbucheinträge gefunden.');
        }

        const importedEntries: LogEntry[] = parsed.entries || parsed;
        const importedGefuehle: string[] = parsed.optionsGefuehle || [];
        const importedKoerper: string[] = parsed.optionsKoerper || [];

        // Choose merge vs overwrite
        const mode = confirm(
          `Backup-Datei erfolgreich gelesen!\n\n` +
          `Einträge im Backup: ${importedEntries.length}\n` +
          `Einträge aktuell in App: ${entries.length}\n\n` +
          `Möchtest du diese Einträge zusammenführen (Zusammenführen) oder deine aktuellen Einträge löschen und ersetzen (Überschreiben)?\n\n` +
          `[OK] = Zusammenführen (Empfohlen)\n` +
          `[Abbrechen] = Überschreiben (Aktuelle Daten werden ersetzt)`
        );

        let finalEntries = [...entries];
        if (mode) {
          // Merge: Add if not already present based on date & situation comparison
          importedEntries.forEach(imp => {
            const exists = entries.some(curr => curr.date === imp.date && curr.situation === imp.situation);
            if (!exists) {
              finalEntries.push(imp);
            }
          });
        } else {
          finalEntries = importedEntries;
        }

        onUpdateEntries(finalEntries);

        // Update tags if available
        if (importedGefuehle.length > 0) {
          const combinedG = Array.from(new Set([...optionsGefuehle, ...importedGefuehle]));
          onUpdateGefuehle(combinedG);
        }
        if (importedKoerper.length > 0) {
          const combinedK = Array.from(new Set([...optionsKoerper, ...importedKoerper]));
          onUpdateKoerper(combinedK);
        }

        setImportStatus({
          type: 'success',
          message: `Erfolgreich importiert! Insgesamt ${finalEntries.length} Einträge vorhanden.`
        });

      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: err.message || 'Fehler beim Lesen der Datei. Bitte lade eine gültige .json-Datei hoch.'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-2">
      
      {/* 0. Appearance / Dark Mode Toggle Card */}
      <div className="bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl border border-[#D1CBBB]/50 dark:border-[#384133] p-5 shadow-sm transition-colors flex items-center justify-between">
        <div className="space-y-0.5 pr-4">
          <h3 className="font-bold text-base text-[#3D3D3D] dark:text-[#EAE6DB] flex items-center gap-2">
            {darkMode ? <Moon size={18} className="text-[#9BB08A]" /> : <Sun size={18} className="text-[#728264]" />}
            <span>Erscheinungsbild</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#A1A89A]">
            Zwischen hellem und augenschonendem dunklem Modus wechseln.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleDarkMode}
          className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
            darkMode ? 'bg-[#728264]' : 'bg-[#D1CBBB]'
          }`}
          role="switch"
          aria-checked={darkMode}
        >
          <div
            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center shrink-0 ${
              darkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            {darkMode ? (
              <Moon size={12} className="text-[#252B21]" />
            ) : (
              <Sun size={12} className="text-[#728264]" />
            )}
          </div>
        </button>
      </div>

      {/* 1. Feelings editing */}
      <div className="bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl border border-[#D1CBBB]/50 dark:border-[#384133] p-5 shadow-sm space-y-4 transition-colors">
        <div>
          <h3 className="font-bold text-base text-[#3D3D3D] dark:text-[#EAE6DB] mb-0.5">Gefühle anpassen</h3>
          <p className="text-xs text-gray-500 dark:text-[#A1A89A]">Diese Gefühle stehen dir beim Ausfüllen des Formulars zur Auswahl.</p>
        </div>

        <div className="flex flex-wrap gap-2 p-2.5 bg-[#FCFAF5] dark:bg-[#1C211B] rounded-xl border border-[#D1CBBB]/30 dark:border-[#384133] min-h-[48px]">
          {optionsGefuehle.map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-1.5 bg-[#E3DEC6] dark:bg-[#2A3126] border border-[#D1CBBB] dark:border-[#384133] text-[#3D3D3D] dark:text-[#EAE6DB] text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
            >
              <span>{item}</span>
              <div className="flex items-center gap-0.5 border-l border-[#D1CBBB]/60 dark:border-[#384133] pl-1.5 ml-1">
                <button 
                  onClick={() => handleEditGefuehl(idx)}
                  className="text-gray-500 dark:text-[#A1A89A] hover:text-[#728264] dark:hover:text-[#9BB08A] p-0.5 rounded-sm"
                  title="Bearbeiten"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleRemoveGefuehl(idx)}
                  className="text-gray-500 dark:text-[#A1A89A] hover:text-[#804A4A] dark:hover:text-[#D47070] p-0.5 rounded-sm"
                  title="Entfernen"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddGefuehl} className="flex gap-2">
          <input
            type="text"
            value={newGefuehl}
            onChange={(e) => setNewGefuehl(e.target.value)}
            placeholder="Neues Gefühl eintragen..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#D1CBBB] dark:border-[#384133] bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] placeholder:text-gray-400 dark:placeholder:text-[#838F7A] text-sm focus:border-[#728264] outline-none transition-all"
          />
          <button
            type="submit"
            className="bg-[#728264] dark:bg-[#5C6B50] hover:bg-[#5f6d53] text-white p-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* 2. Physical Reactions editing */}
      <div className="bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl border border-[#D1CBBB]/50 dark:border-[#384133] p-5 shadow-sm space-y-4 transition-colors">
        <div>
          <h3 className="font-bold text-base text-[#3D3D3D] dark:text-[#EAE6DB] mb-0.5">Körperliche Reaktionen anpassen</h3>
          <p className="text-xs text-gray-500 dark:text-[#A1A89A]">Diese Symptome stehen dir beim Ausfüllen des Formulars zur Auswahl.</p>
        </div>

        <div className="flex flex-wrap gap-2 p-2.5 bg-[#FCFAF5] dark:bg-[#1C211B] rounded-xl border border-[#D1CBBB]/30 dark:border-[#384133] min-h-[48px]">
          {optionsKoerper.map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-1.5 bg-[#E3DEC6] dark:bg-[#2A3126] border border-[#D1CBBB] dark:border-[#384133] text-[#3D3D3D] dark:text-[#EAE6DB] text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
            >
              <span>{item}</span>
              <div className="flex items-center gap-0.5 border-l border-[#D1CBBB]/60 dark:border-[#384133] pl-1.5 ml-1">
                <button 
                  onClick={() => handleEditKoerper(idx)}
                  className="text-gray-500 dark:text-[#A1A89A] hover:text-[#728264] dark:hover:text-[#9BB08A] p-0.5 rounded-sm"
                  title="Bearbeiten"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleRemoveKoerper(idx)}
                  className="text-gray-500 dark:text-[#A1A89A] hover:text-[#804A4A] dark:hover:text-[#D47070] p-0.5 rounded-sm"
                  title="Entfernen"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddKoerper} className="flex gap-2">
          <input
            type="text"
            value={newKoerper}
            onChange={(e) => setNewKoerper(e.target.value)}
            placeholder="Neue Reaktion eintragen..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#D1CBBB] dark:border-[#384133] bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] placeholder:text-gray-400 dark:placeholder:text-[#838F7A] text-sm focus:border-[#728264] outline-none transition-all"
          />
          <button
            type="submit"
            className="bg-[#728264] dark:bg-[#5C6B50] hover:bg-[#5f6d53] text-white p-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* 3. Export / Import Backup */}
      <div className="bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl border border-[#D1CBBB]/50 dark:border-[#384133] p-5 shadow-sm space-y-4 transition-colors">
        <div>
          <h3 className="font-bold text-base text-[#3D3D3D] dark:text-[#EAE6DB] mb-0.5">Datensicherung (Backup)</h3>
          <p className="text-xs text-gray-500 dark:text-[#A1A89A]">Da deine Daten ausschließlich offline auf deinem Gerät (Browser) gesichert werden, solltest du regelmäßig Backups exportieren.</p>
        </div>

        {importStatus.type && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold ${
            importStatus.type === 'success' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
          }`}>
            {importStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={exportBackup}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#728264] dark:bg-[#5C6B50] hover:bg-[#5f6d53] text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            <Download size={16} />
            Backup herunterladen (.json)
          </button>

          <button
            type="button"
            onClick={triggerFileSelect}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-transparent text-[#728264] dark:text-[#9BB08A] border-2 border-[#728264] dark:border-[#9BB08A] hover:bg-[#728264]/5 font-bold rounded-xl text-sm transition-all"
          >
            <Upload size={16} />
            Backup wiederherstellen
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={importBackup}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* 4. Danger Zone */}
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 space-y-3 transition-colors">
        <div className="flex items-center gap-2 text-[#804A4A] dark:text-[#D47070]">
          <AlertTriangle size={18} />
          <h4 className="font-bold text-sm">Gefahrenzone</h4>
        </div>
        <p className="text-xs text-gray-600 dark:text-[#C5C0B4] leading-relaxed">
          Durch das Zurücksetzen der App-Daten werden alle deine erstellten Logbucheinträge sowie deine personalisierten Gefühle und Reaktionen unwiderruflich gelöscht.
        </p>
        <button
          type="button"
          onClick={onResetAll}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#804A4A] dark:bg-[#B35252] hover:bg-[#6c3a3a] text-white font-bold rounded-xl text-xs transition-all shadow-sm"
        >
          <RefreshCw size={14} />
          App-Daten komplett zurücksetzen
        </button>
      </div>

    </div>
  );
}


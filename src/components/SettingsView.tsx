import React, { useState, useRef } from 'react';
import { LogEntry } from '../types';
import { Download, Upload, Trash2, Plus, Edit2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';

interface SettingsViewProps {
  optionsGefuehle: string[];
  optionsKoerper: string[];
  entries: LogEntry[];
  onUpdateGefuehle: (newOptions: string[]) => void;
  onUpdateKoerper: (newOptions: string[]) => void;
  onUpdateEntries: (newEntries: LogEntry[]) => void;
  onResetAll: () => void;
}

export default function SettingsView({
  optionsGefuehle,
  optionsKoerper,
  entries,
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
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-6">
      
      {/* 1. Feelings editing */}
      <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#3D3D3D] mb-0.5">Gefühle anpassen</h3>
          <p className="text-xs text-gray-500">Diese Gefühle stehen dir beim Ausfüllen des Formulars zur Auswahl.</p>
        </div>

        <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-2 bg-[#FCFAF5] rounded-xl border border-[#D1CBBB]/30">
          {optionsGefuehle.map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-1.5 bg-[#E3DEC6] border border-[#D1CBBB] text-[#3D3D3D] text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
            >
              <span>{item}</span>
              <div className="flex items-center gap-0.5 border-l border-[#D1CBBB]/60 pl-1.5 ml-1">
                <button 
                  onClick={() => handleEditGefuehl(idx)}
                  className="text-gray-500 hover:text-[#728264] p-0.5 rounded-sm"
                  title="Bearbeiten"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleRemoveGefuehl(idx)}
                  className="text-gray-500 hover:text-[#804A4A] p-0.5 rounded-sm"
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
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] outline-none transition-all"
          />
          <button
            type="submit"
            className="bg-[#728264] hover:bg-[#5f6d53] text-white p-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* 2. Physical Reactions editing */}
      <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#3D3D3D] mb-0.5">Körperliche Reaktionen anpassen</h3>
          <p className="text-xs text-gray-500">Diese Symptome stehen dir beim Ausfüllen des Formulars zur Auswahl.</p>
        </div>

        <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-2 bg-[#FCFAF5] rounded-xl border border-[#D1CBBB]/30">
          {optionsKoerper.map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-1.5 bg-[#E3DEC6] border border-[#D1CBBB] text-[#3D3D3D] text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
            >
              <span>{item}</span>
              <div className="flex items-center gap-0.5 border-l border-[#D1CBBB]/60 pl-1.5 ml-1">
                <button 
                  onClick={() => handleEditKoerper(idx)}
                  className="text-gray-500 hover:text-[#728264] p-0.5 rounded-sm"
                  title="Bearbeiten"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleRemoveKoerper(idx)}
                  className="text-gray-500 hover:text-[#804A4A] p-0.5 rounded-sm"
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
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#D1CBBB] bg-[#FCFAF5] text-[#3D3D3D] text-sm focus:border-[#728264] outline-none transition-all"
          />
          <button
            type="submit"
            className="bg-[#728264] hover:bg-[#5f6d53] text-white p-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* 3. Export / Import Backup */}
      <div className="bg-[#F4F1EA] rounded-2xl border border-[#D1CBBB]/50 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#3D3D3D] mb-0.5">Datensicherung (Backup)</h3>
          <p className="text-xs text-gray-500">Da deine Daten ausschließlich offline auf deinem Gerät (Browser) gesichert werden, solltest du regelmäßig Backups exportieren.</p>
        </div>

        {importStatus.type && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold ${
            importStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {importStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={exportBackup}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#728264] hover:bg-[#5f6d53] text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            <Download size={16} />
            Backup herunterladen (.json)
          </button>

          <button
            type="button"
            onClick={triggerFileSelect}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-transparent text-[#728264] border-2 border-[#728264] hover:bg-[#728264]/5 font-bold rounded-xl text-sm transition-all"
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
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-[#804A4A]">
          <AlertTriangle size={18} />
          <h4 className="font-bold text-sm">Gefahrenzone</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Durch das Zurücksetzen der App-Daten werden alle deine erstellten Logbucheinträge sowie deine personalisierten Gefühle und Reaktionen unwiderruflich gelöscht.
        </p>
        <button
          type="button"
          onClick={onResetAll}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#804A4A] hover:bg-[#6c3a3a] text-white font-bold rounded-xl text-xs transition-all shadow-sm"
        >
          <RefreshCw size={14} />
          App-Daten komplett zurücksetzen
        </button>
      </div>

    </div>
  );
}

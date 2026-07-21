import React, { useState, useEffect } from 'react';
import { LogEntry, ViewType } from './types';
import { KEYS, DEFAULT_GEFUEHLE, DEFAULT_KOERPER } from './constants';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import Statistics from './components/Statistics';
import SettingsView from './components/SettingsView';
import { PenSquare, BookOpen, BarChart3, Settings, Heart } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('form');
  
  // App states
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [optionsGefuehle, setOptionsGefuehle] = useState<string[]>([]);
  const [optionsKoerper, setOptionsKoerper] = useState<string[]>([]);
  
  // Edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(KEYS.ENTRIES);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      } else {
        setEntries([]);
      }

      const storedGefuehle = localStorage.getItem(KEYS.OPTIONS_GEFUEHLE);
      if (storedGefuehle) {
        setOptionsGefuehle(JSON.parse(storedGefuehle));
      } else {
        setOptionsGefuehle([...DEFAULT_GEFUEHLE]);
        localStorage.setItem(KEYS.OPTIONS_GEFUEHLE, JSON.stringify(DEFAULT_GEFUEHLE));
      }

      const storedKoerper = localStorage.getItem(KEYS.OPTIONS_KOERPER);
      if (storedKoerper) {
        setOptionsKoerper(JSON.parse(storedKoerper));
      } else {
        setOptionsKoerper([...DEFAULT_KOERPER]);
        localStorage.setItem(KEYS.OPTIONS_KOERPER, JSON.stringify(DEFAULT_KOERPER));
      }
    } catch (e) {
      console.error('Error loading data from localStorage:', e);
    }
  }, []);

  // Save changes helper
  const handleUpdateEntries = (newEntries: LogEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(newEntries));
  };

  const handleUpdateGefuehle = (newOptions: string[]) => {
    setOptionsGefuehle(newOptions);
    localStorage.setItem(KEYS.OPTIONS_GEFUEHLE, JSON.stringify(newOptions));
  };

  const handleUpdateKoerper = (newOptions: string[]) => {
    setOptionsKoerper(newOptions);
    localStorage.setItem(KEYS.OPTIONS_KOERPER, JSON.stringify(newOptions));
  };

  // Entry Actions
  const handleSaveEntry = (entry: LogEntry) => {
    let updatedEntries = [...entries];
    if (editingIndex !== null) {
      // Editing
      updatedEntries[editingIndex] = entry;
      setEditingIndex(null);
      setCurrentView('list');
    } else {
      // New Entry
      updatedEntries.push(entry);
      setCurrentView('list');
    }
    handleUpdateEntries(updatedEntries);
  };

  const handleEditEntrySelect = (index: number) => {
    setEditingIndex(index);
    setCurrentView('form');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentView('list');
  };

  const handleDeleteEntry = (index: number) => {
    if (confirm('Möchtest du diesen Logbuch-Eintrag wirklich dauerhaft löschen?')) {
      const updated = entries.filter((_, i) => i !== index);
      handleUpdateEntries(updated);
    }
  };

  const handleResetAllData = () => {
    if (confirm('Achtung: Dies löscht unwiderruflich ALLE Einträge und personalisierten Einstellungen! Möchtest du wirklich fortfahren?')) {
      if (confirm('Bestätige bitte ein zweites Mal: Möchtest du wirklich alle Therapie-Logbuch-Daten vernichten?')) {
        localStorage.removeItem(KEYS.ENTRIES);
        localStorage.removeItem(KEYS.OPTIONS_GEFUEHLE);
        localStorage.removeItem(KEYS.OPTIONS_KOERPER);
        setEntries([]);
        setOptionsGefuehle([...DEFAULT_GEFUEHLE]);
        setOptionsKoerper([...DEFAULT_KOERPER]);
        setEditingIndex(null);
        setCurrentView('form');
        alert('Alle Daten wurden erfolgreich gelöscht und auf Werkseinstellungen zurückgesetzt.');
      }
    }
  };

  const viewTitles: Record<ViewType, string> = {
    form: editingIndex !== null ? 'Eintrag bearbeiten' : 'Neue Situation',
    list: 'Dein Logbuch',
    stats: 'Muster & Statistiken',
    settings: 'Einstellungen'
  };

  return (
    <div className="min-h-screen bg-[#4A5340] text-[#3D3D3D] flex flex-col font-sans selection:bg-[#728264] selection:text-white">
      
      {/* Header Bar */}
      <header className="w-full bg-[#4A5340] py-5 px-4 text-center shrink-0 border-b border-[#FCFAF5]/10 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <Heart size={22} className="text-[#EAE6DB] fill-[#EAE6DB] shrink-0" />
          <h1 className="text-xl md:text-2xl font-black text-[#EAE6DB] tracking-wide">
            {viewTitles[currentView]}
          </h1>
        </div>
      </header>

      {/* Main View Sandbox */}
      <main className="flex-1 px-4 py-6 md:py-8 overflow-y-auto max-w-7xl w-full mx-auto pb-28">
        <div className="animate-fadeIn">
          {currentView === 'form' && (
            <EntryForm
              editEntry={editingIndex !== null ? entries[editingIndex] : null}
              onSave={handleSaveEntry}
              onCancelEdit={handleCancelEdit}
              optionsGefuehle={optionsGefuehle}
              optionsKoerper={optionsKoerper}
            />
          )}

          {currentView === 'list' && (
            <EntryList
              entries={entries}
              onEdit={handleEditEntrySelect}
              onDelete={handleDeleteEntry}
              optionsGefuehle={optionsGefuehle}
              optionsKoerper={optionsKoerper}
            />
          )}

          {currentView === 'stats' && (
            <Statistics entries={entries} />
          )}

          {currentView === 'settings' && (
            <SettingsView
              optionsGefuehle={optionsGefuehle}
              optionsKoerper={optionsKoerper}
              entries={entries}
              onUpdateGefuehle={handleUpdateGefuehle}
              onUpdateKoerper={handleUpdateKoerper}
              onUpdateEntries={handleUpdateEntries}
              onResetAll={handleResetAllData}
            />
          )}
        </div>
      </main>

      {/* Android Mobile Native-Like Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F4F1EA] border-t border-[#D1CBBB] px-2 py-2 flex justify-around items-center z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
        
        {/* Navigation buttons */}
        <button
          onClick={() => { setEditingIndex(null); setCurrentView('form'); }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'form' 
              ? 'text-[#728264] scale-105' 
              : 'text-[#3D3D3D]/50 hover:text-[#3D3D3D]/80'
          }`}
        >
          <PenSquare size={20} className={currentView === 'form' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Neu</span>
        </button>

        <button
          onClick={() => setCurrentView('list')}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'list' 
              ? 'text-[#728264] scale-105' 
              : 'text-[#3D3D3D]/50 hover:text-[#3D3D3D]/80'
          }`}
        >
          <BookOpen size={20} className={currentView === 'list' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Logbuch</span>
        </button>

        <button
          onClick={() => setCurrentView('stats')}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'stats' 
              ? 'text-[#728264] scale-105' 
              : 'text-[#3D3D3D]/50 hover:text-[#3D3D3D]/80'
          }`}
        >
          <BarChart3 size={20} className={currentView === 'stats' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Muster</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'settings' 
              ? 'text-[#728264] scale-105' 
              : 'text-[#3D3D3D]/50 hover:text-[#3D3D3D]/80'
          }`}
        >
          <Settings size={20} className={currentView === 'settings' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Einstell.</span>
        </button>

      </nav>

    </div>
  );
}

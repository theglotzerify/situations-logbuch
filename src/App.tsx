import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry, ViewType } from './types';
import { KEYS, DEFAULT_GEFUEHLE, DEFAULT_KOERPER } from './constants';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import Statistics from './components/Statistics';
import SettingsView from './components/SettingsView';
import { PenSquare, BookOpen, BarChart3, Settings, Heart, Sun, Moon } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('form');
  const [direction, setDirection] = useState<number>(1);

  const viewsOrder: ViewType[] = ['form', 'list', 'stats', 'settings'];

  const changeView = (newView: ViewType) => {
    const currentIndex = viewsOrder.indexOf(currentView);
    const newIndex = viewsOrder.indexOf(newView);
    if (newIndex !== currentIndex) {
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentView(newView);
    }
  };

  // App states
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [optionsGefuehle, setOptionsGefuehle] = useState<string[]>([]);
  const [optionsKoerper, setOptionsKoerper] = useState<string[]>([]);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(KEYS.THEME);
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(KEYS.THEME, 'light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

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

  // Reset scroll position to top when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView]);

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
      changeView('list');
    } else {
      // New Entry
      updatedEntries.push(entry);
      changeView('list');
    }
    handleUpdateEntries(updatedEntries);
  };

  const handleEditEntrySelect = (index: number) => {
    setEditingIndex(index);
    changeView('form');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    changeView('list');
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
        changeView('form');
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
    <div className="min-h-screen bg-[#4A5340] dark:bg-[#181C17] text-[#3D3D3D] dark:text-[#EAE6DB] flex flex-col font-sans selection:bg-[#728264] selection:text-white transition-colors overflow-x-hidden">
      
      {/* Header Bar */}
      <header className="w-full bg-[#4A5340] dark:bg-[#181C17] py-4 px-4 text-center shrink-0 border-b border-[#FCFAF5]/10 dark:border-[#384133] sticky top-0 z-40 transition-colors">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="w-8"></div> {/* spacer for centering */}
          <div className="flex items-center justify-center gap-2">
            <Heart size={22} className="text-[#EAE6DB] fill-[#EAE6DB] shrink-0" />
            <h1 className="text-xl md:text-2xl font-black text-[#EAE6DB] tracking-wide">
              {viewTitles[currentView]}
            </h1>
          </div>
          {/* Quick theme toggle button in header */}
          <button
            onClick={handleToggleDarkMode}
            className="p-2 rounded-xl bg-[#FCFAF5]/10 dark:bg-[#252B21] text-[#EAE6DB] hover:bg-[#FCFAF5]/20 dark:hover:bg-[#384133] transition-all flex items-center justify-center"
            title={darkMode ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
          >
            {darkMode ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} className="text-[#EAE6DB]" />}
          </button>
        </div>
      </header>

      {/* Main View Sandbox */}
      <main className="flex-1 px-4 py-6 md:py-10 max-w-7xl w-full mx-auto pb-28 md:pb-36 overflow-x-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentView}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? '60%' : '-60%',
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                x: dir < 0 ? '60%' : '-60%',
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.15 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              const swipeThreshold = 60;
              const currentIndex = viewsOrder.indexOf(currentView);
              if (info.offset.x < -swipeThreshold || info.velocity.x < -400) {
                if (currentIndex < viewsOrder.length - 1) {
                  changeView(viewsOrder[currentIndex + 1]);
                }
              } else if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
                if (currentIndex > 0) {
                  changeView(viewsOrder[currentIndex - 1]);
                }
              }
            }}
            className="w-full touch-pan-y"
          >
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
                darkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onUpdateGefuehle={handleUpdateGefuehle}
                onUpdateKoerper={handleUpdateKoerper}
                onUpdateEntries={handleUpdateEntries}
                onResetAll={handleResetAllData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Android Mobile & Tablet Floating Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 md:bottom-4 md:max-w-md md:mx-auto bg-[#F4F1EA] dark:bg-[#252B21] border-t md:border border-[#D1CBBB] dark:border-[#384133] md:rounded-2xl px-2 py-2 flex justify-around items-center z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] md:shadow-lg transition-colors">
        
        {/* Navigation buttons */}
        <button
          onClick={() => { setEditingIndex(null); changeView('form'); }}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'form' 
              ? 'text-[#728264] dark:text-[#9BB08A] scale-105' 
              : 'text-[#3D3D3D]/50 dark:text-[#EAE6DB]/60 hover:text-[#3D3D3D]/80 dark:hover:text-[#EAE6DB]'
          }`}
        >
          <PenSquare size={20} className={currentView === 'form' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Neu</span>
        </button>

        <button
          onClick={() => changeView('list')}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'list' 
              ? 'text-[#728264] dark:text-[#9BB08A] scale-105' 
              : 'text-[#3D3D3D]/50 dark:text-[#EAE6DB]/60 hover:text-[#3D3D3D]/80 dark:hover:text-[#EAE6DB]'
          }`}
        >
          <BookOpen size={20} className={currentView === 'list' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Logbuch</span>
        </button>

        <button
          onClick={() => changeView('stats')}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'stats' 
              ? 'text-[#728264] dark:text-[#9BB08A] scale-105' 
              : 'text-[#3D3D3D]/50 dark:text-[#EAE6DB]/60 hover:text-[#3D3D3D]/80 dark:hover:text-[#EAE6DB]'
          }`}
        >
          <BarChart3 size={20} className={currentView === 'stats' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Muster</span>
        </button>

        <button
          onClick={() => changeView('settings')}
          className={`flex flex-col items-center justify-center gap-1.5 py-1 px-4 rounded-xl transition-all text-xs font-bold active:scale-95 ${
            currentView === 'settings' 
              ? 'text-[#728264] dark:text-[#9BB08A] scale-105' 
              : 'text-[#3D3D3D]/50 dark:text-[#EAE6DB]/60 hover:text-[#3D3D3D]/80 dark:hover:text-[#EAE6DB]'
          }`}
        >
          <Settings size={20} className={currentView === 'settings' ? 'stroke-[2.5]' : 'stroke-[2]'} />
          <span>Einstell.</span>
        </button>

      </nav>

    </div>
  );
}


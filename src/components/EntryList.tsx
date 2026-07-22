import React, { useState } from 'react';
import { LogEntry, FilterMode, TimeRange } from '../types';
import { Edit2, Trash2, Share2, Filter, X, Search, Calendar, ChevronDown, ChevronUp, Check, Clock } from 'lucide-react';
import Modal from './Modal';
import { parseEntryDate, groupEntriesByMonth } from '../utils/dateUtils';

interface EntryListProps {
  entries: LogEntry[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  optionsGefuehle: string[];
  optionsKoerper: string[];
}

export default function EntryList({
  entries,
  onEdit,
  onDelete,
  optionsGefuehle,
  optionsKoerper
}: EntryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterGefuehle, setSelectedFilterGefuehle] = useState<string[]>([]);
  const [selectedFilterKoerper, setSelectedFilterKoerper] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('inclusive');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [groupByMonth, setGroupByMonth] = useState(true);
  
  const [activeModal, setActiveModal] = useState<'gefuehle' | 'koerper' | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFilterGefuehl = (option: string) => {
    setSelectedFilterGefuehle(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const toggleFilterKoerper = (option: string) => {
    setSelectedFilterKoerper(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const resetFilters = () => {
    setSelectedFilterGefuehle([]);
    setSelectedFilterKoerper([]);
    setSearchTerm('');
    setTimeRange('all');
  };

  // Filter entries
  const filteredEntries = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => {
      // 1. Time Range Filter
      if (timeRange !== 'all') {
        const date = parseEntryDate(entry.date);
        const now = new Date();
        if (!isNaN(date.getTime())) {
          if (timeRange === '7days') {
            const diffMs = now.getTime() - date.getTime();
            if (diffMs < 0 || diffMs > 7 * 24 * 60 * 60 * 1000) return false;
          } else if (timeRange === '30days') {
            const diffMs = now.getTime() - date.getTime();
            if (diffMs < 0 || diffMs > 30 * 24 * 60 * 60 * 1000) return false;
          } else if (timeRange === 'thisMonth') {
            if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
          } else if (timeRange === 'lastMonth') {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            if (date.getMonth() !== lm.getMonth() || date.getFullYear() !== lm.getFullYear()) return false;
          } else if (timeRange === 'thisYear') {
            if (date.getFullYear() !== now.getFullYear()) return false;
          }
        }
      }

      // 2. Text Search Filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesText = 
          entry.situation.toLowerCase().includes(term) ||
          entry.gedanken.toLowerCase().includes(term) ||
          entry.verhalten.toLowerCase().includes(term) ||
          entry.resultat_kurz.toLowerCase().includes(term) ||
          entry.resultat_lang.toLowerCase().includes(term);
        if (!matchesText) return false;
      }

      // 3. Tag filters
      if (selectedFilterGefuehle.length === 0 && selectedFilterKoerper.length === 0) return true;

      const entryG = entry.gefuehle || [];
      const entryK = entry.koerper || [];

      if (filterMode === 'inclusive') {
        const matchesG = selectedFilterGefuehle.some(g => entryG.includes(g));
        const matchesK = selectedFilterKoerper.some(k => entryK.includes(k));
        return matchesG || matchesK;
      } else {
        let matchesG = true;
        if (selectedFilterGefuehle.length > 0) {
          matchesG = selectedFilterGefuehle.every(g => entryG.includes(g));
        }
        let matchesK = true;
        if (selectedFilterKoerper.length > 0) {
          matchesK = selectedFilterKoerper.every(k => entryK.includes(k));
        }
        return matchesG && matchesK;
      }
    });

  // Reverse list so newest entries come first
  const reversedFiltered = filteredEntries.slice().reverse();

  // Grouped entries structure if month grouping is enabled
  const monthGroups = groupByMonth ? groupEntriesByMonth(reversedFiltered) : null;

  const toggleFilterMode = () => {
    setFilterMode(prev => (prev === 'inclusive' ? 'exclusive' : 'inclusive'));
  };

  // Share individual entry
  const copyToClipboard = (entry: LogEntry, idx: number) => {
    const text = `Situations-Logbuch vom ${entry.date}
-----------------------------------------
1. Situation:
${entry.situation || '-'}

2. Gedanken:
${entry.gedanken || '-'}

3. Gefühle:
${entry.gefuehle?.join(', ') || '-'}

4. Körperliche Reaktionen:
${entry.koerper?.join(', ') || '-'}

5. Verhalten:
${entry.verhalten || '-'}

6. Resultat (kurz):
${entry.resultat_kurz || '-'}

7. Resultat (lang):
${entry.resultat_lang || '-'}
`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Fehler beim Kopieren: ', err);
    });
  };

  const hasActiveFilters = selectedFilterGefuehle.length > 0 || selectedFilterKoerper.length > 0 || searchTerm !== '' || timeRange !== 'all';

  // Render a single entry card
  const renderEntryCard = (entry: LogEntry, index: number) => {
    const isExpanded = expandedIndex === index;
    return (
      <div 
        key={index}
        className="bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl border-l-6 border-[#728264] shadow-md border border-[#D1CBBB]/50 dark:border-[#384133] overflow-hidden transition-all duration-200"
      >
        {/* Entry Header */}
        <div className="p-4 bg-[#FCFAF5]/70 dark:bg-[#1C211B]/80 border-b border-[#D1CBBB]/40 dark:border-[#384133] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#666] dark:text-[#A1A89A]">
            <Calendar size={14} className="text-[#728264] dark:text-[#9BB08A]" />
            <span>{entry.date}</span>
          </div>
          
          {/* Actions Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(entry, index)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-[#A1A89A] hover:text-[#728264] dark:hover:text-[#9BB08A] hover:bg-[#728264]/10 transition-all"
              title="Als Text kopieren"
            >
              {copiedIndex === index ? (
                <Check size={16} className="text-green-700 dark:text-green-400 font-bold animate-bounce" />
              ) : (
                <Share2 size={16} />
              )}
            </button>
            <button
              onClick={() => onEdit(index)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-[#A1A89A] hover:text-[#728264] dark:hover:text-[#9BB08A] hover:bg-[#728264]/10 transition-all"
              title="Bearbeiten"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-1.5 rounded-lg text-gray-600 dark:text-[#A1A89A] hover:text-[#804A4A] dark:hover:text-[#D47070] hover:bg-[#804A4A]/10 transition-all"
              title="Löschen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Entry Content Preview / Details */}
        <div className="p-4 md:p-5 space-y-4">
          {/* Previewing situation always */}
          {entry.situation && (
            <div className="text-sm leading-relaxed">
              <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1">Situation:</strong>
              <p className="text-[#3D3D3D] dark:text-[#EAE6DB] font-medium whitespace-pre-wrap">{entry.situation}</p>
            </div>
          )}

          {/* Expansion toggle */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="flex items-center gap-1.5 text-xs text-[#728264] dark:text-[#9BB08A] font-bold py-1 px-3 rounded-full hover:bg-[#728264]/10 transition-all"
            >
              {isExpanded ? (
                <>
                  <span>Weniger Details anzeigen</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Gesamten Spalten-Eintrag anzeigen</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>

          {/* Expanded Fields */}
          {isExpanded && (
            <div className="space-y-4 pt-3 border-t border-[#D1CBBB]/40 dark:border-[#384133] animate-fadeIn">
              
              {entry.gedanken && (
                <div className="text-sm">
                  <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1">Gedanken:</strong>
                  <p className="text-[#3D3D3D] dark:text-[#EAE6DB] whitespace-pre-wrap">{entry.gedanken}</p>
                </div>
              )}

              {entry.gefuehle && entry.gefuehle.length > 0 && (
                <div>
                  <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1.5">Gefühle:</strong>
                  <div className="flex flex-wrap gap-1">
                    {entry.gefuehle.map(g => (
                      <span key={g} className="bg-[#728264] dark:bg-[#5C6B50] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.koerper && entry.koerper.length > 0 && (
                <div>
                  <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1.5">Körperliche Reaktionen:</strong>
                  <div className="flex flex-wrap gap-1">
                    {entry.koerper.map(k => (
                      <span key={k} className="bg-[#728264]/80 dark:bg-[#5C6B50]/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {entry.verhalten && (
                <div className="text-sm">
                  <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1">Verhalten:</strong>
                  <p className="text-[#3D3D3D] dark:text-[#EAE6DB] whitespace-pre-wrap">{entry.verhalten}</p>
                </div>
              )}

              {entry.resultat_kurz && (
                <div className="text-sm">
                  <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1">Resultat (kurzfristig):</strong>
                  <p className="text-[#3D3D3D] dark:text-[#EAE6DB] whitespace-pre-wrap">{entry.resultat_kurz}</p>
                </div>
              )}

              {entry.resultat_lang && (
                <div className="text-sm">
                  <strong className="text-[#728264] dark:text-[#9BB08A] font-bold text-xs block uppercase tracking-wider mb-1">Resultat (langfristig):</strong>
                  <p className="text-[#3D3D3D] dark:text-[#EAE6DB] whitespace-pre-wrap">{entry.resultat_lang}</p>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-2">
      
      {/* Filters Box */}
      <div className="bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl p-5 border border-[#D1CBBB]/50 dark:border-[#384133] shadow-md transition-colors">
        <div className="flex flex-col gap-3">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D1CBBB]/60 dark:border-[#384133] pb-3">
            <div className="flex items-center gap-2 text-[#3D3D3D] dark:text-[#EAE6DB]">
              <Filter size={18} className="text-[#728264] dark:text-[#9BB08A]" />
              <span className="font-bold text-sm">Logbuch filtern & durchsuchen</span>
            </div>
            
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#804A4A] dark:text-[#D47070] bg-[#804A4A]/10 hover:bg-[#804A4A]/25 dark:bg-[#804A4A]/20 py-1 px-2.5 rounded-full transition-all"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#666] dark:text-[#A1A89A] flex items-center gap-1.5">
              <Clock size={14} className="text-[#728264] dark:text-[#9BB08A]" />
              <span>Zeitraum wählen:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Alle' },
                { id: '7days', label: 'Letzte 7 Tage' },
                { id: '30days', label: 'Letzte 30 Tage' },
                { id: 'thisMonth', label: 'Dieser Monat' },
                { id: 'lastMonth', label: 'Letzter Monat' },
                { id: 'thisYear', label: 'Dieses Jahr' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTimeRange(item.id as TimeRange)}
                  className={`text-xs font-bold py-1.5 px-3 rounded-xl border transition-all ${
                    timeRange === item.id
                      ? 'bg-[#728264] dark:bg-[#5C6B50] text-white border-[#728264] shadow-xs'
                      : 'bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] border-[#D1CBBB] dark:border-[#384133] hover:border-[#728264]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-[#A1A89A]">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Texte durchsuchen (z.B. Arbeit, Panik...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1CBBB] dark:border-[#384133] bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] placeholder:text-gray-400 dark:placeholder:text-[#838F7A] text-sm focus:border-[#728264] outline-none transition-all"
            />
          </div>

          {/* Tag Filter Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => setActiveModal('gefuehle')}
              className="py-2.5 px-4 rounded-xl border border-[#D1CBBB] dark:border-[#384133] bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] text-xs font-bold hover:bg-[#E3DEC6] dark:hover:bg-[#2A3126] transition-all flex items-center justify-between"
            >
              <span>Nach Gefühl filtern...</span>
              {selectedFilterGefuehle.length > 0 && (
                <span className="bg-[#728264] dark:bg-[#5C6B50] text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]">
                  {selectedFilterGefuehle.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('koerper')}
              className="py-2.5 px-4 rounded-xl border border-[#D1CBBB] dark:border-[#384133] bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] text-xs font-bold hover:bg-[#E3DEC6] dark:hover:bg-[#2A3126] transition-all flex items-center justify-between"
            >
              <span>Nach Reaktion filtern...</span>
              {selectedFilterKoerper.length > 0 && (
                <span className="bg-[#728264] dark:bg-[#5C6B50] text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]">
                  {selectedFilterKoerper.length}
                </span>
              )}
            </button>
          </div>

          {/* Grouping Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#D1CBBB]/40 dark:border-[#384133] text-xs font-semibold text-[#666] dark:text-[#A1A89A]">
            <span>Monatsweise gruppieren:</span>
            <button
              type="button"
              onClick={() => setGroupByMonth(prev => !prev)}
              className={`py-1 px-3 rounded-full font-bold transition-all text-[11px] border ${
                groupByMonth
                  ? 'bg-[#728264] dark:bg-[#5C6B50] text-white border-[#728264]'
                  : 'bg-[#FCFAF5] dark:bg-[#1C211B] text-[#3D3D3D] dark:text-[#EAE6DB] border-[#D1CBBB] dark:border-[#384133]'
              }`}
            >
              {groupByMonth ? 'Aktiviert' : 'Deaktiviert'}
            </button>
          </div>

          {/* Selected Tag Capsules */}
          {(selectedFilterGefuehle.length > 0 || selectedFilterKoerper.length > 0) && (
            <div className="flex flex-col gap-2 mt-1 bg-[#FCFAF5] dark:bg-[#1C211B] p-3 rounded-xl border border-[#D1CBBB]/50 dark:border-[#384133]">
              
              {/* Filter Logic Mode Switcher */}
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-[#666] dark:text-[#A1A89A] font-medium">Filter-Logik:</span>
                <button
                  type="button"
                  onClick={toggleFilterMode}
                  className={`py-1 px-3 rounded-full font-bold transition-all text-[11px] ${
                    filterMode === 'exclusive'
                      ? 'bg-[#804A4A] text-white shadow-xs'
                      : 'bg-[#728264] dark:bg-[#5C6B50] text-white shadow-xs'
                  }`}
                >
                  {filterMode === 'exclusive' ? 'UND (Exklusiv)' : 'ODER (Inklusiv)'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">
                {selectedFilterGefuehle.map(g => (
                  <span
                    key={g}
                    onClick={() => toggleFilterGefuehl(g)}
                    className="inline-flex items-center gap-1 bg-[#728264] dark:bg-[#5C6B50] text-white text-[11px] font-bold pl-2.5 pr-1.5 py-1 rounded-full cursor-pointer hover:bg-[#804A4A]"
                  >
                    <span>G: {g}</span>
                    <X size={12} className="opacity-80" />
                  </span>
                ))}
                {selectedFilterKoerper.map(k => (
                  <span
                    key={k}
                    onClick={() => toggleFilterKoerper(k)}
                    className="inline-flex items-center gap-1 bg-[#728264]/80 dark:bg-[#5C6B50]/80 text-white text-[11px] font-bold pl-2.5 pr-1.5 py-1 rounded-full cursor-pointer hover:bg-[#804A4A]"
                  >
                    <span>K: {k}</span>
                    <X size={12} className="opacity-80" />
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Entries List Output */}
      <div className="space-y-6">
        {reversedFiltered.length === 0 ? (
          <div className="text-center py-12 bg-[#F4F1EA] dark:bg-[#252B21] rounded-2xl border border-[#D1CBBB]/50 dark:border-[#384133] p-6">
            <p className="text-[#3D3D3D]/70 dark:text-[#EAE6DB]/70 font-semibold mb-1">Keine passenden Einträge gefunden.</p>
            <p className="text-xs text-gray-500 dark:text-[#A1A89A]">Passe deine Filter oder deinen Zeitraum an oder füge eine neue Situation hinzu.</p>
          </div>
        ) : groupByMonth && monthGroups ? (
          Object.entries(monthGroups).map(([monthYear, items]) => (
            <div key={monthYear} className="space-y-3">
              {/* Month Header Banner */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E3DEC6] dark:bg-[#2A3126] rounded-xl text-[#3D3D3D] dark:text-[#EAE6DB] font-black text-xs uppercase tracking-wider border border-[#D1CBBB]/60 dark:border-[#384133]">
                <Calendar size={14} className="text-[#728264] dark:text-[#9BB08A]" />
                <span>{monthYear}</span>
                <span className="ml-auto font-normal text-[11px] text-gray-500 dark:text-[#A1A89A] capitalize">
                  {items.length} {items.length === 1 ? 'Eintrag' : 'Einträge'}
                </span>
              </div>

              <div className="space-y-4">
                {items.map(({ entry, index }) => renderEntryCard(entry, index))}
              </div>
            </div>
          ))
        ) : (
          reversedFiltered.map(({ entry, index }) => renderEntryCard(entry, index))
        )}
      </div>

      {/* Pop-up Filter Modals */}
      <Modal
        isOpen={activeModal === 'gefuehle'}
        title="Nach Gefühl filtern"
        options={optionsGefuehle}
        selectedOptions={selectedFilterGefuehle}
        onToggleOption={toggleFilterGefuehl}
        onClose={() => setActiveModal(null)}
      />

      <Modal
        isOpen={activeModal === 'koerper'}
        title="Nach Reaktion filtern"
        options={optionsKoerper}
        selectedOptions={selectedFilterKoerper}
        onToggleOption={toggleFilterKoerper}
        onClose={() => setActiveModal(null)}
      />

    </div>
  );
}

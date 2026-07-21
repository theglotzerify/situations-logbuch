export interface LogEntry {
  id?: string; // Optional unique ID, though we will fallback to index if missing
  date: string; // e.g. "21.07.2026, 11:00:00"
  situation: string;
  gedanken: string;
  gefuehle: string[];
  koerper: string[];
  verhalten: string;
  resultat_kurz: string;
  resultat_lang: string;
}

export type ViewType = 'form' | 'list' | 'stats' | 'settings';

export type FilterMode = 'inclusive' | 'exclusive'; // ODER vs. UND

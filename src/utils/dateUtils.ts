import { LogEntry, TimeRange } from '../types';

/**
 * Parses entry date strings like "22.07.2026, 17:15:00" or "22.7.2026" or ISO strings.
 */
export function parseEntryDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);

  // Check if string contains German date format DD.MM.YYYY
  const parts = dateStr.split(',');
  const datePart = parts[0].trim();
  const dots = datePart.split('.');

  if (dots.length === 3) {
    const day = parseInt(dots[0], 10);
    const month = parseInt(dots[1], 10) - 1; // 0-indexed
    const year = parseInt(dots[2], 10);

    let hour = 0;
    let minute = 0;
    let second = 0;

    if (parts.length > 1) {
      const timePart = parts[1].trim();
      const colons = timePart.split(':');
      if (colons.length >= 2) {
        hour = parseInt(colons[0], 10) || 0;
        minute = parseInt(colons[1], 10) || 0;
        second = parseInt(colons[2], 10) || 0;
      }
    }

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day, hour, minute, second);
    }
  }

  // Fallback to standard Date constructor
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Filters an array of entries by a selected TimeRange.
 */
export function filterEntriesByTimeRange(entries: LogEntry[], range: TimeRange): LogEntry[] {
  if (range === 'all') return entries;

  const now = new Date();
  
  return entries.filter(entry => {
    const date = parseEntryDate(entry.date);
    if (isNaN(date.getTime())) return true;

    if (range === '7days') {
      const diffMs = now.getTime() - date.getTime();
      return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
    }

    if (range === '30days') {
      const diffMs = now.getTime() - date.getTime();
      return diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000;
    }

    if (range === 'thisMonth') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    if (range === 'lastMonth') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    }

    if (range === 'thisYear') {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  });
}

/**
 * Groups entries by Month and Year (e.g. "Juli 2026").
 */
export function groupEntriesByMonth(entriesWithIndices: { entry: LogEntry; index: number }[]) {
  const groups: { [key: string]: { entry: LogEntry; index: number }[] } = {};

  entriesWithIndices.forEach(item => {
    const d = parseEntryDate(item.entry.date);
    let monthYearKey = 'Unbekanntes Datum';
    
    if (!isNaN(d.getTime())) {
      const monthName = d.toLocaleString('de-DE', { month: 'long' });
      const year = d.getFullYear();
      monthYearKey = `${monthName} ${year}`;
    }

    if (!groups[monthYearKey]) {
      groups[monthYearKey] = [];
    }
    groups[monthYearKey].push(item);
  });

  return groups;
}

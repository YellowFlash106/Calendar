// storage.ts — LocalStorage helpers for WallCalendar

export interface MonthData {
  generalNote: string;
  rangeStart: string | null;
  rangeEnd: string | null;
  rangeNote: string;
}

const PREFIX = "wallcal_";

export function loadMonthData(monthKey: string): MonthData {
  try {
    const raw = localStorage.getItem(`${PREFIX}${monthKey}`);
    if (raw) return JSON.parse(raw) as MonthData;
  } catch {
    // ignore
  }
  return { generalNote: "", rangeStart: null, rangeEnd: null, rangeNote: "" };
}

export function saveMonthData(monthKey: string, data: MonthData): void {
  try {
    localStorage.setItem(`${PREFIX}${monthKey}`, JSON.stringify(data));
  } catch {
    // ignore quota errors silently
  }
}

export function clearMonthData(monthKey: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${monthKey}`);
  } catch {
    // ignore
  }
}

/** Export all calendar data as JSON string */
export function exportAllData(): string {
  const result: Record<string, MonthData> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      const monthKey = key.slice(PREFIX.length);
      try {
        result[monthKey] = JSON.parse(localStorage.getItem(key)!);
      } catch {
        // skip corrupted
      }
    }
  }
  return JSON.stringify(result, null, 2);
}

/** Import JSON data, merging with existing */
export function importAllData(json: string): void {
  const parsed = JSON.parse(json) as Record<string, MonthData>;
  for (const [key, data] of Object.entries(parsed)) {
    saveMonthData(key, data);
  }
}

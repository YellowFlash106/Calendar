// dateUtils.ts — Pure date logic helpers for WallCalendar

export type DateString = string; // "YYYY-MM-DD"

export interface DayCell {
  date: DateString;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/** Returns "YYYY-MM-DD" for a given Date object */
export function formatDate(d: Date): DateString {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns today as "YYYY-MM-DD" */
export function today(): DateString {
  return formatDate(new Date());
}

/** Parse a DateString back to a Date (local time noon to avoid tz shifts) */
export function parseDate(ds: DateString): Date {
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/** Get month key "YYYY-MM" from a DateString */
export function monthKey(ds: DateString): string {
  return ds.slice(0, 7);
}

/** Advance month by delta (-1 or +1) */
export function shiftMonth(ds: DateString, delta: number): DateString {
  const [y, m] = ds.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Long month name */
export function monthName(ds: DateString): string {
  const d = parseDate(ds);
  return d.toLocaleString("default", { month: "long" });
}

/** Full year */
export function yearOf(ds: DateString): number {
  return parseInt(ds.slice(0, 4), 10);
}

/**
 * Build a 6-row × 7-col calendar matrix (Sun–Sat).
 * Cells outside the current month are marked isCurrentMonth=false.
 */
export function getMonthMatrix(ds: DateString): DayCell[][] {
  const [y, m] = ds.split("-").map(Number);
  const todayStr = today();

  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);

  // 0=Sun … 6=Sat
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: DayCell[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, -i);
    cells.push({
      date: formatDate(d),
      day: d.getDate(),
      isCurrentMonth: false,
      isToday: formatDate(d) === todayStr,
    });
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(y, m - 1, d);
    cells.push({
      date: formatDate(date),
      day: d,
      isCurrentMonth: true,
      isToday: formatDate(date) === todayStr,
    });
  }

  // Next month padding to fill 6 rows
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(y, m, d);
    cells.push({
      date: formatDate(date),
      day: d,
      isCurrentMonth: false,
      isToday: formatDate(date) === todayStr,
    });
  }

  // Chunk into rows
  const matrix: DayCell[][] = [];
  for (let i = 0; i < 6; i++) {
    matrix.push(cells.slice(i * 7, i * 7 + 7));
  }
  return matrix;
}

/** Is date between start and end (inclusive)? */
export function isInRange(
  date: DateString,
  start: DateString | null,
  end: DateString | null
): boolean {
  if (!start || !end) return false;
  const [s, e] = start <= end ? [start, end] : [end, start];
  return date >= s && date <= e;
}

export function isRangeStart(date: DateString, start: DateString | null): boolean {
  return !!start && date === start;
}

export function isRangeEnd(date: DateString, end: DateString | null, start: DateString | null): boolean {
  if (!end || !start) return false;
  return date === (start <= end ? end : start);
}

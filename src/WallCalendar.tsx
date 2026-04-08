// WallCalendar.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  KeyboardEvent,
} from "react";
import styles from "./WallCalendar.module.css";
import {
  formatDate,
  today,
  monthKey,
  shiftMonth,
  monthName,
  yearOf,
  getMonthMatrix,
  isInRange,
  isRangeStart,
  isRangeEnd,
  parseDate,
  DateString,
} from "./utils/dateUtils";
import {
  loadMonthData,
  saveMonthData,
  clearMonthData,
  exportAllData,
  importAllData,
  MonthData,
} from "./utils/storage";

// ─── Prop Types ───────────────────────────────────────────────────────────────

export interface HeroImage {
  /** URL of the hero photo */
  src: string;
  /** Alt text */
  alt?: string;
  /** Accent color extracted from image (used for month label chip) */
  accent?: string;
}

export interface WallCalendarProps {
  /** Images keyed by "YYYY-MM". Falls back to defaultHero. */
  heroImages?: Record<string, HeroImage>;
  /** Fallback hero if month not found */
  defaultHero?: HeroImage;
  /** Initial month shown ("YYYY-MM-DD" of any day in that month) */
  initialMonth?: DateString;
  /** Holidays / special dates */
  holidays?: Record<DateString, string>; // date → label
  /** Light or dark theme override */
  theme?: "light" | "dark";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_HEROES: Record<string, string> = {
  "01": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80",
  "02": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
  "03": "https://images.unsplash.com/photo-1490750967868-88df5691cc46?w=900&q=80",
  "04": "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=80",
  "05": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80",
  "06": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  "07": "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=900&q=80",
  "08": "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80",
  "09": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
  "10": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80",
  "11": "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=900&q=80",
  "12": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WallCalendar: React.FC<WallCalendarProps> = ({
  heroImages = {},
  defaultHero,
  initialMonth,
  holidays = {},
  theme = "dark",
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState<DateString>(
    initialMonth ?? today()
  );
  const [data, setData] = useState<MonthData>(() =>
    loadMonthData(monthKey(initialMonth ?? today()))
  );
  const [selectStep, setSelectStep] = useState<0 | 1>(0); // 0=idle/awaiting start, 1=awaiting end
  const [hoverDate, setHoverDate] = useState<DateString | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mKey = monthKey(currentMonth);
  const matrix = getMonthMatrix(currentMonth);

  // ── Resolve hero image ─────────────────────────────────────────────────────
  const mm = currentMonth.slice(5, 7);
  const resolvedHero: HeroImage =
    heroImages[mKey] ??
    defaultHero ?? {
      src: MONTH_HEROES[mm] ?? MONTH_HEROES["01"],
      alt: `${monthName(currentMonth)} scenery`,
      accent: "#e8a838",
    };

  // ── Persist on data change ─────────────────────────────────────────────────
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMonthData(mKey, data);
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, mKey]);

  // ── Load data when month changes ───────────────────────────────────────────
  useEffect(() => {
    setData(loadMonthData(monthKey(currentMonth)));
    setSelectStep(0);
    setHoverDate(null);
  }, [currentMonth]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrentMonth((prev) => shiftMonth(prev, dir));
        setTransitioning(false);
      }, 300);
    },
    [transitioning]
  );

  // ── Date selection ─────────────────────────────────────────────────────────
  const handleDayClick = (date: DateString) => {
    if (selectStep === 0) {
      setData((d) => ({ ...d, rangeStart: date, rangeEnd: null }));
      setSelectStep(1);
    } else {
      const start = data.rangeStart!;
      const [s, e] = date >= start ? [start, date] : [date, start];
      setData((d) => ({ ...d, rangeStart: s, rangeEnd: e }));
      setSelectStep(0);
    }
  };

  const handleDayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, date: DateString) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDayClick(date);
    }
  };

  const clearSelection = () => {
    setData((d) => ({ ...d, rangeStart: null, rangeEnd: null, rangeNote: "" }));
    setSelectStep(0);
  };

  // ── Preview range during hover ─────────────────────────────────────────────
  const previewEnd =
    selectStep === 1 && hoverDate
      ? hoverDate
      : data.rangeEnd;

  // ── Notes ──────────────────────────────────────────────────────────────────
  const handleGeneralNote = (val: string) =>
    setData((d) => ({ ...d, generalNote: val }));

  const handleRangeNote = (val: string) =>
    setData((d) => ({ ...d, rangeNote: val }));

  // ── Export / Import ────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob([exportAllData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wall-calendar-notes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importAllData(ev.target!.result as string);
        setData(loadMonthData(mKey));
        setImportError(null);
      } catch {
        setImportError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearMonth = () => {
    clearMonthData(mKey);
    setData({ generalNote: "", rangeStart: null, rangeEnd: null, rangeNote: "" });
    setSelectStep(0);
  };

  // ── Range label ────────────────────────────────────────────────────────────
  const rangeLabel = (() => {
    if (!data.rangeStart) return null;
    const fmt = (ds: DateString) =>
      parseDate(ds).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
    if (!data.rangeEnd) return `From ${fmt(data.rangeStart)} — pick end date`;
    return `${fmt(data.rangeStart)} → ${fmt(data.rangeEnd)}`;
  })();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`${styles.calendar} ${styles[theme]}`}
      data-testid="wall-calendar"
    >
      {/* ── Hero Panel ────────────────────────────────────────────── */}
      <div className={`${styles.heroPanel} ${transitioning ? styles.fadeOut : styles.fadeIn}`}>
        <div className={styles.heroImageWrap}>
          <img
            src={resolvedHero.src}
            alt={resolvedHero.alt ?? "Calendar hero"}
            className={styles.heroImage}
            loading="lazy"
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.monthBadge}>
          <span className={styles.monthName}>{monthName(currentMonth)}</span>
          <span className={styles.yearLabel}>{yearOf(currentMonth)}</span>
        </div>

        <div className={styles.heroNav}>
          <button
            className={styles.navBtn}
            onClick={() => navigate(-1)}
            aria-label="Previous month"
            disabled={transitioning}
          >
            ‹
          </button>
          <button
            className={styles.navBtn}
            onClick={() => navigate(1)}
            aria-label="Next month"
            disabled={transitioning}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── Calendar + Notes Panel ─────────────────────────────────── */}
      <div className={styles.rightPanel}>

        {/* Day headers */}
        <div className={styles.dayHeaders} role="row">
          {DAY_LABELS.map((d) => (
            <div key={d} className={styles.dayHeader} role="columnheader" aria-label={d}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className={`${styles.grid} ${transitioning ? styles.gridFadeOut : styles.gridFadeIn}`}
          role="grid"
          aria-label={`${monthName(currentMonth)} ${yearOf(currentMonth)} calendar`}
        >
          {matrix.map((row, ri) => (
            <div key={ri} className={styles.gridRow} role="row">
              {row.map((cell) => {
                const inRange = isInRange(cell.date, data.rangeStart, previewEnd ?? null);
                const isStart = isRangeStart(cell.date, data.rangeStart);
                const isEnd = isRangeEnd(cell.date, previewEnd ?? null, data.rangeStart);
                const holiday = holidays[cell.date];

                return (
                  <button
                    key={cell.date}
                    role="gridcell"
                    className={[
                      styles.dayCell,
                      !cell.isCurrentMonth && styles.otherMonth,
                      cell.isToday && styles.todayCell,
                      isStart && styles.rangeStart,
                      isEnd && styles.rangeEnd,
                      inRange && !isStart && !isEnd && styles.inRange,
                      holiday && styles.holidayCell,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleDayClick(cell.date)}
                    onKeyDown={(e) => handleDayKeyDown(e, cell.date)}
                    onMouseEnter={() => setHoverDate(cell.date)}
                    onMouseLeave={() => setHoverDate(null)}
                    aria-label={`${cell.date}${cell.isToday ? " (today)" : ""}${holiday ? `, ${holiday}` : ""}${isStart ? " (range start)" : ""}${isEnd ? " (range end)" : ""}`}
                    aria-pressed={isStart || isEnd}
                    tabIndex={cell.isCurrentMonth ? 0 : -1}
                  >
                    <span className={styles.dayNumber}>{cell.day}</span>
                    {holiday && (
                      <span className={styles.holidayDot} title={holiday} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Notes Section ─────────────────────────────────────────── */}
        <div className={styles.notesSection}>
          <div className={styles.notesHeader}>
            <span className={styles.notesTitle}>Notes</span>
            <div className={styles.noteActions}>
              <button
                className={styles.clearBtn}
                onClick={handleClearMonth}
                title="Clear all notes for this month"
              >
                Clear month
              </button>
              <button className={styles.exportBtn} onClick={handleExport} title="Export notes">
                Export JSON
              </button>
              <label className={styles.importLabel} title="Import notes">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className={styles.hiddenInput}
                />
              </label>
            </div>
          </div>

          {importError && (
            <p className={styles.errorMsg}>{importError}</p>
          )}

          <textarea
            className={styles.noteArea}
            placeholder={`General notes for ${monthName(currentMonth)}…`}
            value={data.generalNote}
            onChange={(e) => handleGeneralNote(e.target.value)}
            aria-label="General monthly notes"
            rows={3}
          />

          {/* Range note */}
          <div className={styles.rangeNoteSection}>
            <div className={styles.rangeStatus}>
              {rangeLabel ? (
                <>
                  <span className={styles.rangeLabel}>{rangeLabel}</span>
                  <button
                    className={styles.clearSelBtn}
                    onClick={clearSelection}
                    aria-label="Clear date selection"
                  >
                    ✕ clear
                  </button>
                </>
              ) : (
                <span className={styles.rangeHint}>
                  Click two dates to select a range
                </span>
              )}
            </div>

            {data.rangeStart && (
              <textarea
                className={styles.noteArea}
                placeholder="Notes for selected date range…"
                value={data.rangeNote}
                onChange={(e) => handleRangeNote(e.target.value)}
                aria-label="Date range notes"
                rows={2}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WallCalendar;

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  KeyboardEvent,
} from "react";
import styles from "./WallCalendar.module.css";
import {
  today,
  monthKey,
  shiftMonth,
  monthName,
  yearOf,
  getMonthMatrix,
  parseDate,
  DateString,
} from "./utils/dateUtils";
import HeroPanel from "./components/HeroPanel";
import CalendarGrid from "./components/CalendarGrid";
import NotesPanel from "./components/NotesPanel";
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
  // March — use a reliable placeholder image
  "03": "https://picsum.photos/id/1018/900/600",
  "04": "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=900&q=80",
  "05": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=900&q=80",
  "06": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  // July — use a reliable placeholder image
  "07": "https://picsum.photos/id/1016/900/600",
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
  const mmNoPad = String(parseInt(mm, 10));
  const resolvedHero: HeroImage =
    // prefer full-year key ("YYYY-MM"), then month-only keys like "03" or "3",
    // then fallback to provided defaultHero or built-in MONTH_HEROES
    heroImages[mKey] ??
    heroImages[mm] ??
    heroImages[mmNoPad] ??
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
      <HeroPanel hero={resolvedHero} monthLabel={monthName(currentMonth)} yearLabel={yearOf(currentMonth)} onPrev={() => navigate(-1)} onNext={() => navigate(1)} transitioning={transitioning} />

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

        <div className={`${styles.grid} ${transitioning ? styles.gridFadeOut : styles.gridFadeIn}`} role="grid" aria-label={`${monthName(currentMonth)} ${yearOf(currentMonth)} calendar`}>
          <CalendarGrid matrix={matrix} data={data} previewEnd={previewEnd} holidays={holidays} onDayClick={handleDayClick} onDayKeyDown={handleDayKeyDown} onHover={(d) => setHoverDate(d)} />
        </div>

        {/* ── Notes Section ─────────────────────────────────────────── */}
        <NotesPanel data={data} monthLabel={monthName(currentMonth)} exportJSON={handleExport} onImportFile={handleImport} onClearMonth={handleClearMonth} onGeneralNote={handleGeneralNote} onRangeNote={handleRangeNote} rangeLabel={rangeLabel} clearSelection={clearSelection} importError={importError} />
      </div>
    </div>
  );
};

export default WallCalendar;

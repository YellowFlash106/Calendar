import React, { KeyboardEvent } from "react";
import styles from "../WallCalendar.module.css";
import type { DayCell, DateString } from "../utils/dateUtils";
import type { MonthData } from "../utils/storage";

interface Props {
  matrix: DayCell[][];
  data: MonthData;
  previewEnd: DateString | null;
  holidays: Record<DateString, string>;
  onDayClick: (date: DateString) => void;
  onDayKeyDown: (e: KeyboardEvent<HTMLButtonElement>, date: DateString) => void;
  onHover: (date: DateString | null) => void;
}

const CalendarGrid: React.FC<Props> = ({ matrix, data, previewEnd, holidays, onDayClick, onDayKeyDown, onHover }) => {
  return (
    <div className={`${styles.grid}`} role="grid">
      {matrix.map((row, ri) => (
        <div key={ri} className={styles.gridRow} role="row">
          {row.map((cell) => {
            const inRange = (() => {
              if (!data.rangeStart) return false;
              const start = data.rangeStart;
              const end = previewEnd ?? data.rangeEnd;
              if (!end) return false;
              const [s, e] = start <= end ? [start, end] : [end, start];
              return cell.date >= s && cell.date <= e;
            })();

            const isStart = !!data.rangeStart && cell.date === data.rangeStart;
            const end = previewEnd ?? data.rangeEnd;
            const start = data.rangeStart;
            const isEnd = start != null && end != null && cell.date === (start <= end ? end : start);

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
                onClick={() => onDayClick(cell.date)}
                onKeyDown={(e) => onDayKeyDown(e, cell.date)}
                onMouseEnter={() => onHover(cell.date)}
                onMouseLeave={() => onHover(null)}
                aria-label={`${cell.date}${cell.isToday ? " (today)" : ""}${holiday ? `, ${holiday}` : ""}${isStart ? " (range start)" : ""}${isEnd ? " (range end)" : ""}`}
                aria-pressed={isStart || isEnd}
                tabIndex={cell.isCurrentMonth ? 0 : -1}
              >
                <span className={styles.dayNumber}>{cell.day}</span>
                {holiday && <span className={styles.holidayDot} title={holiday} />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;

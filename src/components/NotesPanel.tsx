import React from "react";
import styles from "../WallCalendar.module.css";
import type { MonthData } from "../utils/storage";

interface Props {
  data: MonthData;
  monthLabel: string;
  exportJSON: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearMonth: () => void;
  onGeneralNote: (val: string) => void;
  onRangeNote: (val: string) => void;
  rangeLabel: string | null;
  clearSelection: () => void;
  importError: string | null;
}

const NotesPanel: React.FC<Props> = ({ data, monthLabel, exportJSON, onImportFile, onClearMonth, onGeneralNote, onRangeNote, rangeLabel, clearSelection, importError }) => {
  return (
    <div className={styles.notesSection}>
      <div className={styles.notesHeader}>
        <span className={styles.notesTitle}>Notes</span>
        <div className={styles.noteActions}>
          <button className={styles.clearBtn} onClick={onClearMonth} title="Clear all notes for this month">Clear month</button>
          <button className={styles.exportBtn} onClick={exportJSON} title="Export notes">Export JSON</button>
          <label className={styles.importLabel} title="Import notes">Import
            <input type="file" accept=".json" onChange={onImportFile} className={styles.hiddenInput} />
          </label>
        </div>
      </div>

      {importError && <p className={styles.errorMsg}>{importError}</p>}

      <textarea className={styles.noteArea} placeholder={`General notes for ${monthLabel}…`} value={data.generalNote} onChange={(e) => onGeneralNote(e.target.value)} aria-label="General monthly notes" rows={3} />

      <div className={styles.rangeNoteSection}>
        <div className={styles.rangeStatus}>
          {rangeLabel ? (
            <>
              <span className={styles.rangeLabel}>{rangeLabel}</span>
              <button className={styles.clearSelBtn} onClick={clearSelection} aria-label="Clear date selection">✕ clear</button>
            </>
          ) : (
            <span className={styles.rangeHint}>Click two dates to select a range</span>
          )}
        </div>

        {data.rangeStart && (
          <textarea className={styles.noteArea} placeholder="Notes for selected date range…" value={data.rangeNote} onChange={(e) => onRangeNote(e.target.value)} aria-label="Date range notes" rows={2} />
        )}
      </div>
    </div>
  );
};

export default NotesPanel;

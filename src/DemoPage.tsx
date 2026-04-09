import { useState } from "react";
import WallCalendar from "./WallCalendar";

// Sample US holidays for 2025-2026
const HOLIDAYS: Record<string, string> = {
  "2025-01-01": "New Year's Day",
  "2025-01-20": "MLK Jr. Day",
  "2025-02-17": "Presidents' Day",
  "2025-04-18": "Good Friday",
  "2025-05-26": "Memorial Day",
  "2025-06-19": "Juneteenth",
  "2025-07-04": "Independence Day",
  "2025-09-01": "Labor Day",
  "2025-10-13": "Columbus Day",
  "2025-11-11": "Veterans Day",
  "2025-11-27": "Thanksgiving",
  "2025-12-25": "Christmas",
  "2026-01-01": "New Year's Day",
};

export default function DemoPage() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme === "dark" ? "#0c0b09" : "#ede9df",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        gap: "1.5rem",
        transition: "background 0.4s",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Theme toggle */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{ color: theme === "dark" ? "#9e9a91" : "#5a574f", fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Theme
        </span>
        <button
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          style={{
            padding: "6px 18px",
            borderRadius: "99px",
            border: "1px solid",
            borderColor: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
            background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            color: theme === "dark" ? "#f0ede6" : "#1a1916",
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
      </div>

      {/* Calendar */}
      <WallCalendar
        holidays={HOLIDAYS}
        theme={theme}
      />

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        justifyContent: "center",
        fontSize: "0.7rem",
        color: theme === "dark" ? "#5a574f" : "#9e9a91",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        <span>• Click once = range start</span>
        <span>• Click again = range end</span>
        <span>• Red dot = holiday</span>
        <span>• Notes auto-save</span>
      </div>
    </div>
  );
}

# 📅 WallCalendar

A polished, physical wall calendar React component with integrated notes, date-range selection, hero imagery, and LocalStorage persistence.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (localhost:3000)
npm run dev

# 3. Type check
npm run type-check

# 4. Production build → dist/
npm run build
```

---

## Project Structure

```
wall-calendar/
├── index.html                    # Entry HTML (loads Google Fonts)
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx                  # React root
    ├── DemoPage.tsx              # Demo page with theme toggle
    ├── WallCalendar.tsx          # ← Main component
    ├── WallCalendar.module.css   # ← All styles (CSS Modules)
    └── utils/
        ├── dateUtils.ts          # Pure date helpers
        └── storage.ts            # LocalStorage helpers
```

---

## Component API: `<WallCalendar />`

```tsx
import WallCalendar from "./WallCalendar";

<WallCalendar
  heroImages={{
    "2025-07": {
      src: "/images/summer.jpg",
      alt: "Beach at sunset",
      accent: "#f59e0b",
    },
  }}
  defaultHero={{
    src: "/images/default.jpg",
    alt: "Scenic landscape",
  }}
  initialMonth="2025-07-01"
  holidays={{
    "2025-07-04": "Independence Day",
    "2025-12-25": "Christmas",
  }}
  theme="dark"   // "light" | "dark"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heroImages` | `Record<"YYYY-MM", HeroImage>` | `{}` | Per-month hero photos |
| `defaultHero` | `HeroImage` | Built-in Unsplash | Fallback image |
| `initialMonth` | `DateString` | Today | First month shown |
| `holidays` | `Record<DateString, string>` | `{}` | Date → label map |
| `theme` | `"light" \| "dark"` | `"dark"` | Color theme |

### `HeroImage` shape

```ts
interface HeroImage {
  src: string;      // URL or local path
  alt?: string;
  accent?: string;  // CSS color for accent override
}
```

---

## Persistence

Data is auto-saved to `localStorage` with a 400ms debounce. Keys follow the pattern:

```
wallcal_2025-07   →  { generalNote, rangeStart, rangeEnd, rangeNote }
```

### Export / Import

- **Export**: Click "Export JSON" — downloads `wall-calendar-notes.json`  
- **Import**: Click "Import" — loads a previously exported JSON, merges with existing data
- Both are available via `exportAllData()` and `importAllData(json)` utilities in `storage.ts`

---

## Customising Hero Images

**Option A — URL per month** (recommended for web):
```tsx
heroImages={{
  "2025-12": { src: "https://your-cdn.com/winter.jpg", alt: "Snow" },
}}
```

**Option B — local assets** (Vite):
```tsx
import summerImg from "./assets/summer.jpg";
heroImages={{ "2025-07": { src: summerImg } }}
```

**Option C — default fallback**: The component ships built-in Unsplash URLs per month (no CORS issues). Replace `MONTH_HEROES` in `WallCalendar.tsx` to swap all defaults at once.

---

## Date Range Selection

1. **Click** any day → sets range start (highlighted in amber)
2. **Hover** → preview of the range
3. **Click** a second day → sets range end, highlights the span
4. **Clear** → "✕ clear" button or "Clear month" resets selection
5. **Keyboard** → Tab to a cell, Space/Enter to select

---

## Accessibility

- `role="grid"` / `role="gridcell"` on the calendar
- `aria-label` on every day cell (includes today/holiday/range metadata)
- `aria-pressed` on start/end cells
- Full keyboard support: Tab navigation + Enter/Space selection
- `prefers-reduced-motion` media query disables all animations

---

## Styling & Theming

All design tokens are CSS custom properties on `.calendar`:

```css
--accent          /* amber highlight color */
--surface         /* panel background */
--text-primary    /* main text */
--font-display    /* Playfair Display (serif) */
--font-body       /* DM Sans */
```

Override in your own CSS to retheme without touching component code:

```css
.my-wrapper :global(.calendar) {
  --accent: #6366f1;   /* indigo accent */
}
```

---

## Browser Support

ES2020+, all modern browsers. LocalStorage required for persistence (gracefully degrades — data is just not saved if unavailable).

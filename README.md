# 📅 WallCalendar

A compact React wall-calendar component with notes, date-range selection, hero imagery, and LocalStorage persistence. This README reflects the recent refactor (components extracted to `src/components`) and added env helpers.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (localhost:5173)
npm run dev

# 3. Type check
npm run type-check

# 4. Production build → dist/
npm run build

# 5. Preview production build
npm run preview
```

---

## Project Structure

```
wall-calendar/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── DemoPage.tsx
    ├── WallCalendar.tsx          # Main component (composes subcomponents)
    ├── WallCalendar.module.css
    ├── components/
    │   ├── HeroPanel.tsx
    │   ├── CalendarGrid.tsx
    │   └── NotesPanel.tsx
    └── utils/
        ├── dateUtils.ts
        └── storage.ts
```

---

## Environment files

This project uses Vite env vars. Example files added to the repo:

- `.env.development` — development defaults
- `.env.production` — production defaults
- `.env.local.example` — copy to `.env.local` for local secrets (ignored by git)

Vite requires env keys to be prefixed with `VITE_`. Example keys included:

```
VITE_APP_NAME="Wall Calendar"
VITE_API_URL="http://localhost:3000/api"
```

Do not commit `.env.local`.

---

## Component API: `<WallCalendar />`

```tsx
import WallCalendar from "./WallCalendar";

<WallCalendar
  heroImages={{
    "2025-07": { src: "/images/summer.jpg", alt: "Beach at sunset", accent: "#f59e0b" }
  }}
  defaultHero={{ src: "/images/default.jpg", alt: "Scenic landscape" }}
  initialMonth="2025-07-01"
  holidays={{ "2025-07-04": "Independence Day", "2025-12-25": "Christmas" }}
  theme="dark"
/>
```

### Key props

- `heroImages` — `Record<"YYYY-MM", HeroImage>` (per-month images)
- `defaultHero` — fallback `HeroImage`
- `initialMonth` — `DateString` for initial view
- `holidays` — `Record<DateString, string>` map
- `theme` — `"light" | "dark"`

`HeroImage`:

```ts
interface HeroImage { src: string; alt?: string; accent?: string }
```

---

## Persistence

Data auto-saves to `localStorage` (400ms debounce). Keys use `wallcal_<YYYY-MM>` and store `{ generalNote, rangeStart, rangeEnd, rangeNote }`.

Export / Import via UI:

- Export downloads `wall-calendar-notes.json`
- Import merges JSON into `localStorage`

Utility functions: `exportAllData()` and `importAllData(json)` in `src/utils/storage.ts`.

---

## Deployment

Any static host supporting Vite output works (Vercel, Netlify, GitHub Pages).

Simple Vercel/Netlify steps:

1. Push the repo to GitHub.
2. Connect the repo in Vercel/Netlify.
3. Set build command: `npm run build` and publish directory: `dist`.
4. Optionally add env vars in the host dashboard (use `VITE_` prefixes).

---

## Notes

- Components have been extracted to `src/components` for readability and easier testing.
- Accessibility: grid roles, `aria-label` on cells, keyboard selection supported.
- Styling is CSS Modules; design tokens exposed via CSS custom properties on `.calendar`.

---

If you'd like, I can also add a CI workflow for automated builds and deploys (GitHub Actions, Vercel auto-deploy, or Netlify). 

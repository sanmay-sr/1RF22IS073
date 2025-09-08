# Frontend test submission

React + TypeScript (Vite, MUI) URL shortener UI.

## Run

```bash
cd "Frontend test submission"
npm install
npm run dev
# http://localhost:3000
```

## Behavior
- Create up to 5 short URLs; validates URL, validity (1–1440), shortcode (3–12 alphanumeric).
- Short links are shown/copied as `http://localhost:3000/<code>` and redirect via backend to count clicks.
- Statistics lists all items (backend list) and loads per-code stats on expansion.

## Backend dependency
- Requires backend running at `http://localhost:5000`.

## Logging
- Helper: `src/logging/log.ts` (posts to evaluation server; network errors ignored).

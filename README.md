# URL Shortener (Frontend + Backend)

Small, production-like URL shortener built with React + TypeScript (frontend) and Node.js + Express (backend). Logging is integrated via a reusable function that POSTs to the evaluation server.

## Structure

```
1RF22IS073/
├── Logging Middleware/          # Reusable log(stack,level,package,message)
├── Backend test submission/     # Node.js + Express service (in-memory Map)
├── Frontend test submission/    # React + MUI app (Vite)
└── README.md
```

## Run locally

1) Backend (required)
```bash
cd "Backend test submission"
npm install
npm run dev
# http://localhost:5000
```

2) Frontend
```bash
cd "Frontend test submission"
npm install
npm run dev
# http://localhost:3000
```

## Endpoints (backend)
- POST `/shorturls` → create. Body: `{ url, validity?, shortcode? }` → `201 { shortLink, expiry }`
- GET  `/shorturls` → list all `{ items: [...] }`
- GET  `/shorturls/:shortcode` → stats for a code
- GET  `/:shortcode` → redirect, also records click `{timestamp, referrer, location}`

Notes:
- Data is stored in-memory (Map); it resets on backend restart.
- Coarse location is classified as `local` | `private` | `public` | `unknown` (no external APIs).

## Frontend behavior
- Shorten up to 5 URLs at once; validation for URL, validity (1–1440), and shortcode (3–12 alphanumeric).
- Short links are displayed/copy as `http://localhost:3000/<code>`; visiting this route in the app redirects via backend to count clicks.
- Statistics page lists all shortcodes (from backend list) and loads per-code stats on expansion.

## Logging
- Frontend: `Frontend test submission/src/logging/log.ts`
- Backend middleware + helper: `Backend test submission/src/middleware/logging.ts`
- Reusable package reference: `Logging Middleware/src/index.ts`
All major actions (create, redirect, errors, page loads) log to the evaluation server; network errors are ignored by design.

## Screenshots
- Frontend test submission/Screenshots
- Backend test submission/Screenshots

## Policy
No references to Affordmed in repo name, README, or commit messages (as required).
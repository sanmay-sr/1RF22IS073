# Backend test submission

Node.js + Express URL shortener in TypeScript. Stores data in-memory.

## Run

```bash
cd "Backend test submission"
npm install
npm run dev
# http://localhost:5000
```

## Endpoints
- POST `/shorturls` → create short URL
  - Body: `{ url, validity?, shortcode? }`
  - Returns: `201 { shortLink, expiry }`
- GET `/shorturls` → list all short URLs
- GET `/shorturls/:shortcode` → stats for a code
- GET `/:shortcode` → redirect (records click with `{timestamp, referrer, location}`)

## Folder structure

```
src/
  middleware/logging.ts   # logging middleware + helper
  routes/shorturls.ts     # API routes
  server.ts               # entry
```

## Logging
- `loggingMiddleware` is first in the chain.
- All major actions call `log(stack,level,package,message)` to the evaluation server (Bearer token included).
- Network errors are ignored.

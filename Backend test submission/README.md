# Backend test submission

Simple Node.js + Express URL shortener backend in TypeScript.

## Run

```bash
cd "Backend test submission"
npm install
npm run dev
```

Server: http://localhost:5000

## Endpoints

- POST `/shorturls` → create short URL
  - Body: `{ url, validity?, shortcode? }`
  - Returns: `201 { shortLink, expiry }`
- GET `/shorturls/:shortcode` → stats
- GET `/:shortcode` → redirect

## Folder structure

```
src/
  middleware/logging.ts   # logging middleware + helper
  routes/shorturls.ts     # API routes
  server.ts               # entry
```

## Logging

- `loggingMiddleware` is registered first.
- All major actions call `log(stack,level,package,message)` which POSTs to the test server using the Bearer token.
- Network errors are ignored.

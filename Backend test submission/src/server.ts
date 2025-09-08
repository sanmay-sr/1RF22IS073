import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { loggingMiddleware, log } from './middleware/logging';
import { shortUrlsRouter, urls } from './routes/shorturls';

const app = express();
const PORT = 5000;

app.use(loggingMiddleware); // first middleware
app.use(cors());
app.use(bodyParser.json());

// API routes MUST come before the catch-all redirect
app.use('/shorturls', shortUrlsRouter);

// Redirect route (catch-all for /:shortcode)
app.get('/:shortcode', async (req, res) => {
  const code = req.params.shortcode;
  const item = urls.get(code);
  if (!item) {
    await log('backend', 'error', 'redirect', 'Shortcode not found');
    return res.status(404).json({ error: 'Not found' });
  }
  if (Date.now() > item.expiry) {
    await log('backend', 'error', 'redirect', 'Shortcode expired');
    return res.status(404).json({ error: 'Expired' });
  }

  // Coarse location without external APIs: classify client IP
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  const ip = forwarded || req.ip || '';
  const location = classifyIp(ip);

  const click = { timestamp: Date.now(), referrer: req.get('referer') || 'direct', location };
  item.totalClicks += 1;
  item.clicks.push(click);

  await log('backend', 'info', 'redirect', `Redirecting ${code}`);
  return res.redirect(item.url);
});

// (no-op) API routes already registered above

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void log('backend', 'error', 'handler', String(err?.message || err));
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  void log('backend', 'info', 'server', `Server started on http://localhost:${PORT}`);
});

// Helpers
function classifyIp(ip: string): string {
  // Normalize IPv6 localhost
  if (!ip) return 'unknown';
  if (ip === '::1' || ip === '127.0.0.1') return 'local';
  // Remove IPv6 prefix if present (e.g., ::ffff:127.0.0.1)
  const v4 = ip.includes(':') && ip.startsWith('::ffff:') ? ip.substring(7) : (ip.includes(':') ? '' : ip);
  const target = v4 || ip;
  try {
    const parts = target.split('.').map(Number);
    if (parts.length === 4 && parts.every(n => Number.isInteger(n) && n >= 0 && n <= 255)) {
      const [a, b] = parts;
      // RFC1918 private ranges
      if (a === 10) return 'private';
      if (a === 172 && b >= 16 && b <= 31) return 'private';
      if (a === 192 && b === 168) return 'private';
      return 'public'; // coarse only
    }
  } catch {}
  return 'unknown';
}



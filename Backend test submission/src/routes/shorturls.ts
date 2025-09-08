import { Router, type Request, type Response } from 'express';
import { log } from '../middleware/logging';

interface ClickRecord { timestamp: number; referrer: string; location: string; }
interface ShortUrl { url: string; shortcode: string; createdAt: number; expiry: number; totalClicks: number; clicks: ClickRecord[]; }

const urls = new Map<string, ShortUrl>();

const router = Router();

function isValidUrl(value: string): boolean {
  try { new URL(value); return true; } catch { return false; }
}
function isValidShortcode(value: string): boolean { return /^[a-zA-Z0-9]{3,12}$/.test(value); }
function generateShortcode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// POST /shorturls
router.post('/', async (req: Request, res: Response) => {
  const { url, validity, shortcode } = req.body ?? {};

  if (!url || typeof url !== 'string' || !isValidUrl(url)) {
    await log('backend', 'error', 'handler', 'Invalid URL');
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let mins: number = 30;
  if (validity !== undefined) {
    const parsed = Number(validity);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1440) {
      await log('backend', 'error', 'handler', 'Invalid validity');
      return res.status(400).json({ error: 'Validity must be an integer between 1 and 1440 minutes' });
    }
    mins = parsed;
  }

  let code: string = shortcode ?? '';
  if (code) {
    if (!isValidShortcode(code)) {
      await log('backend', 'error', 'handler', 'Invalid shortcode format');
      return res.status(400).json({ error: 'Shortcode must be 3-12 alphanumeric characters' });
    }
    if (urls.has(code)) {
      await log('backend', 'error', 'handler', 'Shortcode collision');
      return res.status(409).json({ error: 'Shortcode already exists' });
    }
  } else {
    do { code = generateShortcode(); } while (urls.has(code));
  }

  const createdAt = Date.now();
  const expiry = createdAt + mins * 60 * 1000;
  const record: ShortUrl = { url, shortcode: code, createdAt, expiry, totalClicks: 0, clicks: [] };
  urls.set(code, record);

  await log('backend', 'info', 'create', `Created ${code}`);
  return res.status(201).json({ shortLink: `http://localhost:5000/${code}`, expiry: new Date(expiry).toISOString() });
});

// GET /shorturls/:shortcode (stats)
router.get('/:shortcode', async (req: Request, res: Response) => {
  const code = req.params.shortcode;
  const item = urls.get(code);
  if (!item) {
    await log('backend', 'error', 'handler', 'Shortcode not found');
    return res.status(404).json({ error: 'Not found' });
  }
  if (Date.now() > item.expiry) {
    await log('backend', 'error', 'handler', 'Shortcode expired');
    return res.status(404).json({ error: 'Expired' });
  }

  return res.json({
    url: item.url,
    createdAt: new Date(item.createdAt).toISOString(),
    expiry: new Date(item.expiry).toISOString(),
    totalClicks: item.totalClicks,
    clicks: item.clicks.map(c => ({ timestamp: new Date(c.timestamp).toISOString(), referrer: c.referrer, location: c.location }))
  });
});

// GET /shorturls (list all)
router.get('/', async (_req: Request, res: Response) => {
  const all = Array.from(urls.values()).map(item => ({
    url: item.url,
    shortcode: item.shortcode,
    createdAt: new Date(item.createdAt).toISOString(),
    expiry: new Date(item.expiry).toISOString(),
    totalClicks: item.totalClicks
  }));
  return res.json({ items: all });
});

export { router as shortUrlsRouter, urls };



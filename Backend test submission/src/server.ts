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

// Redirect route
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

  const click = { timestamp: Date.now(), referrer: req.get('referer') || 'direct', location: 'unknown' };
  item.totalClicks += 1;
  item.clicks.push(click);

  await log('backend', 'info', 'redirect', `Redirecting ${code}`);
  return res.redirect(item.url);
});

// API routes
app.use('/shorturls', shortUrlsRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void log('backend', 'error', 'handler', String(err?.message || err));
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  void log('backend', 'info', 'server', `Server started on http://localhost:${PORT}`);
});



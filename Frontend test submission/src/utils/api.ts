// Backend API helpers
export interface CreateShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateShortUrlResponse {
  shortLink: string; // e.g., http://localhost:5000/abc123
  expiry: string; // ISO
}

const BASE_URL = 'http://localhost:5000';

export async function apiCreateShortUrl(payload: CreateShortUrlRequest): Promise<CreateShortUrlResponse> {
  const res = await fetch(`${BASE_URL}/shorturls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any));
    throw new Error(data?.error || 'Failed to create short URL');
  }
  return res.json();
}

export interface StatsResponse {
  url: string;
  createdAt: string;
  expiry: string;
  totalClicks: number;
  clicks: { timestamp: string; referrer: string; location: string }[];
}

export async function apiGetStats(shortcode: string): Promise<StatsResponse> {
  const res = await fetch(`${BASE_URL}/shorturls/${shortcode}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({} as any));
    throw new Error(data?.error || 'Stats not found');
  }
  return res.json();
}

export function extractShortcodeFromLink(shortLink: string): string {
  try {
    const url = new URL(shortLink);
    return url.pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}



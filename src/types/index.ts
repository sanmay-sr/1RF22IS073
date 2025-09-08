// Data models for URL shortener app

export interface ClickRecord {
  timestamp: number;
  referrer: string;
  location: string;
}

export interface ShortUrl {
  id: string;
  longUrl: string;
  shortcode: string;
  createdAt: number;
  expiresAt: number;
  totalClicks: number;
  clicks: ClickRecord[];
}

export interface UrlEntry {
  longUrl: string;
  validity: number;
  shortcode: string;
}

export interface AppData {
  urls: ShortUrl[];
}

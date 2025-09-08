// Utility functions for URL operations

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidShortcode(shortcode: string): boolean {
  return /^[a-zA-Z0-9]{3,12}$/.test(shortcode);
}

export function generateShortcode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

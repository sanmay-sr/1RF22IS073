// localStorage utilities for persistence

import { AppData, ShortUrl } from '../types';

const STORAGE_KEY = 'url-shortener-data';

export function loadData(): AppData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { urls: [] };
  } catch {
    return { urls: [] };
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Ignore storage errors
  }
}

export function addUrl(url: ShortUrl): void {
  const data = loadData();
  data.urls.push(url);
  saveData(data);
}

export function updateUrl(updatedUrl: ShortUrl): void {
  const data = loadData();
  const index = data.urls.findIndex(url => url.id === updatedUrl.id);
  if (index !== -1) {
    data.urls[index] = updatedUrl;
    saveData(data);
  }
}

export function findUrlByShortcode(shortcode: string): ShortUrl | null {
  const data = loadData();
  return data.urls.find(url => url.shortcode === shortcode) || null;
}

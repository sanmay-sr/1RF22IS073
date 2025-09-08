// Logging middleware and helper
import type { Request, Response, NextFunction } from 'express';

const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...TXblEeCV1gEGwBMnkDUCxZVc7ho_tmmtgshcuSWCLck';

export async function log(stack: string, level: string, pkg: string, message: string): Promise<void> {
  const payload = { stack: stack.toLowerCase(), level: level.toLowerCase(), package: pkg.toLowerCase(), message };
  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
  } catch {
    // ignore network errors
  }
}

// First middleware: logs each request briefly
export function loggingMiddleware(req: Request, _res: Response, next: NextFunction) {
  void log('backend', 'info', 'request', `${req.method} ${req.originalUrl}`);
  next();
}



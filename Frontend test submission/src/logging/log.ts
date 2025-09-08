// Logging module for URL shortener app (frontend-local to avoid Vite fs boundary issues)
const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...TXblEeCV1gEGwBMnkDUCxZVc7ho_tmmtgshcuSWCLck';

export interface LogData {
  stack: string;
  level: string;
  package: string;
  message: string;
}

export async function Log(stack: string, level: string, packageName: string, message: string): Promise<void> {
  const logData: LogData = {
    stack: stack.toLowerCase(),
    level: level.toLowerCase(),
    package: packageName.toLowerCase(),
    message
  };

  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(logData)
    });
  } catch {
    // Ignore network errors
  }
}

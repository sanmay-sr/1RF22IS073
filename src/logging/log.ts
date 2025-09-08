// Logging module for URL shortener app
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
    stack,
    level,
    package: packageName,
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
  } catch (error) {
    // Ignore network errors as per requirements
    // Still counts as a log attempt
  }
}

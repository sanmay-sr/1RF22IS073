// Logging middleware for URL shortener application
const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJydml0MjJiaXMwNzQucnZpdG1AcnZlaS5lZHUuaW4iLCJleHAiOjE3NTczMDgwNzQsImlhdCI6MTc1NzMwNzE3NCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjJlMmRjYWI5LTEwMDEtNGNiYi05MzMyLTQzMzFmYmM0MTM1ZCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNhbm1heSBzIHIiLCJzdWIiOiI4N2Q1YWM3YS1hN2NlLTQ5ODgtYmEzMS04NDlmN2ZmZTUwMzIifSwiZW1haWwiOiJydml0MjJiaXMwNzQucnZpdG1AcnZlaS5lZHUuaW4iLCJuYW1lIjoic2FubWF5IHMgciIsInJvbGxObyI6IjFyZjIyaXMwNzMiLCJhY2Nlc3NDb2RlIjoiV1BWcWt3IiwiY2xpZW50SUQiOiI4N2Q1YWM3YS1hN2NlLTQ5ODgtYmEzMS04NDlmN2ZmZTUwMzIiLCJjbGllbnRTZWNyZXQiOiJnakNubmRlVkViSFF3Qk1BIn0.TXblEeCV1gEGwBMnkDUCxZVc7ho_tmmtgshcuSWCLck';

export interface LogData {
  stack: string;
  level: string;
  package: string;
  message: string;
}

/**
 * Logs a message to the evaluation service
 * @param stack - The stack identifier (e.g., "frontend", "backend")
 * @param level - The log level (e.g., "info", "error", "warn", "debug")
 * @param packageName - The package/module name
 * @param message - The log message
 */
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
  } catch (error) {
    // Ignore network errors as per requirements
    // Still counts as a log attempt
  }
}

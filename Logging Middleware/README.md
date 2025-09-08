# Logging Middleware

A reusable logging middleware package for the URL shortener application.

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Usage

```typescript
import { Log } from './dist/index';

// Log an info message
await Log('frontend', 'info', 'url-shortener', 'User created short URL');

// Log an error
await Log('frontend', 'error', 'validation', 'Invalid URL format provided');

// Log a warning
await Log('backend', 'warn', 'database', 'Connection pool running low');
```

## API

### Log(stack, level, package, message)

- **stack**: The stack identifier (frontend, backend, etc.) - converted to lowercase
- **level**: The log level (info, error, warn, debug, fatal) - converted to lowercase  
- **package**: The package/module name - converted to lowercase
- **message**: The descriptive log message

## Notes

- All string parameters are automatically converted to lowercase as required by the API
- Network errors are silently ignored but still count as log attempts
- Uses Bearer token authentication for the evaluation service

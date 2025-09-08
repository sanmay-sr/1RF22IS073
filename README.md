# URL Shortener Application

A React TypeScript URL shortener frontend with logging middleware integration.

## Project Structure

```
1RF22IS073/
├── Logging Middleware/          # Reusable logging package
├── Backend test submission/     # Backend test implementation  
├── Frontend test submission/    # React frontend application
└── README.md
```

## Quick Start

### Frontend (Main Application)

```bash
cd "Frontend test submission"
npm install
npm run dev
```

The application will run at http://localhost:3000

### Backend Test

```bash
cd "Backend test submission"
npm install
npm run build
npm start
```

### Logging Middleware

```bash
cd "Logging Middleware"
npm install
npm run build
```

## Features

- **URL Shortening**: Create up to 5 short URLs at once
- **Custom Shortcodes**: Optional custom shortcodes (3-12 alphanumeric chars)
- **Expiration**: Configurable validity (1-1440 minutes, default 30)
- **Statistics**: View click counts and detailed click records
- **Redirection**: Automatic redirection via /:shortcode routes
- **Persistence**: Data stored in localStorage
- **Logging**: Integrated logging middleware for all operations

## Logging Integration

The logging middleware is integrated throughout the application:

- **File**: `Frontend test submission/src/logging/log.ts`
- **Middleware Location**: `Logging Middleware/src/index.ts`
- **Usage**: All major actions log to the evaluation service

## Technology Stack

- React 18 with TypeScript
- Material UI for components
- React Router for navigation
- Vite for build tooling
- localStorage for persistence

## No References Policy

No references to Affordmed in repo name, README, or commit messages as required.
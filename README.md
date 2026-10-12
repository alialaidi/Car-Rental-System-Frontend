# Car Rental System — Frontend

React and TypeScript single-page app built with Vite. Features follow the implementation plan boundaries: presentation calls application hooks, feature API modules call shared infrastructure, and domain models remain dependency-free.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Setup

1. Copy .env.example to .env.
2. Run npm install.
3. Run npm run dev.

The dev server uses http://localhost:5173 and refuses to silently choose another port. Set VITE_API_BASE_URL in .env to the backend base URL. The development API URL is https://localhost:7217; the backend must allow the Vite origin through CORS.

## Scripts

- npm run dev — start the Vite development server
- npm run typecheck — strict TypeScript check
- npm run lint — ESLint
- npm run test — Vitest
- npm run build — type-check and create production assets in dist/
- npm run format / npm run format:check — format/check formatting with Prettier

Never put secrets or tokens in VITE_* variables; Vite embeds them in browser assets.

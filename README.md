# Memory Game

A lightweight memory (concentration) card game built with React + TypeScript and Vite. This project is a small, component-driven implementation designed for learning and experimentation with modern frontend tooling.

## Features

- Classic memory card matching gameplay
- Built with React + TypeScript
- Fast dev server with Vite

## Tech stack

- React 19
- TypeScript
- Vite (dev server & bundler)
- ESLint for linting
- Lodash (utility functions)

## Quick start

Prerequisites:
- Node.js (16+ recommended)
- npm

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:5173 (Vite's default) in your browser.

Build for production:

```bash
npm run build
```

Preview a production build locally:

```bash
npm run preview
```

Lint the project:

```bash
npm run lint
```

## Project structure

Top-level files you’ll care about:

- `index.html` — App entry HTML
- `package.json` — Project metadata & scripts
- `vite.config.ts` — Vite configuration
- `tsconfig.json` / `tsconfig.*.json` — TypeScript config

Source files (in `src/`):

- `main.tsx` — App bootstrap
- `App.tsx` — Main app component
- `Board.tsx` — Game board logic and layout
- `GameProvider.tsx` — Game state provider (context)
- `ResetGameButton.tsx` — Reset control
- `*.module.css` and `index.css` — Component and global styles

## How the game works (brief)

- A set of card pairs are generated and shuffled
- The player flips two cards at a time
- If they match, they stay revealed, otherwise they flip back
- The game ends when all pairs are found
# Todo List App

A todo list manager built with React 19 and TypeScript. The app communicates with a backend API to manage multiple named todo lists and their items.

## Features

- Create, rename, and delete todo lists
- Add, rename, check off, and delete todo items
- Animated checkbox and task reordering via Framer Motion
- "Complete all" button streams progress from the server via NDJSON
- Progress bar and done/total counters per list
- Toast notifications for mutations (success and error)

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 + TypeScript ~5.7 |
| Styling | Tailwind CSS v4 (token-based, no config file) |
| Server state | TanStack React Query v5 |
| Animations | Framer Motion v12 |
| Notifications | Sonner |
| Build | Vite 6 + SWC |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |

## Running the App

The frontend proxies `/api` to `http://host.docker.internal:3000`, so a backend must be running on port 3000 before starting the dev server.

```bash
npm install
npm run dev          # starts Vite on http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Type-check and build for production |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:unit:watch` | Vitest in watch mode |
| `npm run test:unit:coverage` | Unit tests with coverage report |
| `npm run test` | Run Playwright e2e tests |
| `npm run test:ui` | Playwright UI mode (port 3333) |
| `npm run lint` | ESLint |

## DevContainer

Open the repo in VS Code and select **Reopen in Container**. The devcontainer:

- Base image: `mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm`
- Runs `npm install` and installs the Playwright Chromium browser on creation (`postCreate.sh`)
- Starts the Vite dev server automatically on container start (`npm run dev -- --host`)
- Forwards port **5173** (Vite, opens browser automatically) and **3333** (Playwright UI)
- Installs the **Claude Code** VS Code extension

## About Crunchloop

![crunchloop](https://s3.amazonaws.com/crunchloop.io/logo-blue.png)

We strongly believe in giving back :rocket:. Let's work together [`Get in touch`](https://crunchloop.io/#contact).

# Contributing to EduSuite

Thank you for your interest in contributing to **EduSuite**. This is a multi-app monorepo (web, mobile, backend) managed with **pnpm** and **Turborepo**.

## Getting started

1. **Install pnpm**

```bash
npm install -g pnpm
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Run apps in development**

```bash
pnpm dev
```

Web, mobile and API apps are defined under `apps/`, shared code lives in `packages/`.

## Branching & commits

- Use small, focused branches (for example: `feature/attendance-filters`, `fix/payroll-totals`).
- Write clear commit messages that describe the _why_ more than the _what_.

## Code style & tooling

- TypeScript everywhere (no new plain JS files).
- Use existing patterns in:
  - `apps/web` for Next.js UI (App Router, React 19, Tailwind).
  - `apps/mobile` for Expo + React Native screens.
  - `apps/api` for NestJS modules, services and controllers.
- Before opening a PR, run (where applicable):

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Adding / editing modules

- **Backend (NestJS)**: follow the existing module layout under `apps/api/src/modules/*` and prefer DTOs + services over placing logic in controllers.
- **Web (Next.js)**: keep new routes under the appropriate segment in `apps/web/src/app`, and co-locate UI components under `apps/web/src/components` when they are reused.
- **Mobile (Expo)**: use Expo Router conventions under `apps/mobile/src/app` and keep data access in `services` / `stores` instead of inside screens.

## Security & secrets

- Never commit `.env` files or real API keys.
- Use `.env.example` as a template when adding new configuration.

## Reporting bugs & requesting features

When you open an issue, please include:

- What you were trying to do.
- Exact error messages or screenshots.
- Steps to reproduce.

This helps keep the project healthy and easy to maintain as it grows.


# TrailGrad

TrailGrad is a Next.js app for interview readiness, resume review, project prep, mock practice, and AI feedback.

## Development

This repository uses `pnpm`.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `app/` - route entrypoints, layouts, and route handlers
- `components/marketing/` - public landing-page UI
- `components/ui/` - shared design-system primitives
- `lib/` - services, validators, mocks, utilities, and shared app configuration
- `public/images/` - static brand, landing, and avatar assets

## Health Check

Use `/api/health` for basic uptime monitoring.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```

Run the full suite with:

```bash
pnpm test
```

# Trailgrad Tech Stack

This document summarizes the main technologies currently used in Trailgrad.

## Quick Summary

Tech stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk
- Neon PostgreSQL
- Prisma ORM
- Inngest
- Gemini API
- Zod
- S3-compatible private storage, such as Cloudflare R2
- Vitest
- Playwright
- pnpm

## Application

- Next.js 16 App Router for routing, server components, route handlers, and production builds.
- React 19 for UI rendering.
- TypeScript for application code and strict typing.
- Tailwind CSS 4 for styling through `app/globals.css`.
- shadcn/ui configuration through `components.json`.
- lucide-react for icons.
- framer-motion for UI animation.
- react-spinners for lightweight loading indicators.

## Authentication

- Clerk for sign-in, sign-up, session handling, and protected routes.
- `proxy.ts` handles auth-aware route protection and onboarding redirects.
- Clerk user IDs are used as the stable profile identity in the database.

## Database

- Neon PostgreSQL as the application database.
- Prisma ORM for schema modeling, migrations, and typed database access.
- Prisma client output is generated into `lib/generated/prisma`.

Current core database areas include:

- User profiles and onboarding state.
- Career and target context.
- Retained onboarding data model tables.
- Private source documents and resume versions.
- Durable analysis jobs.
- MVP profile analysis results.
- Safe AI run metadata.

## Background Jobs

- Inngest for durable background workflows.
- `lib/inngest/client.ts` defines the Inngest client and typed events.
- `lib/inngest/functions.ts` contains background job handlers.
- Local development uses `INNGEST_DEV=1`.

## AI Foundation

- Gemini through the official `@google/genai` SDK.
- Provider-independent AI boundary through `lib/ai/provider.ts` and `lib/ai/provider-factory.ts`.
- Zod for structured output schemas and response validation.
- Server-only AI configuration in `lib/ai/configuration.ts`.
- Data-policy enforcement in `lib/ai/data-policy.ts`.
- Cost estimation in `lib/ai/cost.ts`.
- Safe error mapping in `lib/ai/errors.ts`.
- Redaction helpers in `lib/ai/redaction.ts`.

The current implemented provider is Gemini. Workflows import `getAIProvider()` rather than provider classes directly.

## Resume Storage and Extraction

- Private S3-compatible object storage for uploaded resumes.
- Cloudflare R2 is supported through S3-compatible environment variables.
- AWS SDK S3 client is used for upload and private object access.
- `pdf-parse` extracts text from PDF resumes.
- `mammoth` extracts text from DOCX resumes.
- Original resume files are stored privately outside Neon.
- Extracted text is stored in resume version records for server-side analysis.

## Validation and Schemas

- Zod is used for runtime validation of AI outputs and structured data.
- AI schemas live in `lib/ai/schemas`.
- Prompt definitions live in `lib/ai/prompts`.

## Testing

- Vitest for unit tests.
- Playwright for end-to-end browser tests.
- Test commands:

```bash
pnpm test:unit
pnpm test:e2e
pnpm test
```

## Tooling

- pnpm as the package manager.
- Node.js 20.9 or newer.
- ESLint with `eslint-config-next`.
- TypeScript compiler for type checking.
- Prisma CLI for migrations and client generation.

Common commands:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## Environment Services

Required service families:

- Clerk for authentication.
- Neon PostgreSQL for database storage.
- S3-compatible private object storage for resumes.
- Inngest for durable local and production jobs.
- Gemini API for the current AI provider.

Important environment variables are documented in `.env.example` and `README.md`.

## Important Architecture Rules

- Keep secrets server-side. Do not expose private keys through `NEXT_PUBLIC_`.
- Keep model providers behind the shared AI provider interface.
- Keep AI data-policy checks in shared AI services so workflows cannot bypass them.
- Do not store full prompts, full model outputs, resume text, job-description text, interview answers, addresses, phone numbers, emails, or API keys in `AiRun`.
- Do not hold Prisma transactions open during provider calls.
- Use route handlers and server-side services for privileged operations.
- Preserve Trailgrad's existing visual identity and routing architecture.

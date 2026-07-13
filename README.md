# Trailgrad

Trailgrad is a Next.js interview-readiness product. The current app has a public marketing page, Clerk authentication, authenticated onboarding, private resume upload, a durable MVP analysis workflow, and a Today dashboard that renders the saved structured analysis.

The core product loop is:

```text
Diagnose candidate risks
-> recommend the highest-impact improvement
-> help the candidate build evidence
-> practise explaining the evidence
-> verify improvement
-> update readiness
```

## Current Stack

- Next.js App Router
- React and TypeScript
- Clerk for authentication
- Neon PostgreSQL
- Prisma ORM
- Inngest for durable background jobs
- Gemini API through a server-only AI provider boundary
- Cloudflare R2 or any S3-compatible private object storage for resume files
- Vitest for unit tests
- Playwright for e2e tests

## App Flow

Public users land on `/`.

Signed-out users who enter the app go through Clerk at `/auth`. After authentication, server-side routing sends them to:

- `/onboarding` when their Trailgrad profile is not completed
- `/today` when onboarding is completed

Current protected app routes include:

- `/today`
- `/onboarding`

The undeveloped product routes `/readiness`, `/projects`, `/practice`, and `/profile/*` are still protected, but currently redirect completed users back to `/today` instead of rendering mock product screens.

Incomplete authenticated users are redirected back to `/onboarding` when they open an app route. Completed authenticated users are redirected from `/onboarding` to `/today`.

## Key Files

- `proxy.ts` - Clerk middleware and route protection
- `lib/auth/server.ts` - server-side auth and onboarding redirect helpers
- `app/auth/page.tsx` - post-auth routing entry
- `app/onboarding/page.tsx` - authenticated onboarding page
- `components/onboarding/onboarding-flow.tsx` - existing onboarding UI with persistent state and resume upload
- `app/api/profile/onboarding/route.ts` - onboarding autosave and submission
- `app/api/profile/onboarding/resume/route.ts` - authenticated resume upload endpoint
- `lib/services/profile-service.ts` - profile/onboarding service facade
- `lib/db/profile-repository.ts` - Prisma-backed profile and onboarding repository
- `lib/resume/upload-service.ts` - resume validation, storage, extraction, dedupe, and versioning
- `lib/storage/private-object-storage.ts` - server-only S3-compatible storage adapter
- `lib/inngest/client.ts` - Inngest client and typed Trailgrad events
- `lib/inngest/functions.ts` - durable background job handlers
- `lib/ai/provider-factory.ts` - server-only AI provider factory used by the analysis workflow
- `lib/ai/providers/gemini-provider.ts` - Gemini structured-output provider
- `lib/ai/configuration.ts` - AI provider, model, timeout, retry, budget, and data-policy configuration
- `lib/ai/schemas/` - Zod schemas for AI structured outputs
- `lib/ai/prompts/` - shared Trailgrad AI rules and operation prompts
- `prisma/schema.prisma` - canonical database schema
- `prisma/migrations/` - canonical database migration history

## Database Model

Trailgrad uses Clerk user IDs as the stable auth reference. `user_profiles.clerk_user_id` is the primary key, so profile creation is idempotent and there is one Trailgrad profile per Clerk user.

Implemented tables:

- `user_profiles` - onboarding status, current step, timestamps, analysis error, and JSON onboarding draft
- `career_contexts` - target role, experience level, timeline, preparation availability, intensity, and optional company/title
- `target_contexts` - active target role/job description context
- `manual_projects` - retained database table from the onboarding data model; no current UI writes manual projects
- `source_documents` - private uploaded document metadata, storage path, SHA-256 hash, processing status, and version
- `resume_versions` - versioned resume records, extracted text status, extracted text, and active flag
- `analysis_jobs` - durable analysis job state, progress stage, retry count, idempotency key, and safe errors
- `profile_analyses` - one compact MVP structured analysis per resume version and target context
- `ai_runs` - safe AI metadata only: provider/model, operation, prompt version, token counts, cost estimate, duration, status, fallback flag, and safe error code

The old base64 resume storage path has been removed. Original resume bytes are not stored in Neon.

`ai_runs` must not store resume text, job-description text, complete prompts, complete model outputs, interview answers, personal contact information, addresses, or API keys.

## Resume Upload

Resume upload is authenticated and scoped to the current Clerk user. The browser never sends or controls a profile ID.

Supported formats:

- PDF
- DOCX

The server validates:

- MIME type
- extension
- max file size
- non-empty content
- sanitized filename
- duplicate content by SHA-256
- readable extracted text

Files are stored privately in S3-compatible object storage using this path shape:

```text
profiles/{profileId}/resumes/{sourceDocumentId}/{sanitizedFilename}
```

The upload service:

1. Resolves or creates the current Trailgrad profile.
2. Validates and hashes the uploaded bytes.
3. Reuses an existing `SourceDocument` for duplicate content.
4. Uploads new files to private object storage.
5. Extracts resume text server-side.
6. Stores normalized extracted text in `resume_versions`.
7. Updates onboarding resume metadata.

No permanent public URLs are exposed.

## Environment

Create `.env.local` from `.env.example`.

Required:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth/ready
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/auth/ready
DATABASE_URL=
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
RESUME_MAX_UPLOAD_BYTES=5242880
AI_PROVIDER=gemini
AI_DATA_POLICY=synthetic_only
GEMINI_API_KEY=
GEMINI_EXTRACTION_MODEL=gemini-3.1-flash-lite
GEMINI_ANALYSIS_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.5-flash
AI_DEFAULT_TIMEOUT_MS=30000
AI_MAX_RETRIES=1
AI_MONTHLY_BUDGET_USD=0
AI_MAX_OUTPUT_TOKENS=3072
```

For Cloudflare R2:

```env
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=<private-bucket-name>
```

Use the R2 S3 client Access Key ID and Secret Access Key. Do not use `NEXT_PUBLIC_` for storage secrets.

AI secrets are server-only. Do not prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`.

By default, `AI_DATA_POLICY=synthetic_only`. In this mode Trailgrad blocks model calls that attempt to send real candidate resumes, real job descriptions, or personal candidate data. Only synthetic fixtures or explicitly marked development data may be sent. To use real candidate data in a properly configured environment, set `AI_DATA_POLICY=real_user_data_allowed` intentionally; Trailgrad never enables that mode automatically and never relies only on `NODE_ENV` for data protection.

The AI foundation implements Gemini structured JSON output and safe metadata logging. The MVP onboarding analysis workflow queues an Inngest `INITIAL_PROFILE` job after onboarding submission, analyzes the extracted resume plus target context, stores one compact `profile_analyses` result, and completes onboarding when the job succeeds. To process it locally, run the Next.js app and an Inngest dev worker pointed at `/api/inngest`. With `AI_DATA_POLICY=synthetic_only`, real resumes and job descriptions are blocked; use synthetic fixtures or intentionally set `AI_DATA_POLICY=real_user_data_allowed` in a properly configured environment.

## Development

Install dependencies:

```bash
pnpm install
```

Run migrations:

```bash
pnpm db:migrate
```

Generate Prisma client:

```bash
pnpm db:generate
```

Start the app:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```

Run the full test command:

```bash
pnpm test
```

## Notes For Future Agents

- Do not redesign the UI unless explicitly asked. The current branding, typography, colors, spacing, and onboarding presentation should be preserved.
- Do not replace Clerk or add a second auth abstraction.
- Keep privileged work server-side.
- Use Prisma and `prisma/migrations/` as the database source of truth.
- Do not store original resume bytes in Neon.
- Keep object storage private and use signed URLs only when a user must access their own file.
- Resume upload still stops at private storage and text extraction. The first AI call happens later, after onboarding submission, through the Inngest MVP profile analysis job.
- The AI provider architecture currently implements only Gemini.
- Gemini free-tier development must use synthetic or anonymized data only.

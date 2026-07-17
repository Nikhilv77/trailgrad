# Trailgrad

Trailgrad is a Next.js interview-readiness product. It helps a candidate turn a target role, a real resume, and a concrete goal into a focused readiness trail.

The current product loop is:

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
- React 19 and TypeScript
- Clerk for authentication
- Neon PostgreSQL
- Prisma ORM
- Inngest for durable background jobs
- Gemini through the server-only AI provider boundary
- Cloudflare R2 or any S3-compatible private object storage for resumes
- Vitest for unit tests
- Playwright for e2e tests

## Current Product Flow

Public users land on `/`.

Clerk handles sign-in and sign-up at `/auth`. After authentication:

- incomplete users go to `/onboarding`
- completed users go to `/today`
- completed users with no trail can still enter the first-trail flow

The active onboarding flow has two product steps:

1. Create a trail
2. Upload a resume

There is no separate review screen, no "create trail" interstitial, and no hash-loader handoff in the active onboarding path.

### Step 1: Create A Trail

The first onboarding step uses the shared `FirstTrailForm` experience. It collects:

- target role
- experience level
- primary goal
- optional company target
- timeline
- weekly preparation time
- preparation intensity
- optional job description or notes

The target role and experience level are selected from Trailgrad's supported catalogs. Arbitrary role strings are not accepted.

### Step 2: Upload Resume

The second onboarding step uploads one private PDF or DOCX resume. The UI shows extraction, inspection, success, and invalid-resume states inside the resume card.

When the user creates the trail, the server:

1. verifies the authenticated user's active extracted resume
2. rejects the submission if the latest uploaded file failed resume validation
3. validates the saved onboarding trail draft
4. creates the first `job_applications` trail
5. creates an idempotent `JOB_ANALYSIS` analysis job
6. queues `trailgrad/profile.analysis.requested`
7. marks onboarding completed
8. redirects to `/trails/preparing?jobId=...&trail=...`
9. sends the user to `/today?trail=...` when analysis reaches a terminal state

`/onboarding/analyzing` remains only as a compatibility route and redirects back into the current flow.

## Protected Routes

- `/today` - selected-trail dashboard
- `/trails/new` - reusable trail creation flow for completed users
- `/trails/preparing` - loading handoff while trail analysis runs
- `/profile` - profile settings for active resume, target role, and experience level
- `/onboarding` - first-trail onboarding flow
- `/readiness`, `/projects`, `/practice` - protected placeholders

Compatibility redirects:

- `/today/applications/new` -> `/trails/new`
- `/today/reanalyze` -> `/trails/new`

## Key Files

- `proxy.ts` - Clerk middleware and route protection
- `lib/auth/server.ts` - server-side auth and redirect helpers
- `app/auth/page.tsx` - post-auth routing entry
- `app/onboarding/page.tsx` - authenticated onboarding entry
- `components/onboarding/onboarding-flow.tsx` - onboarding shell, progress, resume upload, first-trail completion
- `components/trails/first-trail-form.tsx` - shared trail creation UI used by onboarding and `/trails/new`
- `components/trails/trail-form-options.tsx` - trail option cards and selectors
- `lib/trails/catalog.ts` - supported roles, experience levels, preparation time, and intensity catalogs
- `app/api/profile/onboarding/route.ts` - onboarding state save and hardened completion validation
- `app/api/profile/onboarding/resume/route.ts` - authenticated resume upload endpoint
- `app/api/applications/route.ts` - trail creation, onboarding first-trail completion, and analysis job queueing
- `app/trails/new/page.tsx` - reusable completed-user trail setup route
- `app/trails/preparing/page.tsx` - analysis loading handoff
- `app/profile/[[...slug]]/page.tsx` - profile settings route
- `components/profile/profile-settings.tsx` - profile update UI
- `lib/services/profile-service.ts` - profile/onboarding service facade
- `lib/db/profile-repository.ts` - Prisma-backed profile and resume repository
- `lib/db/application-repository.ts` - Prisma-backed trail repository
- `lib/resume/upload-service.ts` - resume validation, private storage, extraction, dedupe, and versioning
- `lib/resume/resume-likeness.ts` and `lib/resume/resume-classifier.ts` - deterministic resume-shape checks
- `lib/storage/private-object-storage.ts` - server-only S3-compatible storage adapter
- `lib/inngest/client.ts` - typed Inngest events
- `lib/inngest/functions.ts` - durable background job handlers
- `lib/ai/provider-factory.ts` - server-only AI provider factory
- `lib/ai/providers/gemini-provider.ts` - Gemini structured-output provider
- `lib/ai/configuration.ts` - AI provider, model, timeout, retry, budget, and data-policy configuration
- `lib/ai/prompts/mvp-analysis.ts` - compact trail-analysis prompt
- `lib/validators/profile.ts` - onboarding, profile, and trail validation schemas
- `prisma/schema.prisma` - canonical database schema
- `prisma/migrations/` - canonical database migration history

## Data Model

Trailgrad uses Clerk user IDs as the stable profile identity. Privileged endpoints only resolve the current profile from the authenticated Clerk user.

Implemented tables:

- `user_profiles` - onboarding status, current step, timestamps, analysis error, and onboarding draft
- `career_contexts` - target role, experience level, timeline, preparation time, intensity, and optional target details
- `target_contexts` - active target role or job-description context
- `job_applications` - user-created trails
- `manual_projects` - retained table; no active UI writes manual projects
- `source_documents` - private uploaded document metadata and storage path
- `resume_versions` - extracted resume text, extraction status, active flag, and version history
- `analysis_jobs` - durable job state, idempotency, retries, stage, and safe errors
- `profile_analyses` - compact structured analysis result per resume version and target context
- `ai_runs` - safe AI metadata only

Original resume bytes are not stored in Neon. Resume files live in private S3-compatible object storage.

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
- likely resume structure

Files are stored privately with this path shape:

```text
profiles/{profileId}/resumes/{sourceDocumentId}/{sanitizedFilename}
```

The upload service:

1. resolves or creates the current Trailgrad profile
2. validates and hashes the uploaded bytes
3. reuses an existing `SourceDocument` for duplicate content
4. uploads new files to private object storage
5. extracts resume text server-side
6. stores normalized extracted text in `resume_versions`
7. updates onboarding resume metadata

No permanent public resume URLs are exposed.

On final onboarding/trail creation, the server does not trust browser-submitted resume metadata. It hydrates resume name, size, content type, and upload time from the authenticated user's active `source_documents` record.

If a user uploads a bad file after a valid resume, trail creation is blocked until they upload a valid resume again. This prevents a stale valid resume from letting an invalid latest upload pass.

## Trail Analysis

Trail creation uses the active extracted resume plus the selected target context.

The flow:

1. Persist a `job_applications` trail.
2. Update the active career and target context.
3. Create an idempotent `JOB_ANALYSIS` job.
4. Send `trailgrad/profile.analysis.requested`.
5. Inngest loads the active resume text and target context.
6. `getAIProvider()` returns the configured provider.
7. Gemini returns compact structured JSON.
8. Zod validates the result.
9. Trailgrad stores the result in `profile_analyses`.

The current MVP result includes:

- profile summary
- strongest signals
- rejection risks
- resume suggestions
- important questions
- today's priority
- seven-day plan
- readiness dimensions
- target-alignment classification

Target alignment helps detect when the selected role, resume direction, and pasted target details point at different goals. It is surfaced in the Today dashboard, but it does not yet block analysis.

## Today And Profile

Completed users can create multiple trails from `/trails/new`.

The Today dashboard:

- lists trails in the sidebar
- lets users switch the selected trail
- renders the selected trail's completed analysis
- links to new trail creation
- links to profile settings
- shows an empty/loading workspace when the selected trail has no completed analysis yet

`/profile` lets completed users update:

- active resume
- target role
- experience level

Profile resume uploads reuse the same private upload, extraction, duplicate detection, and resume-likeness checks. Updating profile defaults does not rewrite existing trail snapshots; new trails use the latest defaults.

Trail analysis failures do not reset completed onboarding to failed.

## Environment

Create `.env.local` from `.env.example`.

Core local values:

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
RESUME_MAX_PAGE_COUNT=5
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
INNGEST_DEV=1
NEXT_PUBLIC_SITE_URL=https://trailgrad.com
PLAYWRIGHT_BASE_URL=
```

For Cloudflare R2:

```env
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=<private-bucket-name>
```

Use the R2 S3 client Access Key ID and Secret Access Key. Do not use `NEXT_PUBLIC_` for storage secrets.

AI secrets are server-only. Do not prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`.

By default, `AI_DATA_POLICY=synthetic_only`. In this mode Trailgrad blocks model calls that attempt to send real candidate resumes, real job descriptions, or personal candidate data. To use real candidate data in a properly configured environment, set `AI_DATA_POLICY=real_user_data_allowed` intentionally.

For local Inngest development, keep `INNGEST_DEV=1` and run the Inngest dev server alongside `pnpm dev`.

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

- Do not redesign the UI unless explicitly asked.
- Preserve Trailgrad branding, typography, colors, spacing, card style, and button style.
- Do not replace Clerk or add a second auth system.
- Keep privileged work server-side.
- Use Prisma and `prisma/migrations/` as the database source of truth.
- Do not store original resume bytes in Neon.
- Keep object storage private.
- Do not trust browser-supplied resume metadata on final onboarding or trail creation.
- Do not allow arbitrary target role strings unless a custom-role product flow is intentionally added.
- Use `getAIProvider()` and shared AI data-policy checks for model calls.
- Do not store full prompts, full responses, resume text, job-description text, API keys, emails, phone numbers, addresses, or interview answers in `ai_runs`.
- Trail analysis uses `JOB_ANALYSIS` jobs and should not reset a completed user back into failed onboarding.

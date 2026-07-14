You are working on an existing Next.js application called Trailgrad.

Already implemented and working:
- Trailgrad name and branding
- complete visual theme and design system
- marketing landing page
- Clerk authentication
- sign-in and sign-up
- protected auth routing with onboarding/completed-user redirects
- a resume-first onboarding interface after authentication
- private resume upload for PDF and DOCX
- server-side resume extraction and versioning
- deterministic resume-likeness checks that reject unrelated documents
- durable Inngest analysis jobs
- server-only AI provider foundation using Gemini through `getAIProvider()`
- MVP structured profile analysis stored in `profile_analyses`
- trail creation after onboarding
- reusable `/trails/new` trail setup route
- Today dashboard that renders the selected trail's completed analysis
- Today sidebar/dropdown trail switching
- profile settings for active resume, target role, and experience defaults
- target-alignment output inside the analysis result
- completed-user trail analysis flow at `/trails/new`
- `/trails/preparing` loading handoff while trail analysis runs
- app-level not-found and error pages

Important rules:

1. Do not redesign the application.
2. Do not change the Trailgrad name, logo, typography, color palette, spacing system, card style, buttons, or existing visual identity.
3. Reuse existing components and styling patterns.
4. Do not replace Clerk or create a second authentication system.
5. Do not rewrite unrelated code.
6. Inspect the repository before modifying anything.
7. Follow the existing Next.js routing architecture.
8. Use TypeScript with strict types.
9. Keep secrets and privileged operations server-side.
10. Build loading, empty, success, and error states.
11. Keep the UX focused: one important decision or action per screen.
12. Do not add mock functionality that appears real.
13. Preserve all currently working landing-page and authentication behavior.
14. Do not bypass the shared AI provider factory or shared AI data-policy checks.
15. Do not store full prompts, full model responses, resume text, job-description text, API keys, emails, phone numbers, addresses, or interview answers in `AiRun`.
16. Do not trust browser-supplied resume metadata on final onboarding submission.
17. Do not allow arbitrary target role strings unless a real custom-role product flow is intentionally added.

Trailgrad’s core product loop is:

Diagnose candidate risks
→ recommend the highest-impact improvement
→ help the candidate build evidence
→ practise explaining the evidence
→ verify improvement
→ update readiness

Primary authenticated navigation will eventually be:

- Today
- Readiness
- Projects
- Practice

Internal systems such as resume analysis, Proof Map, evidence graph, question engine, challenges, and scoring should not become separate confusing products.

Current implemented product flow:

1. Public users land on `/`.
2. Clerk handles authentication at `/auth`.
3. Incomplete authenticated users go to `/onboarding`.
4. Onboarding collects default target role/domain, experience level, resume, and review.
5. Resume upload stores the original file in private S3-compatible storage and extracted text in `resume_versions`.
6. Final onboarding submission uses the authenticated user's active extracted resume. The server hydrates resume metadata from `source_documents`; it does not trust client-submitted resume filename/size/type.
7. Final onboarding marks onboarding completed, shows the `/onboarding/analyzing` handoff, and sends the user to `/trails/new`.
8. Completed users with no trail are redirected from `/today` to `/trails/new`.
9. Completed users create trails at `/trails/new`; `/today/applications/new` is a compatibility redirect.
10. A trail can be job/interview-focused or learning-focused, and collects company/topic, title/goal, timeline, prep time/intensity, and optional pasted details while using profile role/domain and experience defaults.
11. Trail creation persists a `job_applications` row, updates the active career/target context, creates an idempotent `JOB_ANALYSIS` `AnalysisJob`, and sends `trailgrad/profile.analysis.requested`.
12. Inngest runs the MVP profile analysis using the server-only AI provider boundary.
13. The structured result is validated with Zod and stored in `profile_analyses`.
14. `/trails/preparing` shows a loading handoff while analysis runs and sends the user to `/today?trail=...` when ready.
15. `/today` lists all trails, lets users switch selected trail, renders the selected trail's dashboard, and links to new trail creation and profile settings.
16. `/profile` lets completed users update their active resume, target role/domain, and experience defaults without rewriting existing trail snapshots.

Current protected routes:

- `/today` - implemented selected-trail dashboard
- `/trails/new` - implemented reusable trail creation flow
- `/trails/preparing` - implemented trail loading handoff
- `/today/applications/new` - compatibility redirect to `/trails/new`
- `/today/reanalyze` - compatibility redirect to `/trails/new`
- `/profile` - implemented profile settings for resume, role, and experience defaults
- `/onboarding` - implemented onboarding flow
- `/readiness`, `/projects`, `/practice` - protected placeholders/future app routes; do not make fake product screens unless asked

Current database areas:

- `user_profiles` - Clerk-keyed profile and onboarding state
- `career_contexts` - target role, experience level, timeline, and prep settings
- `target_contexts` - active target role/JD context
- `job_applications` - user-created trail targets and prep settings
- `source_documents` - private uploaded document metadata
- `resume_versions` - extracted resume text and active version
- `analysis_jobs` - durable Inngest job state, idempotency, retries, progress, safe errors
- `profile_analyses` - MVP structured analysis result
- `ai_runs` - safe AI metadata only

Current validation/security guardrails:

- Clerk user ID is the only profile identity accepted by privileged endpoints.
- Resume upload validates MIME type, extension, size, filename, duplicate content, readable text, and resume-likeness.
- Final onboarding requires an active extracted resume and validates server-hydrated resume metadata.
- Final onboarding validates known target roles only.
- `targetJobMode=paste` requires a non-empty job description.
- Onboarding and trail text fields have length limits.
- Trail analysis failures must not reset completed onboarding to failed.
- AI calls must respect `AI_DATA_POLICY`; `synthetic_only` blocks real candidate/job data.

After completing a task:
- run lint
- run typecheck
- run relevant tests
- run the production build when practical
- fix errors caused by the changes
- summarize files changed, decisions made, and remaining limitations

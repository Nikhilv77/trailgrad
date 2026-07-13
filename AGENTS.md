You are working on an existing Next.js application called Trailgrad.

Already implemented and working:
- Trailgrad name and branding
- complete visual theme and design system
- marketing landing page
- Clerk authentication
- sign-in and sign-up
- protected auth routing with onboarding/completed-user redirects
- an existing onboarding interface after authentication
- private resume upload for PDF and DOCX
- server-side resume extraction and versioning
- deterministic resume-likeness checks that reject unrelated documents
- durable Inngest analysis jobs
- server-only AI provider foundation using Gemini through `getAIProvider()`
- MVP structured profile analysis stored in `profile_analyses`
- Today dashboard that renders the latest completed analysis
- target-alignment output inside the analysis result
- completed-user reanalysis flow at `/today/reanalyze`
- dashboard skeleton loading while reanalysis runs
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
4. Onboarding collects target role, experience level, timeline, resume, optional JD, and review.
5. Resume upload stores the original file in private S3-compatible storage and extracted text in `resume_versions`.
6. Final onboarding submission uses the authenticated user's active extracted resume. The server hydrates resume metadata from `source_documents`; it does not trust client-submitted resume filename/size/type.
7. Final onboarding creates an idempotent `INITIAL_PROFILE` `AnalysisJob` and sends `trailgrad/profile.analysis.requested`.
8. Inngest runs the MVP profile analysis using the server-only AI provider boundary.
9. The structured result is validated with Zod and stored in `profile_analyses`.
10. Successful initial analysis marks onboarding completed and sends the user to `/today`.
11. Completed users can update target/JD/prep settings at `/today/reanalyze`.
12. Reanalysis creates a `JOB_ANALYSIS` job and keeps the existing dashboard behind a skeleton while the new job runs.

Current protected routes:

- `/today` - implemented dashboard
- `/today/reanalyze` - implemented reanalysis form
- `/onboarding` - implemented onboarding flow
- `/readiness`, `/projects`, `/practice`, `/profile/*` - protected placeholders/future app routes; do not make fake product screens unless asked

Current database areas:

- `user_profiles` - Clerk-keyed profile and onboarding state
- `career_contexts` - target role, experience level, timeline, and prep settings
- `target_contexts` - active target role/JD context
- `source_documents` - private uploaded document metadata
- `resume_versions` - extracted resume text and active version
- `analysis_jobs` - durable Inngest job state, idempotency, retries, progress, safe errors
- `profile_analyses` - MVP structured analysis result
- `ai_runs` - safe AI metadata only

Current validation/security guardrails:

- Clerk user ID is the only profile identity accepted by privileged endpoints.
- Resume upload validates MIME type, extension, size, filename, duplicate content, readable text, and resume-likeness.
- Final onboarding validates known target roles only.
- `targetJobMode=paste` requires a non-empty job description.
- Onboarding and reanalysis text fields have length limits.
- Initial onboarding failures may mark onboarding failed.
- Reanalysis failures must not reset completed onboarding to failed.
- AI calls must respect `AI_DATA_POLICY`; `synthetic_only` blocks real candidate/job data.

After completing a task:
- run lint
- run typecheck
- run relevant tests
- run the production build when practical
- fix errors caused by the changes
- summarize files changed, decisions made, and remaining limitations

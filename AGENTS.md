You are working on an existing Next.js application called Trailgrad.

Already implemented and working:
- Trailgrad name and branding
- complete visual theme and design system
- marketing landing page
- Clerk authentication
- sign-in and sign-up
- an existing onboarding interface, currently placed before authentication

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

After completing a task:
- run lint
- run typecheck
- run relevant tests
- run the production build when practical
- fix errors caused by the changes
- summarize files changed, decisions made, and remaining limitations
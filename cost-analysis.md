# Trailgrad Cost Analysis

Last reviewed: July 14, 2026

This is a planning estimate, not a billing guarantee. Pricing and free tiers change, and real cost depends on traffic, analysis frequency, model choice, resume size, and how often users reanalyze.

Official pricing pages:

- Vercel: https://vercel.com/pricing
- Clerk: https://clerk.com/pricing
- Neon: https://neon.com/pricing
- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/
- Inngest: https://www.inngest.com/pricing
- Gemini API: https://ai.google.dev/gemini-api/docs/pricing

## Current Paid Services

Trailgrad currently depends on:

- Vercel for Next.js hosting.
- Clerk for authentication.
- Neon PostgreSQL for the database.
- Cloudflare R2 or another S3-compatible store for private resumes.
- Inngest for durable background analysis jobs.
- Gemini API for structured AI analysis.

## Current Free-Tier Thresholds

| Service | Free threshold that matters for Trailgrad | Likely 10k-user impact |
|---|---:|---|
| Vercel | Hobby is free but intended for personal/non-commercial use. Pro starts around $20/month. | For a real commercial launch, assume Vercel Pro from day one. |
| Clerk | First 50,000 monthly retained users are free. | 10k retained users should still be free for current auth needs. |
| Cloudflare R2 | 10 GB-month storage, 1M Class A ops, 10M Class B ops. | Usually free or near-free at 10k users if resumes average about 1 MB or less. |
| Neon | Free includes limited storage and compute. Launch is usage-based; official typical spend is about $15/month for intermittent load with 1 GB. | 10k users will probably move beyond Free if the app is active. Estimate Launch. |
| Inngest | Hobby includes 50k executions/month and 5 concurrent executions. | Free if analysis volume is under roughly 16k successful analyses/month. Pro starts around $99/month if exceeded. |
| Gemini | Free tier exists for development/rate-limited use; paid tier should be used for production real user data. | AI becomes the main variable cost. |

## Important Trailgrad Assumptions

These estimates assume the current MVP:

- One active resume per user.
- One initial analysis after onboarding.
- Optional reanalysis from `/today/reanalyze`.
- Current Inngest workflow uses about 3 billed executions per successful analysis run: the function run plus two successful steps.
- Current AI prompt is compact: selected resume evidence, target context, optional JD truncated to 2,500 characters, and compact JSON output.
- No interview mode, GitHub sync, coaching chat, RAG, embeddings, or scheduled recurring analysis yet.

Future features can change costs a lot. Interview practice, chat, repeated feedback loops, embeddings, or repository analysis will increase AI and background-job usage.

## Rough Monthly Cost After 10,000+ Users

### Scenario A: 10k registered users, light monthly usage

Assumption:

- 10k total users.
- Most users already onboarded over time.
- 2k-4k monthly active users.
- 2k-5k analysis or reanalysis runs/month.

Estimated monthly cost:

| Service | Estimate |
|---|---:|
| Vercel Pro | $20 |
| Clerk | $0 |
| R2 | $0-$2 |
| Neon Launch | $15-$40 |
| Inngest Hobby | $0 |
| Gemini paid API | $10-$150 |
| Total | **about $45-$212/month** |

This is the likely early beta / small launch range if users are not reanalyzing constantly.

### Scenario B: 10k monthly active users, one analysis each per month

Assumption:

- 10k retained/monthly active users.
- Each user performs one initial analysis or reanalysis in the month.
- Around 10k analysis runs/month.
- Around 30k Inngest executions/month.

Estimated monthly cost:

| Service | Estimate |
|---|---:|
| Vercel Pro | $20-$50 |
| Clerk | $0 |
| R2 | $0-$5 |
| Neon Launch | $15-$80 |
| Inngest Hobby | $0 |
| Gemini paid API | $50-$500 |
| Total | **about $85-$635/month** |

This is a reasonable planning range for a real 10k active-user Trailgrad MVP.

### Scenario C: 10k monthly active users, heavy reanalysis

Assumption:

- 10k monthly active users.
- Average user runs analysis twice per month.
- Around 20k analysis runs/month.
- Around 60k Inngest executions/month, which crosses the 50k free execution threshold.

Estimated monthly cost:

| Service | Estimate |
|---|---:|
| Vercel Pro | $20-$75 |
| Clerk | $0 |
| R2 | $0-$10 |
| Neon Launch | $30-$120 |
| Inngest Pro | about $99+ |
| Gemini paid API | $100-$1,000 |
| Total | **about $249-$1,304/month** |

This is the range to expect if reanalysis becomes a core habit.

### Scenario D: 50k+ retained users

At this point, Clerk may start to matter.

Assumption:

- More than 50k monthly retained users.
- Analysis usage and AI calls are also growing.

Expected monthly cost:

| Service | Estimate |
|---|---:|
| Vercel Pro / higher usage | $50-$300+ |
| Clerk | $0 until 50k retained users, then paid overages/plan costs |
| R2 | Usually still low unless resumes exceed tens/hundreds of GB |
| Neon | $80-$500+ depending active DB compute |
| Inngest | $99+ |
| Gemini / AI | hundreds to several thousands, depending usage |

At 50k+ retained users, AI and database usage will matter more than basic hosting.

## AI Cost Rule Of Thumb

AI is the hardest part to predict.

For the current compact MVP analysis, a safe planning range is:

- Low-cost Gemini Flash/Lite style model: about **$0.005-$0.05 per analysis**
- Stronger or more verbose model/output: about **$0.05-$0.20+ per analysis**

Approximate monthly AI budget:

| Analysis runs/month | Low estimate | Higher estimate |
|---:|---:|---:|
| 1,000 | $5-$50 | $50-$200 |
| 5,000 | $25-$250 | $250-$1,000 |
| 10,000 | $50-$500 | $500-$2,000 |
| 20,000 | $100-$1,000 | $1,000-$4,000 |

The app already has `AI_MONTHLY_BUDGET_USD` and AI run metadata. Keep those enabled and monitor real cost per analysis before opening broad public access.

## Storage Estimate

R2 is unlikely to be the first serious cost.

Approximate resume storage:

| Average resume size | 10k resumes | R2 impact |
|---:|---:|---|
| 500 KB | about 5 GB | inside free 10 GB tier |
| 1 MB | about 10 GB | around free tier limit |
| 2 MB | about 20 GB | about 10 GB over free tier; still cheap |

Extracted resume text and JSON analysis live in Neon. At 10k users, Neon storage may exceed Free faster than R2, because Postgres rows and indexes have overhead.

## Practical Recommendation

For a real production launch:

1. Use Vercel Pro immediately for commercial hosting.
2. Use paid Gemini or another paid AI provider for real user data.
3. Keep Clerk free until close to 50k monthly retained users.
4. Keep R2 free/low-cost and monitor storage.
5. Use Neon Free for dev, but plan for Neon Launch after meaningful beta traffic.
6. Keep Inngest Hobby until analysis volume crosses roughly 16k successful analysis runs/month.
7. Add product limits before launch:
   - one initial analysis free
   - limited free reanalyses per month
   - paid plan for frequent reanalysis
   - AI monthly budget alerts

## Most Likely 10k+ User Bill

For Trailgrad as currently built, after crossing 10,000 users:

- Conservative/light usage: **$50-$250/month**
- Healthy 10k monthly-active usage: **$100-$700/month**
- Heavy reanalysis usage: **$250-$1,300+/month**

The main cost driver will be AI usage, not auth or resume storage.

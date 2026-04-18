# TrueRank

Independent lab testing platform for health products. Biohacker audience. Editorial journalism angle, not corporate compliance.

## What This Is

TrueRank is an investigative product testing platform competing against Labdoor (opaque scoring, affiliate conflicts) and Oasis Health (claims independent testing but 98% is aggregated public data with no disclosure).

TrueRank's differentiation:
- Products purchased at retail, tested at certified labs
- Filmed chain of custody for content
- Open source scoring methodology
- Transparent data sources cited on every product
- No brand-paid testing, no affiliate revenue

## Tech Stack

- Next.js 16.2.3 with App Router
- TypeScript
- Supabase (Postgres + Auth + RLS)
- Tailwind CSS
- Google OAuth + Magic Link auth
- Hosted on Vercel at thetruerank.com
- Private GitHub repo: anderson-ryan92/truerank

## Key Files

- `src/app/page.tsx` - Home page with category cards
- `src/app/categories/[slug]/page.tsx` - Category page (server component)
- `src/components/CategoryProductList.tsx` - Client-side subcategory filter
- `src/app/products/[slug]/page.tsx` - Product detail page
- `src/app/admin/page.tsx` - Admin panel
- `src/components/AdminProductList.tsx` - Admin search/filter
- `src/app/login/page.tsx` - Auth page
- `src/components/layout/Header.tsx` - Responsive header
- `src/app/globals.css` - Light theme CSS variables
- `data/bottled-water.json` - Product data for seeding
- `scripts/seed-product-data.ts` - Reusable JSON import script

## Design System

Light editorial theme. Warm off-white background, white surface cards, Fraunces serif for headlines, Inter sans for body.

CSS variables defined in `src/app/globals.css`:
- `--background` #F5F3EE (warm off-white)
- `--surface` #FFFFFF
- `--border` #E5E2D9
- `--foreground` #1A1A1A
- `--text-secondary` #6B6B66
- `--text-tertiary` #9A9893
- `--accent` #1A1A1A (black buttons)
- `--good` #2D7D4F (green)
- `--warning` #B8860B (amber)
- `--bad` #B8423D (red)

Never use dark theme classes. All color must use CSS variables via `bg-[var(--surface)]` etc.

## Scoring System

Backend stores four axes in the `scores` table: contaminants_score, potency_score, transparency_score, certifications_score. Overall is calculated as the average.

UI shows ONLY the overall score as a letter grade (A/B/C/D/F) + numeric /100 + qualitative label (Excellent/Very good/Good/Fair/Poor). The four axes are intentionally hidden from users. Do not display them on any page.

Letter grade thresholds:
- A: 90+
- B: 80-89
- C: 70-79
- D: 60-69
- F: <60

## Product Data Model

Products have an `aggregated_data` JSONB column with this shape:

```typescript
type ProductDetailsData = {
  subcategory?: string  // "Still" or "Sparkling" for bottled water
  harmful_ingredients_count?: number
  beneficial_ingredients_count?: number
  microplastics_detected?: boolean | null
  pfas_detected?: boolean | null
  contaminants?: Array<{ name, amount, severity, description }>
  minerals?: Array<{ name, amount, description }>
  details?: Array<{ label, value }>  // Source, Packaging, TDS, pH, etc.
  sources?: Array<{ label, url }>  // Citations
}
```

`is_tested` on products table indicates whether it's been scored. Only tested products should appear in rankings. This was a design issue fixed previously - do not allow unscored products to appear as ranked.

## Importing Product Data

Use the reusable seed script:
```bash
npx tsx scripts/seed-product-data.ts data/bottled-water.json
```

The JSON file format is documented in scripts/seed-product-data.ts. Create new files like data/creatine.json for new categories. The script requires SUPABASE_SERVICE_ROLE_KEY in .env.local (local only, never in git).

## Naming Convention for Products

One product per brand per type. Do not create size variants as separate products.
- Correct: "Evian Natural Spring Water" (one product)
- Wrong: "Evian 500ml" + "Evian 1L" (two products)
- Exception: Still vs sparkling are legitimately different products (different composition)

Slugs should not include size either. "evian-natural-spring-water" not "evian-natural-spring-water-500ml".

## Admin Email

anderson.ryan1992@gmail.com is the only admin. All write operations have RLS policies scoped to this email.

## Deployment

- GitHub push to main triggers Vercel auto-deploy (~30 seconds)
- thetruerank.com A record points to 216.198.79.1 (Vercel)
- Env vars in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_ADMIN_EMAIL
- Service role key is NOT in Vercel - stays local only
- Supabase auth URLs configured for thetruerank.com
- Friend owns truerank.com - acquire later if app succeeds

## Ryan's Work Style Preferences

CRITICAL: Read these before responding.

- Assume working directory is ~/projects/ryans-review-app. Never tell Ryan to cd into it.
- Jocko Willink no-nonsense energy. No fluff, no apologies, no preamble.
- Never use em dashes (--) in any writing. Not a single one.
- Terminal commands only when possible. Do not suggest "open the file in your editor" unless absolutely necessary.
- When Ryan says something isn't working, believe him. Verify instead of defending your prior claim.
- Do not push to git without explicit confirmation from Ryan.
- Do not assume authorization for anything (security work, product development, etc.) unless Ryan explicitly states it.
- No unsolicited suggestions to take breaks or stop working.
- Before starting any task that could overlap with previous work: ask first, execute second.
- Do not generate reports, visualizations, or formatted outputs unless explicitly asked.
- Ryan uses zsh on macOS. Do not ask about basic environment setup.
- When providing file contents, give the actual terminal command to create/update the file (heredoc, cat >, etc.), not just the contents alone.
- Do not guess at specific product details, technical specs, or material compositions. If uncertain, say so and search first.
- Never store sensitive credentials, SSNs, passwords, credit card numbers in memory.

## What NOT To Do

- Do not change the scoring algorithm without discussion
- Do not display the four axis scores (contaminants/potency/transparency/certifications) on the UI - they are stored in the database but hidden from users
- Do not add Amazon affiliate links or any revenue model that creates brand influence conflicts
- Do not use em dashes anywhere, in code comments, strings, or copy
- Do not push to main without explicit confirmation
- Do not scrape Oasis data directly - it's unauthorized and burns the consulting relationship
- Do not recreate duplicate product size variants
- Do not add placeholder/fake data - if data is missing, leave it null and show "Not tested"
- Do not claim independent testing where the data came from a published brand report. The score notes must always cite the source and say "Independent TrueRank testing pending" when applicable
- Do not use localStorage, sessionStorage, or any browser storage APIs in artifacts

## Current State (as of this writing)

- 5 bottled water products scored: Evian (91), Gerolsteiner (86), Mountain Valley (82), Fiji (81), Icelandic Glacial (81)
- 30 total products in bottled water category (25 pending)
- 1 category active (bottled water), 5 categories untested (supplements, creatine, collagen, fish oil, electrolytes)
- Live at thetruerank.com with working auth, admin panel, rankings, product details, mobile responsive

## Pending Priorities

1. Supabase Storage for image uploads (external URLs keep breaking)
2. Email waitlist capture on home page
3. More scored products (creatine is likely next category)
4. Real lab testing: Light Labs in Austin, 5 waters from Whole Foods
5. X handle @thetruerank or variant
6. Open Graph meta tags for social sharing

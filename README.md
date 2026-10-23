# DevSnap

**The developer toolbox that never sees your code.**

A static, client-side toolbox of 34 single-purpose developer tools plus 16 long-form
guides. Every tool runs in the browser with no account, no upload and no tracking
cookie. Built to be monetised with AdSense and to be launched with a viral hook
(the [Code Snapshot](src/components/tools/Snapshot.astro) tool turns any snippet
into a shareable image).

---

## Quick start

```bash
nvm install 22.23.4        # Astro 7 requires Node >= 22.23.4
npm install
npm run dev                # http://localhost:4321
```

> **Node version.** Astro 7 will not start on Node < 22.23.4. If `npx astro` prints
> a version warning, switch Node first.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` over the whole project |
| `npm run test` | 58 functional checks against the tool logic |
| `npm run smoke` | Drives a headless browser over every page and reports console errors |
| `npm run seo` | Title, description, heading, canonical, structured data and word count audit |
| `npm run lint:strings` | Finds unbalanced string literals in the content files |
| `npm run verify` | Post-build audit: links, ad policy, JSON-LD, content density |
| `npm run check:ads` | Build with a dummy publisher id and audit the ad markup |
| `npm run bench` | Re-measures the 15 benchmarked operations and rewrites `src/data/benchmarks.json` |
| `npm run check:consent` | Drives a headless browser with a forced timezone and asserts the advertising-consent behaviour (needs `npm run build:ads` and a preview server) |

`npm run test`, `npm run verify`, `npm run smoke`, `npm run seo` and
`npm run check:consent` are the five that matter before a deploy. Between them they catch the class of bug that is
invisible in a diff: a script referencing an element that does not exist, an
internal link to a page that was never built, a missing ad slot, a tool that
throws when you actually use it, a duplicate title, or a page that fell below
the content threshold.

---

## Configuration

All environment variables are optional. With no configuration the site builds
completely ad-free, which is what you want before the AdSense account exists.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PUBLIC_SITE_DOMAIN` | `https://devsnap.cc` | Canonical origin, used for canonicals, sitemap and Open Graph URLs |
| `PUBLIC_ADSENSE_CLIENT` | *(empty)* | AdSense publisher id, e.g. `pub-1234567890123456`. Empty disables all ad markup |
| `PUBLIC_ADSENSE_SLOT_BELOW_TOOL` | `1234567890` | Slot under the tool widget |
| `PUBLIC_ADSENSE_SLOT_IN_ARTICLE` | `1234567891` | Slot inside the article body |
| `PUBLIC_ADSENSE_SLOT_FOOTER` | `1234567892` | Slot in the footer |
| `PUBLIC_CONTACT_EMAIL` | `hello@devsnap.cc` | Contact address shown on the trust pages |
| `PUBLIC_PUBLISHER_NAME` | `DevSnap` | Publisher name in the footer and legal pages |

All of them live in one place: [`src/config.ts`](src/config.ts).

---

## Deploy

The site is fully static: `npm run build` produces a plain `dist/` directory.
Any static host works — Cloudflare Pages, Netlify, Vercel, GitHub Pages, an
S3 bucket behind a CDN. There is no adapter and no server runtime.

### Option A — Cloudflare Pages, connected to this repository

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick this repository.
2. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** add an environment variable `NODE_VERSION` = `22.23.4`
3. Add the `PUBLIC_*` variables from the table above.
4. Deploy. The first URL is `<project>.pages.dev`; the custom domain is added
   later under **Custom domains** and Cloudflare issues the certificate itself.

This route deploys on every push without touching GitHub Actions, which is the
least moving parts.

### Option B — GitHub Actions (workflow already included)

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) builds and checks every
push, and deploys only when deployment is switched on:

| Where | Name | Value |
| --- | --- | --- |
| Variable | `CLOUDFLARE_DEPLOY_ENABLED` | `true` — the switch |
| Variable | `CLOUDFLARE_PROJECT_NAME` | the Pages project name |
| Secret | `CLOUDFLARE_API_TOKEN` | a token with **Cloudflare Pages: Edit** |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | the account id from the dashboard |

Until `CLOUDFLARE_DEPLOY_ENABLED` is `true` the deploy job is skipped and the
workflow stays green. That is deliberate: a repository that is not deployed
anywhere should not show a red cross on every commit.

### Option C — from a laptop

```bash
npm run build
npx wrangler pages deploy dist --project-name devsnap
```

`wrangler` asks for a browser login the first time.

### Before the first deploy

1. Set `PUBLIC_SITE_DOMAIN` to the real domain. It is used in canonicals, in the
   sitemap and in the Open Graph image URLs, and it is wrong everywhere otherwise.
2. Add the domain to Search Console and submit `https://your-domain/sitemap-index.xml`.
3. Serve `ads.txt` from the domain root. It is generated from the build
   ([`src/pages/ads.txt.ts`](src/pages/ads.txt.ts)), so the publisher id never
   has to be hard-coded in two places.
4. **Allow the ad crawlers.** If a WAF or bot-protection rule blocks
   `Mediapartners-Google` or `AdsBot-Google`, you get invalid-traffic flags
   without any obvious symptom. Start permissive.

---

## Architecture

```
src/
├── config.ts              All publisher-facing configuration
├── data/
│   ├── tools/             Tool registry: one file per category
│   │   ├── format.ts        Format & Validate
│   │   ├── encode.ts        Encode & Hash
│   │   ├── dev.ts           Developer Utilities
│   │   ├── workflow.ts      Developer Utilities (part 2)
│   │   └── creator.ts       Create & Share
│   ├── guides.ts          Long-form guides
│   ├── status-codes.ts    HTTP status reference
│   └── types.ts           Shared types
├── lib/                   Pure logic, no DOM. Unit-tested.
│   ├── diff.ts             LCS diff, line and word level
│   ├── cron.ts             Cron parsing, description, next runs
│   ├── sql.ts              SQL formatter
│   ├── schema.ts           JSON Schema inference
│   ├── csv.ts              RFC 4180 parsing and serialisation
│   ├── jsondiff.ts         Structural JSON comparison
│   ├── markdown.ts         Safe GitHub-flavoured Markdown renderer
│   ├── hash.ts             SHA family, HMAC, CRC-32, Adler-32, Fletcher-16
│   ├── qr.ts               QR encoding and rendering
│   ├── snapshot.ts         Canvas rendering for the code snapshot
│   └── dom.ts              Small DOM helpers
├── components/
│   ├── AdSlot.astro        Ad-server-agnostic slot
│   ├── ToolWidget.astro    Static dispatch to the right widget
│   └── tools/              One component per tool
├── layouts/
│   ├── Base.astro          Head, SEO, JSON-LD, ad loader
│   └── ToolPage.astro      Tool page shell, renders modules in tool-defined order
├── pages/                  Routes
└── integrations/
    └── og-images.ts        Build-time Open Graph image generation
```

### Why the tool registry is data-driven

Each tool carries its own content *and* its own module order in
`src/data/tools/`. `ToolPage.astro` renders the modules in whatever order the
tool declares.

This is deliberate. Cross-page homogeneity — not per-page word count — is what
gets a tool site flagged as low value. A site whose thirty pages all run
"intro, tool, steps, FAQ, related" reads as a template to a human reviewer even
if every page is individually fine. Varying the module order per tool is the
cheapest way to make the pages genuinely different.

### Why everything is client-side

There is no API and no server. A JSON formatter that runs on a server is a
formatter that has seen your credentials, your customer records and your internal
API responses. Running in the browser means the tool works offline, sends
nothing, and costs nothing per use.

The architecture is also the moat: the incumbents in this space (iLovePDF,
Smallpdf, Adobe, Canva) run their tools on a server, and "your file never leaves
your device" is an axis they are slow to copy.

---

## Monetisation notes

The ad integration is deliberately conservative, because most of these rules are
policy requirements rather than preferences:

- **No iframes.** Google prohibits ads inside iframes.
- **No lazy rendering of ad slots.** Google links aggressive lazy loading to
  impression loss under the begin-to-render methodology that takes effect on
  **17 February 2027**.
- **No ads on error or under-construction screens.** The 404 page ships with no
  ad markup at all, and the verifier fails the build if that changes.
- **Ads sit inside real content.** Every page that carries an ad slot also
  carries several hundred words of prose, so the "more ads than publisher
  content" rule is never in play.
- **The slot is ad-server-agnostic.** `AdSlot.astro` renders a plain
  `data-ad-slot` placeholder, so moving from AdSense to Google Ad Manager at
  scale is a configuration change and not a rewrite.

See [`docs/ADSENSE.md`](docs/ADSENSE.md) for the full pre-approval checklist and
the policy references, and [`docs/LAUNCH.md`](docs/LAUNCH.md) for the launch
plan.

---

## Licence

MIT.

# AdSense: pre-approval checklist and policy notes

Everything here is a requirement, not a suggestion. Most of it comes from Google's
own documentation, and the reasoning for each item is included so that it can be
re-checked when the policies change.

---

## 1. Before you apply

### Remove the ad code, then apply

AdSense reviewers look at the site as a visitor sees it. If the site already
contains ad markup that is not yet approved, the reviewer sees empty ad boxes.

1. Build **without** `PUBLIC_ADSENSE_CLIENT` (the default) — the site ships with
   zero ad markup.
2. Apply from the AdSense dashboard.
3. Add the publisher id and the three slot ids, rebuild, deploy.

### Have real traffic before you apply

This is the part that decides the outcome, and it is not about content volume.
A brand-new domain with a few hundred impressions a day is the most common
reason for a first rejection, and no amount of rewriting fixes it.

The practical sequence:

1. Deploy with the tools, guides, trust pages and sitemap in place.
2. Get links and posts (see [`LAUNCH.md`](LAUNCH.md)).
3. Wait until Search Console shows the site receiving organic impressions.
4. Apply.

Budget two or three review cycles. A rejection is a data point, not a verdict.

### The site must be complete

- [x] Every tool actually works. This is a policy requirement, not a nicety:
      Google's *Misleading functionality* spam policy explicitly names "PDF
      merge, countdown timer, online dictionary service" as examples of a site
      that claims a function it does not provide.
- [x] No "coming soon", under-construction, error or thank-you pages reachable
      with ads on them.
- [x] Every link resolves. `npm run verify` fails the build on a broken internal
      link.
- [x] The 404 page carries no ad markup and is `noindex`.
- [x] `sitemap-index.xml` is submitted in Search Console.
- [x] `robots.txt` does not block anything.

### Trust signals

Missing trust signals were diagnosed as rejection cause number four in a
documented 2026 case study of a 65-tool site that was rejected despite having
400–1,300 unique words, a FAQ and JSON-LD on every page.

- [x] About page — explains what the site is, who runs it, how it is funded
- [x] Contact page — a real, monitored address and a link in the footer
- [x] Privacy Policy — covers the local-processing architecture explicitly
- [x] Terms of Service
- [x] Disclaimer
- [x] All five linked from the footer, which appears on every page

### Content

- [x] 600–1,000+ genuinely unique words per tool page
- [x] 5–8 FAQ questions per tool, written as real search queries
- [x] Varying the *order* of the content modules per tool, not just the nouns
- [x] JSON-LD server-rendered in the initial HTML: `WebApplication`,
      `FAQPage`, `BreadcrumbList`
- [x] 16 supporting guides that demonstrate expertise and link into the tools.
      Every guide is linked from at least three pages, and every tool page
      links to the guides that explain its subject.

The module-order variation is the part people miss. The same July 2026 case
study found that the most-repeated verbatim clause across 65 pages appeared only
twice — the prose was already varied, and the sameness was *structural*.
Bulk-padding pages makes a tool site more templated and moves it towards the
actual problem.

---

## 2. The ad implementation rules

These are hard requirements. The `AdSlot` component and the verifier enforce
them, so a regression fails the build rather than the account.

| Rule | Why | Where it is enforced |
| --- | --- | --- |
| Never wrap ads in an `<iframe>` | Explicitly prohibited by the invalid traffic policy | Verifier fails the build |
| Never put ad code in a browser extension or desktop app | "Ads embedded in applications" is a policy violation | Not applicable — this site ships no extension |
| Never lazy-render an ad slot | Google links `renderMarginPercent` / `fetchMarginPercent` to the begin-to-render change on **17 Feb 2027** | No `loading="lazy"` on ad slots; verifier checks |
| Reserve the slot's height in CSS | A slot that grows on fill is layout shift, which is a Core Web Vital | `.ad-slot` carries a `min-height` sized to the usual responsive unit |
| No ads on screens without publisher-content | Inventory-value policy | 404 has no ad markup; verifier checks |
| No ads on screens with replicated content | Inventory-value policy | Every page has unique prose |
| Ads must not outnumber publisher content | "Whitespace does not count as content" | Tool pages carry 600+ words; the ad sits inside the article |
| Ads must not be disguised as navigation or download links | Deceptive placement | Slots are visually distinct and labelled "Advertisement" |
| Never ask for clicks | "Encouraging clicks" | No such copy anywhere on the site |
| ads.txt at the domain root | Seller verification | Generated from the build at [`src/pages/ads.txt.ts`](../src/pages/ads.txt.ts) |

### Consent, and the one thing that must change before EEA traffic

The site ships its own consent banner, and the behaviour is checked by
`npm run check:consent` (11 assertions over a forced timezone):

| Situation | What happens |
| --- | --- |
| EEA / UK / CH, no answer | No ad request at all. The slot is withheld, not filled. |
| EEA / UK / CH, rejected | Same. |
| EEA / UK / CH, accepted | Slots load with personalised advertising. |
| Rest of the world, no answer | Slots load with `npa=1`, non-personalised. |
| Do Not Track present | Never personalised, even with a stored "accept". |

That is the correct behaviour, and it is **not sufficient on its own**. Google
requires a consent management platform certified under its EU user consent
policy for personalised advertising in those regions, and a hand-written banner
is not certified. The supported path is Google's own, which is free with an
AdSense account:

1. AdSense → **Privacy & messaging** → **GDPR message** → create a message.
2. Set it to cover the EEA, the UK and Switzerland.
3. Publish it. Funding Choices then injects its own prompt through the AdSense
   tag, and this site's banner detects `window.googlefc` and steps aside so the
   visitor is not asked twice.

Until that message is published, the safe configuration for a site with any
European traffic is to leave `PUBLIC_ADSENSE_CLIENT` unset: no ads, no
consent question, no policy exposure.

### What the site deliberately does not do

- It does not claim to be a CMP.
- It does not use the IAB TCF stub. A fake `__tcfapi` that returns a fabricated
  consent string is worse than no stub, because every downstream vendor would
  trust it.
- It does not infer consent from continued browsing. Silence is "no".

---

## 3. After approval

### Watch the first 30 days

- **AdSense → Reports → Ad coverage.** If a page has no ads on it, check
  whether the page is classified as "unreviewed" content, which suppresses
  serving.
- **AdSense → Crawler reports.** Check that `Mediapartners-Google` and
  `AdsBot-Google` are not being blocked by a WAF rule. This produces
  invalid-traffic flags with no obvious symptom.
- **AdSense → Active View.** The best available proxy for what the
  begin-to-render change will do to your numbers.

### The 17 February 2027 change

Impression counting for display banners switches from count-on-download to
begin-to-render. Expect total impressions to fall and RPM and CTR to rise on
paper. Google has not committed to whether total earnings move.

**Track total earnings, not impressions.** A reporting change is not a revenue
change, and re-forecasting on an RPM number after that date will mislead you.

### Plan the migration to Ad Manager

AdSense is a launch-stage tool. The sites that scaled past roughly ten million
organic visits a month all run Google Ad Manager with header bidding and
multi-SSP demand — and several of them no longer list AdSense in their ads.txt
at all.

The migration ladder:

1. **AdSense** — where you start.
2. **Ad Manager + two or three SSPs** (OpenX, PubMatic and IndexExchange are
   what the large tool sites run) — where you scale.
3. **Own subscription or affiliate revenue** — the layer that removes the
   platform risk entirely.

`AdSlot.astro` is already ad-server-agnostic, so step two is configuration.

### The platform risk you cannot diversify away

In January 2026 Google acknowledged a "systemic decline in Ad Exchange match
rates and delivery" and publishers reported 50–90% overnight earnings
collapses. Google-sourced demand is a single point of failure.

The mitigation is to treat display ad revenue as a ramp rather than as the
business. The natural next layer for a tool site is a paid ad-free tier: the
ads pay for the free tier, and the subscription removes them. That is exactly
the model the incumbents use.

---

## 4. The policy landscape, in one page

Verified against Google's own documentation.

### What is *not* a policy

There is no "unhelpful content" policy and no standalone "thin content" policy
in Google Search's spam policies. Both terms circulate in SEO blogs and neither
corresponds to a live policy section. What replaced the second is **scaled
content abuse** (March 2024).

The AdSense-side definition of "low-value content" is much narrower than its
reputation suggests: *"Unintelligible content that has no value to the user
(e.g., filler text or 'ipsum lorem' text)."* It does not mean "your tool page is
short."

### What *is* a policy, and what kills tool sites

The inventory-value policies are the ones that bite:

- ads on screens without publisher content, including under-construction screens
- ads on screens with replicated content, including automatically generated
  content without manual review
- more ads or paid promotional material than publisher content, where
  **whitespace does not count**

Plus *Misleading functionality* (a tool that claims a function it does not
provide) and *Thin affiliation* (affiliate pages that replicate content across
a network without adding value — which is the codified rule against "best X
alternatives" clone directories).

### The enforcement environment

2026 saw four spam updates in nine months, plus two core updates. Scaled
content is under active pressure. A hand-built toolbox with unique per-tool
prose is not.

### What did not change

Neither the AdSense policy change log nor the Publisher Standards change log
contains a 2025–2026 change about AI-generated content, tool sites or content
quality. The AdSense side has not moved. The Search side has moved repeatedly.

---

## 5. Sources

**Google, primary**

- AdSense Program policies — <https://support.google.com/adsense/answer/48182>
- Invalid traffic and policy violations — <https://support.google.com/adsense/answer/2660562>
- AdSense policy change log — <https://support.google.com/adsense/answer/9336650>
- Begin-to-render impression counting (effective 17 Feb 2027) — <https://support.google.com/adsense/answer/16896667>
- Ads on screens without publisher content — <https://support.google.com/publisherpolicies/answer/11112688>
- Ads on screens with replicated content — <https://support.google.com/publisherpolicies/answer/11190248>
- More ads than publisher content — <https://support.google.com/publisherpolicies/answer/11169917>
- Publisher policies glossary — <https://support.google.com/publisherpolicies/table/10563033>
- Search spam policies (scaled content abuse, thin affiliation, misleading functionality) — <https://developers.google.com/search/docs/essentials/spam-policies>
- Optimising for generative AI features (15 May 2026) — <https://developers.google.com/search/docs/fundamentals/ai-optimization-guide>
- Ranking and spam update history — <https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMiY/history>

**Case study and industry**

- AdSense "low value content" case study, 65 tools, rejected (14 Jul 2026) — <https://blog.lans.cloud/case-study/seo/adsense-low-value-content>
- Ahrefs, programmatic SEO data and traffic modelling — <https://ahrefs.com/blog/programmatic-seo>
- Pew, AI summaries and click-through, 68,879 searches (22 Jul 2025) — <https://pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results>
- IAB/PwC, Internet Advertising Revenue Report FY2025 — <https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/>

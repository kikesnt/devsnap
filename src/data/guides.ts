export interface GuideSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
  code?: string;
}

export interface GuideDef {
  slug: string;
  title: string;
  description: string;
  h1: string;
  lede: string;
  readingTime: string;
  sections: GuideSection[];
  takeaways: string[];
  relatedTools: string[];
  updated: string;
}

export const guides: GuideDef[] = [
  {
    slug: 'how-to-read-a-json-web-token',
    title: 'How to Read a JSON Web Token (JWT)',
    description:
      'A practical guide to reading a JSON Web Token: what the header and payload contain, why the payload is readable by anyone, and how to check expiry.',
    h1: 'How to read a JSON Web Token without leaking it',
    lede: 'A JWT looks like gibberish until you know it is three base64url segments with a specific meaning each. Once you can read one, a surprising number of authentication problems become obvious.',
    readingTime: '6 min read',
    updated: '2026-10-11',
    sections: [
      {
        heading: 'Three segments, three meanings',
        paragraphs: [
          'A signed JWT is three base64url strings separated by dots: the header, the payload and the signature. The first two are encoded, not encrypted, so anyone holding the token can read them. Only the third segment is a cryptographic artefact.',
          'The header usually names the algorithm and, increasingly, the key identifier. The payload carries the claims: who the token is for, who issued it, when it expires and whatever the application decided to put there. The signature is a hash computed over the first two segments using a key the client does not have.',
        ],
        code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.c2lnbmF0dXJl`,
        list: [
          '`header` — base64url of a JSON object describing the algorithm',
          '`payload` — base64url of a JSON object holding the claims',
          '`signature` — base64url of the signature over the first two segments',
        ],
      },
      {
        heading: 'Why the payload is not private',
        paragraphs: [
          'Base64 is an encoding, not encryption. The payload is decoded by any client that receives the token, and by every logging layer, proxy and analytics script that sees the Authorization header along the way.',
          'This has a direct consequence for what you put in a token. A claim that a server treats as authoritative but that the client can also forge is a broken control. If a decision depends on a claim, that claim has to be covered by the signature and verified on every request.',
        ],
        list: [
          'Safe inside a signed token: identifiers, roles, scopes, issued-at, expiry',
          'Never inside a token: secrets, personal data you do not have a legal basis to hold',
          'Never trusted without verification: anything, because the client can craft its own token',
        ],
      },
      {
        heading: 'The claims that decide whether a token is usable',
        paragraphs: [
          'Three registered claims cause most of the practical failures. `exp` is the expiry, `nbf` is the earliest valid moment and `aud` is the audience — which service the token was minted for.',
          'A token that is correctly signed for one service and presented to another is a real and common bug. Checking the audience is what stops a token issued for the internal API from being replayed against the public one.',
        ],
        list: [
          '`iss` — who issued the token',
          '`sub` — the subject, usually a user id',
          '`aud` — who the token is for; a string or an array',
          '`exp` — expiry, as a Unix timestamp in seconds',
          '`iat` — when it was issued',
          '`jti` — a unique id, used for revocation lists',
        ],
      },
      {
        heading: 'What to check when a request is rejected',
        paragraphs: [
          'When an API returns 401, the token is usually missing, malformed, expired or signed by the wrong key. When it returns 403, the token was accepted and the operation was not permitted. The distinction matters: one is a credential problem and the other is an authorisation problem.',
          'Decode the token and look at the expiry first, then the audience, then the issuer. A token that expired two minutes ago explains most of these incidents in one glance.',
        ],
      },
    ],
    takeaways: [
      'The header and payload are readable by anyone holding the token, so treat them as public.',
      'A signed token is not proof until the signature has been verified against the issuer key.',
      'Check `exp`, `aud` and `iss` before looking anywhere else when a request is rejected.',
      'Never paste a live token into a web page you do not control, including this one.',
    ],
    relatedTools: ['jwt-decoder', 'base64-encoder', 'timestamp-converter', 'hash-generator'],
  },

  {
    slug: 'regex-patterns-worth-knowing',
    title: 'Twelve Regular Expressions Worth Knowing by Heart',
    description:
      'Twelve regular expressions for the tasks that come up in every project: email, URL, dates, UUIDs, semantic versions and log levels, with the caveats.',
    h1: 'Twelve regular expressions you will end up using every week',
    lede: 'Most regexes in a codebase are the same handful of patterns written badly. Here are the ones worth having ready, with the parts that usually cause the bug.',
    readingTime: '8 min read',
    updated: '2026-10-13',
    sections: [
      {
        heading: 'Email: only as good as your validation layer',
        paragraphs: [
          'No regular expression validates an email address properly, because the rules for the local part are defined by RFC 5321 and permit almost anything. A pattern that rejects a valid address costs you a sign-up; a pattern that accepts an invalid one costs you a bounce.',
          'What a pattern is good for is finding obvious mistakes in a form before submission, and extracting a candidate address out of a blob of text. Anything beyond that belongs in a verification email.',
        ],
        code: `^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$`,
      },
      {
        heading: 'URL: prefer the URL parser',
        paragraphs: [
          'A URL is specified in RFC 3986 and the grammar has more corners than any pattern covers, including IPv6 hosts, userinfo, percent-encoding and empty path segments. The `URL` constructor in every modern runtime implements it correctly.',
          'Reach for a regular expression only when you are extracting URLs out of free text, where you are pattern-matching a shape rather than validating a URL. For validation, always use the parser.',
        ],
        code: `const parsed = new URL(input);`,
      },
      {
        heading: 'Dates: do not match dates with a regex',
        paragraphs: [
          'A pattern can check the shape of a date, not whether it exists. The pattern `[0-9]{4}-[0-9]{2}-[0-9]{2}` happily accepts 2026-02-31, and no amount of regex can fix that without becoming a calendar.',
          'Match the shape if you need to find candidate dates in text, then hand the value to a date parser and check that it round-trips.',
        ],
        code: `const d = new Date(value);\nconst valid = !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;`,
      },
      {
        heading: 'Named groups make the code readable',
        paragraphs: [
          'A pattern with six numbered groups is unreadable in a stack trace and impossible to maintain. Named groups give the match a vocabulary, and the same name works in the replacement string.',
        ],
        code: `const re = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\nconst { year, month, day } = re.exec(value).groups;`,
      },
      {
        heading: 'The catastrophic backtracking trap',
        paragraphs: [
          'A pattern with two quantifiers nested inside each other can require exponential time on an input that does not match. The classic shape is a repeated group containing a repeated character, such as `(a+)+b`.',
          'Against a long string of a characters with no trailing b, the engine tries every possible way to split the input and never finishes. If a validation endpoint can receive a 10 KB body, that is a denial of service with a valid-looking request.',
        ],
        list: [
          'Avoid nesting quantifiers: `(a+)+` is the shape to watch for.',
          'Prefer a possessive-style rewrite: `a+b` or an atomic group where the engine supports it.',
          'Bound the input length before matching, not after.',
          'If a pattern hangs in the tester, nested quantifiers are the first thing to check.',
        ],
      },
    ],
    takeaways: [
      'Validate URLs with `new URL()`, and dates with a date parser, not a pattern.',
      'Use named capture groups so the code reads like the intent.',
      'Never nest quantifiers, and bound the input length before matching.',
      'A regex that matches a shape is not a validator.',
    ],
    relatedTools: ['regex-tester', 'string-replace', 'diff-checker', 'json-formatter'],
  },

  {
    slug: 'cron-expressions-cheat-sheet',
    title: 'Cron Expressions: A Cheat Sheet and Its Traps',
    description:
      'The five fields of a Unix cron expression, the day-of-month and day-of-week rule that catches everybody, and the equivalents for AWS, Quartz and GitHub.',
    h1: 'Cron expressions, and the two rules that catch everybody',
    lede: 'Five fields of stars and numbers look like a puzzle. Once you know that day-of-month and day-of-week are combined with OR rather than AND, and that the expression is evaluated in the scheduler timezone, most cron confusion disappears.',
    readingTime: '7 min read',
    updated: '2026-10-09',
    sections: [
      {
        heading: 'The five fields',
        paragraphs: [
          'A standard Unix cron expression is five whitespace-separated fields, read left to right: minute, hour, day of month, month and day of week. Each field accepts a list of alternatives separated by commas, ranges with a hyphen, steps with a slash and an asterisk meaning every value.',
        ],
        list: [
          '`minute` — 0 to 59',
          '`hour` — 0 to 23',
          '`day of month` — 1 to 31',
          '`month` — 1 to 12, or JAN to DEC',
          '`day of week` — 0 to 6, or SUN to SAT, with 7 also meaning Sunday',
        ],
      },
      {
        heading: 'The OR rule',
        paragraphs: [
          'When you restrict both the day-of-month field and the day-of-week field, standard cron fires the job whenever either of them matches. It does not wait for both.',
          'So `0 0 13 * 5` means "the 13th of the month, and every Friday", not "the 13th of the month when it is a Friday". If you want the intersection, you need a scheduler that supports it, or you express the job in a different way.',
        ],
        code: `# Every day at 03:30\n30 3 * * *\n\n# Every Monday at 09:00\n0 9 * * 1\n\n# Every 15 minutes\n*/15 * * * *\n\n# Every 15 minutes between 09:00 and 18:00 on weekdays\n*/15 9-18 * * 1-5`,
      },
      {
        heading: 'The timezone rule',
        paragraphs: [
          'A cron expression carries no timezone. It is evaluated in whatever timezone the scheduler runs in, which on a Linux server is usually UTC and in a container is whatever the image says.',
          'This is the single most common cause of a job that "runs at the wrong time". The cron entry is not wrong; the assumption about the timezone is. Setting the timezone explicitly in the scheduler configuration, or in the crontab itself with `CRON_TZ`, removes the ambiguity.',
        ],
      },
      {
        heading: 'The same schedule in other schedulers',
        paragraphs: [
          'Quartz has seven fields, adding seconds and a year, and uses a question mark in place of a field that does not apply. AWS EventBridge and GitHub Actions each have their own dialect, and GitHub Actions runs on UTC by default.',
        ],
        list: [
          'Unix cron: `0 9 * * 1`',
          'Quartz: `0 0 9 ? * MON`',
          'AWS EventBridge: `cron(0 9 ? * MON-FRI *)`',
          'GitHub Actions: `cron: "0 9 * * 1"` in UTC',
        ],
      },
    ],
    takeaways: [
      'Day-of-month and day-of-week are combined with OR, not AND.',
      'The expression is evaluated in the scheduler timezone, which is often UTC.',
      'Quartz has seven fields, AWS and GitHub have their own dialects.',
      'A schedule of `*/5 * * * *` is 288 executions a day — check that you meant it.',
    ],
    relatedTools: ['cron-builder', 'timestamp-converter', 'date-difference', 'regex-tester'],
  },

  {
    slug: 'utc-versus-local-time',
    title: 'UTC vs Local Time: The Bugs It Causes',
    description:
      'Why storing local time is a bug waiting to happen, how daylight saving breaks naive date arithmetic, and the formats you should use.',
    h1: 'The difference between storing a moment and storing a wall clock',
    lede: 'Most timezone bugs come from one mistake: storing a local wall-clock time and calling it a timestamp. Once a value is a moment in time, everything else is a display decision and stops being a source of corruption.',
    readingTime: '6 min read',
    updated: '2026-10-07',
    sections: [
      {
        heading: 'Store the moment, format the display',
        paragraphs: [
          'A timestamp is a point on the universal timeline. A local time is a wall clock reading in a particular place, and the same reading means different moments depending on when you look and where you are.',
          'Store the moment. Convert to the local time only when rendering it for a person, and convert back using the timezone the person is actually in, not the one the server happens to run in.',
        ],
        code: `// Store this: an absolute moment\n2026-01-14T09:30:00.000Z\n\n// Not this: a wall clock with no zone\n2026-01-14 09:30:00`,
      },
      {
        heading: 'Daylight saving makes days the wrong length',
        paragraphs: [
          'On a spring-forward date, a day is 23 hours long. On an autumn day it is 25. Any code that assumes 24 hours per day is wrong twice a year, and usually wrong in a way that only shows up for a few weeks at a time.',
          'The fix is to compute durations from real timestamps rather than from day counts. If you subtract two dates in milliseconds, you get the truth, including the transition.',
        ],
        list: [
          'A day is not always 86,400,000 milliseconds.',
          'A month is not always 30 days, and not always 31.',
          '"Add one month" from 31 January gives 28 or 29 February in most implementations.',
        ],
      },
      {
        heading: 'The three formats worth knowing',
        paragraphs: [
          'ISO 8601 is what you store and what you send. RFC 3339 is the same thing with a slightly tighter grammar and it is the profile used by JSON. HTTP date is the format the web itself uses for dates in headers.',
        ],
        list: [
          'ISO 8601 — `2026-01-14T09:30:00.000Z`, for storage and transport',
          'RFC 3339 — `2026-01-14T09:30:00Z`, for JSON payloads',
          'HTTP date — `Wed, 14 Jan 2026 09:30:00 GMT`, for headers',
        ],
      },
      {
        heading: 'The Unix epoch and the 2038 boundary',
        paragraphs: [
          'A Unix timestamp counts seconds since 1 January 1970 UTC. It ignores leap seconds, so it drifts slightly from true UTC, which matters for legally defined time and not for anything else.',
          'If you store timestamps as a 32-bit signed integer, the year 2038 is the end of the world. Use a 64-bit field, and prefer storing an ISO string or a native date type if your database offers one.',
        ],
      },
    ],
    takeaways: [
      'Store an absolute moment; convert to local time only for display.',
      'A day is 23 or 25 hours twice a year — compute durations from timestamps.',
      'Use ISO 8601 in storage, RFC 3339 in JSON, HTTP date in headers.',
      'Never store a 32-bit timestamp if the data will outlive 2038.',
    ],
    relatedTools: ['timestamp-converter', 'date-difference', 'cron-builder', 'json-formatter'],
  },

  {
    slug: 'wcag-contrast-for-developers',
    title: 'WCAG Contrast Ratios for Developers',
    description:
      'What the contrast requirements actually are, which ones apply to your UI, and how to fix a failing pair without redesigning the brand palette.',
    h1: 'What the contrast requirements are, and how to fix a failing pair',
    lede: 'Contrast failures are the most common accessibility defect in a production interface and among the easiest to fix. The part that trips people up is that the requirement is not a single number.',
    readingTime: '5 min read',
    updated: '2026-10-08',
    sections: [
      {
        heading: 'There is more than one requirement',
        paragraphs: [
          'WCAG 2.2 has two contrast criteria that matter for a user interface. 1.4.3 sets a minimum for text against its background, and 1.4.11 covers the visual information needed to identify a control, such as an input border or a focus ring.',
          'The text requirement has two levels with two thresholds each, because large text needs less contrast than body copy. Knowing which threshold applies to which piece of your interface is most of the work.',
        ],
        list: [
          'AA, normal text — 4.5:1 (body copy under 18pt)',
          'AA, large text — 3:1 (18pt bold or 24pt regular)',
          'AAA, normal text — 7:1',
          'AAA, large text — 4.5:1',
          'Non-text contrast, 1.4.11 — 3:1 for borders, icons and focus rings',
        ],
      },
      {
        heading: 'How the ratio is calculated',
        paragraphs: [
          'Relative luminance is computed per channel after linearising the sRGB values, then the ratio is the lighter luminance plus 0.05 divided by the darker luminance plus 0.05. That offset is why black on white is exactly 21:1 and white on white is exactly 1:1.',
          'The important consequence is that the calculation depends on the actual rendered colours. A translucent element, a gradient or text over an image does not have one fixed ratio, which is why the WCAG guidance asks for a solid or sufficiently opaque overlay behind text over imagery.',
        ],
      },
      {
        heading: 'Fixing a failing pair without a redesign',
        paragraphs: [
          'Saturated brand colours tend to land around 3:1 against white, which passes for large text and fails for body copy. The usual fix is to derive a darker tint of the same hue for text and keep the original colour for large elements, icons and accents.',
          'The other common cause is a link colour. Links are usually the first thing to fail because they inherit the brand colour, and the person who chose that colour is rarely looking at it against a light background.',
        ],
        list: [
          'Keep the brand colour for large text and non-text accents.',
          'Derive a darker variant of the same hue for body copy and links.',
          'Check the disabled, hover and focus states too — they often fail even when the default passes.',
          'A text shadow does not count towards the ratio.',
        ],
      },
      {
        heading: 'Test the states, not just the default',
        paragraphs: [
          'A design system that passes in its default state can fail in four others. Placeholder text is the usual offender, since it is usually lighter than the value it replaces, and a disabled control is often deliberately low-contrast.',
          'Disabled elements are exempt from the requirement, since disabled controls are not required to be perceivable. Placeholder text is not exempt, because it carries information the user needs.',
        ],
      },
    ],
    takeaways: [
      'The requirement depends on the size and role of the element, not on a single threshold.',
      '1.4.11 requires 3:1 for input borders, icons and focus rings.',
      'Derive a darker tint of the brand hue rather than redesigning the palette.',
      'Test the hover, focus, placeholder and error states as well as the default.',
    ],
    relatedTools: ['color-contrast-checker', 'qr-generator', 'markdown-preview', 'json-formatter'],
  },

  {
    slug: 'environment-variables-safely',
    title: 'Handling Environment Variables Safely',
    description:
      'How to keep credentials out of version control and out of your shell history, and how to debug a variable that is not being picked up.',
    h1: 'Keeping credentials out of git, logs and shell history',
    lede: 'Environment files are dense with credentials, hard to review because the values are visible, and easy to commit by accident. A few conventions remove most of the risk.',
    readingTime: '6 min read',
    updated: '2026-09-30',
    sections: [
      {
        heading: 'Commit the keys, not the values',
        paragraphs: [
          'The pattern that works everywhere is a committed `.env.example` containing every key with an empty or placeholder value, and a real `.env` that is listed in `.gitignore`. A developer copies the example, fills in the values, and the file is never staged.',
          'The example file doubles as documentation. A new service cannot be configured correctly without knowing which variables it needs, and a list of names is exactly that.',
        ],
        code: `# .env.example — committed\nDATABASE_URL=\nAPI_TOKEN=\nSESSION_SECRET=\nLOG_LEVEL=info`,
      },
      {
        heading: 'The .gitignore entry has to be early',
        paragraphs: [
          'A `.gitignore` rule only affects files that are not already tracked. If `.env` was committed at some point, adding it to `.gitignore` afterwards changes nothing, and the secrets stay in the history.',
          'If that has already happened, the credential is compromised. Rotate it in the provider, then remove it from the history with a filter tool and force-push. Rotating first matters, because rewriting history does not un-push the old commits to anyone who already cloned the repository.',
        ],
        list: [
          'Check with `git ls-files | grep env` whether the file is tracked.',
          'Rotate every exposed credential before touching the history.',
          'Add the file to `.gitignore` before the first commit, not after.',
          'Use a secret scanner in CI so the second incident is caught automatically.',
        ],
      },
      {
        heading: 'A shell history is a log file',
        paragraphs: [
          'Typing `export API_TOKEN=sk_live_…` puts the secret into your shell history, and therefore into every backup of it. Reading a token from a file or from a password manager avoids that entirely.',
        ],
        list: [
          '`set -a; . ./.env; set +a` loads a file without echoing the values.',
          'A password manager or a secret manager keeps the value out of the shell entirely.',
          'Never pass a secret as a command-line argument: it is visible in the process list.',
          'CI should inject secrets from the platform, not from a file in the repository.',
        ],
      },
      {
        heading: 'Debugging a variable that is not set',
        paragraphs: [
          'A duplicate key in a .env file is a silent override, because most parsers apply the value defined last. A value with a stray quote character is a second common cause, as is a value containing a space that nobody quoted.',
          'A quick check of the parsed key list, with the values masked, shows all three immediately. That is why masking by default is more useful than showing the raw file: you can see the structure without exposing the credentials.',
        ],
      },
    ],
    takeaways: [
      'Commit a `.env.example` with the keys; keep the real file out of git.',
      'Adding a file to `.gitignore` after it was committed does nothing — rotate the credential.',
      'Secrets on a command line are visible in the process list.',
      'A duplicate key silently overrides the earlier value.',
    ],
    relatedTools: ['dotenv-editor', 'json-formatter', 'hash-generator', 'jwt-decoder'],
  },

  {
    slug: 'utm-parameter-naming',
    title: 'A Naming Convention for UTM Parameters',
    description:
      'How to pick UTM source, medium and campaign values that produce a readable report, and why the casing decides whether a campaign is one row or five.',
    h1: 'Pick one naming convention, then never deviate from it',
    lede: 'Campaign tags are made in a hurry, once per launch, and analysed for years. The only thing that stands between a clean report and a fragmented one is consistency.',
    readingTime: '5 min read',
    updated: '2026-10-03',
    sections: [
      {
        heading: 'Source, medium and campaign are different questions',
        paragraphs: [
          'The three parameters answer three separate questions, and the most common mistake is putting the same answer in two of them. Source is the specific origin, medium is the channel type and campaign is the initiative.',
          'If source and medium are both `email`, your report can tell you that email produced traffic but not which medium, and you lose the ability to compare email against paid search at all.',
        ],
        list: [
          '`utm_source` — newsletter, linkedin, google, poster',
          '`utm_medium` — email, social, cpc, referral, qr, print',
          '`utm_campaign` — spring_launch, black_friday, onboarding_2026',
          '`utm_content` — hero_button, variant_b (to separate creatives)',
          '`utm_term` — paid search keywords only',
        ],
      },
      {
        heading: 'Casing is not cosmetic',
        paragraphs: [
          'Analytics tools are inconsistent about how they treat parameter names, but a mixed-case parameter almost always ends up as a separate row from the lowercase version of the same parameter. One launch with `utm_Source` in one template and `utm_source` in another produces two campaigns.',
          'The convention that works is lowercase everywhere, with underscores between words, and no spaces in any value. Enforce it with a link builder rather than with a convention people have to remember.',
        ],
        code: `https://example.com/offer?utm_source=newsletter&utm_medium=email&utm_campaign=spring_launch`,
      },
      {
        heading: 'A campaign name that means something in six months',
        paragraphs: [
          'The person reading this report in a year will not remember what `launch2` referred to. A name that includes the period and the subject, such as `spring_launch_2026`, stays interpretable long after the launch call has faded.',
          'The same applies to the creative level. If a campaign has two ads, give each a distinct `utm_content` value, otherwise the test reports a single combined number and tells you nothing.',
        ],
        list: [
          'Include the year in long-running campaign names.',
          'Use a separate `utm_content` per creative in an A/B test.',
          'Do not put personal data in a parameter value — URLs end up in reports.',
          'Do not tag internal links; only tag links that arrive from outside.',
        ],
      },
      {
        heading: 'Where the parameters get lost',
        paragraphs: [
          'Some advertising platforms and social networks strip unknown query parameters during a redirect, so a tagged link can arrive untagged. Testing with a real link checker is the only reliable way to know, and it is worth doing before a campaign rather than after the report comes back empty.',
        ],
      },
    ],
    takeaways: [
      'Source, medium and campaign answer three different questions.',
      'Lowercase parameter names, always, with underscores between words.',
      'One `utm_content` per creative, or the test tells you nothing.',
      'Some platforms strip parameters on redirect — verify before you launch.',
    ],
    relatedTools: ['utm-builder', 'qr-generator', 'url-encoder', 'json-formatter'],
  },

  {
    slug: 'what-a-good-diff-looks-like',
    title: 'What a Useful Diff Looks Like',
    description:
      'Why line diffs are too coarse, when word-level highlighting helps, and how structural comparison changes the way you read a payload that changed shape.',
    h1: 'Line diffs are too coarse, and here is what to use instead',
    lede: 'A line diff marks an entire line as changed when a single character differs, and that is why reviewing a diff of a JSON payload is so much harder than it needs to be. Three levels of granularity fix it.',
    readingTime: '6 min read',
    updated: '2026-10-04',
    sections: [
      {
        heading: 'Three levels of comparison',
        paragraphs: [
          'Character-level comparison is the most precise and the least useful for review, because it loses the structure of the file. Line-level comparison is the useful default. Structural comparison goes further, ignoring the layout entirely and comparing the data.',
          'The right choice depends on the question. Are these two text files the same? Use lines. Does this payload have the same data? Use structure.',
        ],
        list: [
          'Character — for a single line, a token or a string value',
          'Line — for files, code and configuration',
          'Structural — for JSON, where key order carries no meaning',
        ],
      },
      {
        heading: 'Word-level narrowing',
        paragraphs: [
          'When a line is marked as changed, most of the line has not changed. A word-level pass narrows the highlight to the words that actually differ, which turns a wall of red into two highlighted words.',
          'This matters most for long lines: a minified JSON file on one line produces a single unreadable changed line, and a configuration file with a long value is unreadable for the same reason.',
        ],
      },
      {
        heading: 'Structure beats text for data',
        paragraphs: [
          'Two JSON payloads with the same data in a different order are different strings and the same document. A text diff will report every line as changed. A structural comparison reports nothing, which is the correct answer.',
          'Structural comparison also catches changes a text diff hides. A number that becomes a quoted string, a field that changes type, a key that quietly appears in one branch and not another — all of these are invisible in a line diff and obvious in a structural one.',
        ],
        list: [
          'Key order is ignored for objects; array order is significant.',
          'A type change from `2` to `"2"` is reported separately from a value change.',
          'The path in the difference identifies exactly where the change lives.',
        ],
      },
      {
        heading: 'A diff you can act on',
        paragraphs: [
          'The output of a diff is only useful if it can be acted on. That means each difference should carry a path, a type and the two values involved, and the whole list should be small enough to read.',
          'When a diff produces hundreds of differences, the change was too broad to review as a diff. Narrow the scope, or split the change, rather than reading through the noise.',
        ],
      },
    ],
    takeaways: [
      'Use line diffs for files, structural comparison for data.',
      'Word-level highlighting makes a changed line readable.',
      'A type change from `2` to `"2"` is invisible in a text diff and matters.',
      'Hundreds of differences means the change was too broad to review.',
    ],
    relatedTools: ['diff-checker', 'json-diff', 'json-formatter', 'snapshot'],
  },
];

export { guidesExtra } from './guides2';

import { guidesExtra } from './guides2';

export const allGuides: GuideDef[] = [...guides, ...guidesExtra];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

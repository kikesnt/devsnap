import type { ToolDef } from '../types';

export const workflowTools: ToolDef[] = [
  {
    slug: 'dotenv-editor',
    name: '.env Editor & Parser',
    glyph: '.env',
    icon: 'keyFile',
    category: 'Developer Utilities',
    title: '.env Editor — Parse and Mask Environment Files',
    description:
      'Parse a .env file, mask secret values, spot duplicates and invalid keys, and copy a shell-ready export block. Everything happens in your browser.',
    h1: 'Read a .env file without exposing the secrets in it',
    lede: 'Environment files are dense with credentials, and they are notoriously hard to review because the values are visible. This parser shows you the structure, masks the sensitive values and flags the mistakes that break a deploy.',
    keywords: [
      'dotenv parser',
      'env file viewer',
      'parse .env file',
      'environment variables viewer',
      'dotenv online',
      'env file formatter',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'cases', 'notes', 'related'],
    facts: [
      { label: 'Masking', value: 'Automatic' },
      { label: 'Validation', value: 'Keys, duplicates, quotes' },
      { label: 'Secrets', value: 'Never sent' },
    ],
    steps: [
      {
        title: 'Paste the file',
        body: 'The contents of a .env file, a docker-compose environment block or a CI variable list all parse the same way.',
      },
      {
        title: 'Review the structure',
        body: 'Each variable is listed with its name, a masked value and a flag if the name looks like a secret. Duplicate keys and malformed lines are called out.',
      },
      {
        title: 'Export it',
        body: 'Copy a shell-ready export block, or a JSON object, for use in a script or a test fixture.',
      },
    ],
    cases: [
      {
        title: 'Reviewing a .env before committing it',
        body: 'The key list makes it obvious at a glance that a production secret is one line away from being added to version control.',
      },
      {
        title: 'Copying variables into a Docker command',
        body: 'A ready-made set of --env flags or an export block saves hand-typing each pair and getting the quoting wrong.',
      },
      {
        title: 'Debugging a variable that is not set',
        body: 'A duplicated key where the second definition silently wins, or a value with a stray quote character, is exactly the kind of problem that is invisible in a raw file.',
      },
    ],
    notes: [
      {
        title: 'The last definition wins',
        body: 'Most .env parsers apply the value defined last when a key appears twice. A duplicate is therefore not a harmless copy-paste, it is a silent override, and the parser flags it for that reason.',
      },
    ],
    why: {
      title: 'A .env file is a secret with newlines',
      body: 'Pasting one into a converter means handing your database password to a stranger. The masking here means you can share a screenshot of the structure without sharing the credentials.',
      points: [
        'Values that look like secrets are masked by default.',
        'Duplicate keys, empty values and malformed lines are reported.',
        'Export as shell commands or as JSON.',
        'The file is never transmitted.',
      ],
    },
    faq: [
      {
        q: 'Which keys are treated as secrets?',
        a: 'Names containing common credential words such as key, secret, token, password or pass are masked. You can toggle the masking for the whole file if you want to see the real values.',
      },
      {
        q: 'What is the difference between quotes and no quotes in a .env file?',
        a: 'A quoted value keeps its content literally, including spaces and hashes, and the quotes are stripped. An unquoted value is trimmed and a # starts a comment. Both forms are parsed here and the difference is shown.',
      },
      {
        q: 'Does it support multiline values?',
        a: 'Yes. A value wrapped in triple quotes is read as a single value with its newlines preserved, which is how private keys are usually stored.',
      },
      {
        q: 'Should I commit a .env file to git?',
        a: 'No. Keep it in .gitignore, commit a .env.example with the keys and no values, and load the real values from your platform’s secret store.',
      },
      {
        q: 'How are comments and inline comments handled?',
        a: 'A line starting with # is a comment. An inline comment is only stripped from an unquoted value, because in a quoted value a # is an ordinary character.',
      },
      {
        q: 'Can I use the output as a GitHub Actions env block?',
        a: 'Yes. The export block is a valid shell snippet and can be pasted into a workflow step or a run command with the appropriate permissions.',
      },
    ],
    related: ['json-formatter', 'utm-builder', 'cron-builder', 'json-schema-generator'],
    updated: '2026-09-30',
  },

  {
    slug: 'utm-builder',
    name: 'UTM Campaign Builder',
    glyph: 'UTM',
    icon: 'tagLink',
    category: 'Developer Utilities',
    title: 'UTM Builder — Generate Campaign Tracking URLs',
    description:
      'Build campaign URLs with correct UTM parameters, validate them and check whether a link is already tagged, with per-channel presets.',
    h1: 'Build campaign URLs that analytics will actually attribute',
    lede: 'A UTM parameter with a typo is invisible in the link and fatal in the report. This builder produces correctly named parameters, warns about the usual mistakes, and shows you exactly what the final URL looks like.',
    keywords: [
      'utm builder',
      'utm parameters',
      'campaign url generator',
      'google analytics utm builder',
      'utm link generator',
      'tracking url builder',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'related'],
    facts: [
      { label: 'Parameters', value: 'source, medium, campaign' },
      { label: 'Presets', value: 'Per channel' },
      { label: 'Validation', value: 'Casing and typos' },
    ],
    steps: [
      {
        title: 'Enter the destination URL',
        body: 'The page the link should point to. Existing query parameters are preserved and the new ones are appended.',
      },
      {
        title: 'Fill in the campaign fields',
        body: 'A source such as newsletter, a medium such as email and a campaign name. Preset buttons fill in sensible values for each channel.',
      },
      {
        title: 'Copy the tagged URL',
        body: 'The builder checks the casing, warns about spaces and reserved characters, and gives you the final URL ready to paste.',
      },
    ],
    examples: [
      {
        caption: 'Recommended parameter casing',
        headers: ['Parameter', 'Value', 'Notes'],
        rows: [
          ['`utm_source`', '`newsletter`', 'Where the traffic comes from'],
          ['`utm_medium`', '`email`', 'The channel type, not the tool'],
          ['`utm_campaign`', '`spring_launch`', 'The specific campaign'],
          ['`utm_content`', '`hero_button`', 'Which creative, when there are several'],
          ['`utm_term`', '`running+shoes`', 'Paid search keywords only'],
        ],
      },
    ],
    cases: [
      {
        title: 'Tagging links in an email',
        body: 'A newsletter link with source, medium and campaign parameters is what makes the traffic attributable to the email rather than to a direct visit.',
      },
      {
        title: 'Separating creatives in an ad test',
        body: 'Two ads to the same landing page need different utm_content values, or the test reports a single combined result and tells you nothing.',
      },
      {
        title: 'Auditing existing links',
        body: 'Paste a tagged URL to see whether the parameters are consistently named. Inconsistent casing across a campaign splits the data into several rows in your report.',
      },
    ],
    notes: [
      {
        title: 'Parameter names are case-sensitive in practice',
        body: 'The Google Analytics documentation uses lowercase, and many teams end up with utm_Source in one place and utm_source in another, which produces two rows in the report. Pick one and never deviate.',
      },
      {
        title: 'Do not put personal data in a URL',
        body: 'A UTM value ends up in the referring page, in the browser history and often in a shared report. An email address in utm_content is a privacy problem even though the page itself collects no data.',
      },
    ],
    why: {
      title: 'Attribution is a setup decision made once',
      body: 'Campaign tags that are inconsistent on day one stay inconsistent forever, and the resulting report is unreadable. A builder that enforces one naming convention and validates each URL is a small time investment that protects every report you will ever run.',
      points: [
        'Consistent lowercase parameter names.',
        'Presets for email, social, paid search, QR codes and print.',
        'Warnings for spaces, uppercase and empty values.',
        'Existing query parameters are preserved.',
      ],
    },
    faq: [
      {
        q: 'What is the difference between utm_source and utm_medium?',
        a: 'Source is the specific origin, such as newsletter or linkedin. Medium is the channel type, such as email or social. Using the same value for both, such as source=email and medium=email, is the most common mistake and it flattens your channel reporting.',
      },
      {
        q: 'Do UTM parameters work on every platform?',
        a: 'Most advertising and social platforms ignore unknown query parameters and pass them through, but some strip them on redirect. Test your specific destination with a link checker before a campaign goes live.',
      },
      {
        q: 'Should I use utm_term on non-paid links?',
        a: 'No. It is designed for paid search keywords. Adding it to every link adds noise to your reports without adding information.',
      },
      {
        q: 'How do I keep the URL readable?',
        a: 'Use short, lowercase, hyphen-separated values, and keep campaign names consistent across a launch. If a value needs a space, use a plus sign or a hyphen rather than %20.',
      },
      {
        q: 'Can I track a QR code?',
        a: 'Yes, which is why the QR preset exists. A dedicated QR campaign parameter is what lets you tell a poster scan apart from a typed visit, and the QR tool in this toolbox can encode the tagged URL directly.',
      },
      {
        q: 'Does the builder send my URL anywhere?',
        a: 'No. The URL is assembled in the page and never transmitted, which matters when the destination contains a token or an internal hostname.',
      },
    ],
    related: ['qr-generator', 'url-encoder', 'dotenv-editor', 'json-formatter'],
    updated: '2026-10-03',
  },

  {
    slug: 'http-status-codes',
    name: 'HTTP Status Code Reference',
    glyph: '404',
    icon: 'server',
    category: 'Developer Utilities',
    title: 'HTTP Status Codes — Full Reference with Meanings',
    description:
      'A complete reference of HTTP status codes: what each one means, when to use it, and how browsers, caches and CDNs react to it. Searchable and filterable.',
    h1: 'The HTTP status codes, and when each one is the right answer',
    lede: 'A status code is a contract with every client that will ever talk to your API, and choosing the wrong one causes the bug to be blamed on the client. This reference covers the full set with the practical consequence of each code.',
    keywords: [
      'http status codes',
      'http status code list',
      'status code reference',
      '4xx and 5xx codes',
      'http response codes meaning',
    ],
    layout: ['facts', 'tool', 'faq', 'examples', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Codes', value: 'Full registry' },
      { label: 'Categories', value: '1xx to 5xx' },
      { label: 'Search', value: 'Filterable' },
    ],
    steps: [
      {
        title: 'Search or filter',
        body: 'Type a keyword such as retry, cache, redirect or jwt to narrow the list, or filter by class.',
      },
      {
        title: 'Read the entry',
        body: 'Each code lists what it means, when to send it, and what the client will do with it.',
      },
      {
        title: 'Apply it',
        body: 'The distinction between 400, 401, 403 and 422 is where most API bugs live, and the reference spells out which one to use.',
      },
    ],
    examples: [
      {
        caption: 'The distinctions that cause the most bugs',
        headers: ['Code', 'Means', 'Not this'],
        rows: [
          ['`400`', 'The request is malformed and cannot be parsed', 'Not a validation failure — use 422'],
          ['`401`', 'No valid credentials were presented', 'Not "you lack permission"'],
          ['`403`', 'Authenticated, but not allowed to do this', 'Not a substitute for 401'],
          ['`409`', 'The request conflicts with the current state', 'Not a generic failure'],
          ['`422`', 'Parsed fine, but the content failed validation', 'Not a malformed body'],
          ['`429`', 'Rate limit exceeded', 'Always send Retry-After'],
        ],
      },
    ],
    cases: [
      {
        title: 'Debugging an API that returns the wrong code',
        body: 'A 400 where the client expected a 422 sends developers hunting for a syntax error that is not there. The distinction table settles it.',
      },
      {
        title: 'Designing an error contract',
        body: 'A consistent mapping from your domain errors to status codes is what lets clients handle failures programmatically instead of parsing message strings.',
      },
      {
        title: 'Configuring a CDN or a load balancer',
        body: 'Several edge behaviours, including caching and retry, are triggered by specific status codes, and picking the wrong one has a measurable cost.',
      },
    ],
    notes: [
      {
        title: 'Status codes are class-specific in their semantics',
        body: 'A 4xx means the client should change something before retrying. A 5xx means the server failed and the same request may succeed later. That distinction is what tells a client whether to retry, and it is why a bug in a server that returns 400 for everything causes infinite client retry loops.',
      },
    ],
    why: {
      title: 'The code is part of the API',
      body: 'Clients branch on the status code, not on the body. A technically correct response with the wrong code is a broken API, and the cost of that mistake shows up in every client that was written against your documentation.',
      points: [
        'Every code in the IANA registry, grouped by class.',
        'Search by keyword to find the code you are looking for.',
        'The practical consequence of each code, not just its name.',
        'A focus on the distinctions that break real clients.',
      ],
    },
    faq: [
      {
        q: 'Should I use 400 or 422 for a validation error?',
        a: 'Use 422 when the body parsed correctly and the content is invalid, and 400 when the body could not be parsed at all. RFC 4918 introduced 422 for exactly this distinction. The important part is that you pick one and document it, because clients branch on the code.',
      },
      {
        q: 'What is the difference between 401 and 403?',
        a: '401 means the client failed to prove who it is, so a WWW-Authenticate header is required. 403 means the client proved who it is and is still not allowed. Returning 403 where the client expects 401 breaks standard HTTP auth flows.',
      },
      {
        q: 'Which status code is right for rate limiting?',
        a: '429, with a Retry-After header telling the client when to come back. It is the clearest signal you can send, and it lets well-behaved clients back off instead of hammering you.',
      },
      {
        q: 'Should errors ever return 200?',
        a: 'No. A 200 with an error field in the body breaks every HTTP client library, every monitoring system and every cache. The status code is the part of the response that tooling actually reads.',
      },
      {
        q: 'What is the difference between 404 and 410?',
        a: '404 says the resource is not there right now. 410 says it was there and is deliberately gone, so clients and search engines can drop it. Use 410 when you are certain a URL will never come back.',
      },
      {
        q: 'Are the 4xx codes safe to cache?',
        a: 'Some of them are explicitly cacheable, such as 404 and 410, which is why a 404 page can be served from a CDN edge. Others such as 429 should carry a Cache-Control header that prevents it.',
      },
    ],
    related: ['json-formatter', 'regex-tester', 'cron-builder', 'json-diff'],
    updated: '2026-09-27',
  },

  {
    slug: 'markdown-preview',
    name: 'Markdown Live Preview',
    glyph: 'MD',
    icon: 'markdown',
    category: 'Developer Utilities',
    title: 'Markdown Live Preview — Render Markdown Instantly',
    description:
      'Write Markdown on the left and see the rendered result on the right, with GitHub-flavoured tables, task lists and code blocks.',
    h1: 'Write Markdown and see it render as you type',
    lede: 'Previewing Markdown normally means running a build or pushing to a hosted editor. This renders as you type, in the tab, with GitHub-flavoured syntax including tables, task lists and fenced code blocks.',
    keywords: [
      'markdown preview',
      'markdown editor online',
      'markdown to html',
      'gfm preview',
      'live markdown renderer',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'cases', 'notes', 'related'],
    facts: [
      { label: 'Dialect', value: 'GitHub-flavoured' },
      { label: 'Extras', value: 'Tables, tasks, code' },
      { label: 'Rendering', value: 'In-browser' },
    ],
    steps: [
      {
        title: 'Type Markdown on the left',
        body: 'Headings, emphasis, links, images, blockquotes, lists, tables, task lists and fenced code blocks are all supported.',
      },
      {
        title: 'Watch the preview',
        body: 'The rendered output updates on every keystroke, with code blocks highlighted.',
      },
      {
        title: 'Copy the HTML',
        body: 'When you need the markup rather than the preview, copy the generated HTML directly.',
      },
    ],
    cases: [
      {
        title: 'Drafting a README',
        body: 'See how the README will look on the repository host before you push it, including whether the table renders.',
      },
      {
        title: 'Writing release notes',
        body: 'Draft in plain text and check the rendering, which is faster than switching to a rich editor and back.',
      },
      {
        title: 'Learning Markdown',
        body: 'A live preview makes the relationship between the syntax and the result obvious, which is how most people actually learn it.',
      },
    ],
    notes: [
      {
        title: 'Raw HTML is rendered, not executed',
        body: 'Inline HTML in a Markdown document is rendered as markup but scripts are never executed, so a preview cannot run code from the document you are editing.',
      },
    ],
    why: {
      title: 'A preview should not require a server',
      body: 'Documentation and release notes routinely contain internal hostnames, unreleased feature names and customer names. A preview that renders locally keeps that draft off somebody else’s machine.',
      points: [
        'GitHub-flavoured Markdown with tables, task lists and strikethrough.',
        'Fenced code blocks with syntax highlighting.',
        'Copy the generated HTML when you need the markup.',
        'Nothing is transmitted while you type.',
      ],
    },
    faq: [
      {
        q: 'Which Markdown dialect is supported?',
        a: 'GitHub-flavoured Markdown, which is CommonMark plus tables, task lists, strikethrough, autolinks and a few extensions. It is the dialect used by GitHub, GitLab and most documentation sites.',
      },
      {
        q: 'Does it support tables and task lists?',
        a: 'Yes, both. A pipe-delimited table renders as a real table, and a list item starting with a bracket and a space renders as a checkbox.',
      },
      {
        q: 'Can I paste HTML directly?',
        a: 'Inline HTML is rendered as markup, which is how GitHub behaves. Script elements are never executed, so the preview cannot run anything from the document.',
      },
      {
        q: 'How do I escape a character?',
        a: 'Prefix it with a backslash. A literal asterisk is written as \\*, and a literal backtick is written as \\`.',
      },
      {
        q: 'Is there a shortcut for a line break?',
        a: 'Two trailing spaces at the end of a line, or a backslash at the end of the line, both produce a hard break the way GitHub does.',
      },
      {
        q: 'Does it support mathematics or diagrams?',
        a: 'No. There is no support for LaTeX blocks, Mermaid diagrams or footnotes. Those need a dedicated renderer, and the plain preview here stays fast and predictable.',
      },
    ],
    related: ['json-formatter', 'html-entity-encoder', 'diff-checker', 'url-encoder'],
    updated: '2026-10-09',
  },

  {
    slug: 'color-contrast-checker',
    name: 'WCAG Contrast Checker',
    glyph: '◐',
    icon: 'contrast',
    category: 'Developer Utilities',
    title: 'Contrast Checker — WCAG Colour Contrast',
    description:
      'Check a foreground and background colour pair against WCAG 2.2 AA and AAA contrast requirements, with the exact ratio and a pass or fail for each criterion.',
    h1: 'Check a colour pair against WCAG contrast requirements',
    lede: 'Contrast failures are the most common accessibility defect in a production interface and the easiest to fix once you can see the ratio. This checker gives you the number, the pass or fail for each criterion, and a suggestion that passes.',
    keywords: [
      'contrast checker',
      'wcag contrast ratio',
      'colour contrast accessibility',
      'wcag aa checker',
      'accessibility colour tool',
      'contrast ratio calculator',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Standard', value: 'WCAG 2.2' },
      { label: 'Levels', value: 'AA and AAA' },
      { label: 'Suggestion', value: 'Auto-adjusted' },
    ],
    steps: [
      {
        title: 'Set the two colours',
        body: 'Pick with the colour input, type a hex value, or paste a CSS colour such as rgb() or hsl(). The tool parses all three.',
      },
      {
        title: 'Read the ratio',
        body: 'The contrast ratio is shown along with the AA and AAA results for normal text, large text and UI components.',
      },
      {
        title: 'Use the suggestion',
        body: 'If the pair fails, a darker or lighter version of the foreground is proposed that meets the standard you need.',
      },
    ],
    examples: [
      {
        caption: 'The thresholds that matter',
        headers: ['Criterion', 'Required ratio', 'Applies to'],
        rows: [
          ['`1.4.3` AA normal text', '4.5:1', 'Body copy under 18pt'],
          ['`1.4.3` AA large text', '3:1', '18pt bold or 24pt regular'],
          ['`1.4.6` AAA normal text', '7:1', 'Body copy under 18pt'],
          ['`1.4.6` AAA large text', '4.5:1', 'Large text'],
          ['`1.4.11` non-text contrast', '3:1', 'Input borders, icons, focus rings'],
        ],
      },
    ],
    cases: [
      {
        title: 'Reviewing a design system',
        body: 'Check every text and background pairing in a component library against the standard, and replace the tokens that fail rather than patching individual screens.',
      },
      {
        title: 'Fixing an accessibility audit finding',
        body: 'An audit reports a ratio and a colour pair. Recreating that pair here shows whether darkening the text or lightening the background is the smaller change.',
      },
      {
        title: 'Choosing a link colour',
        body: 'Link colours are usually the first thing to fail on a light background, and the failure is invisible to the person who chose the brand colour.',
      },
    ],
    notes: [
      {
        title: 'The formula',
        body: 'Relative luminance is computed per channel by linearising the sRGB values, then the ratio is (lighter + 0.05) divided by (darker + 0.05). The 0.05 offset is what makes black on white exactly 21:1 and white on white exactly 1:1.',
      },
    ],
    why: {
      title: 'Contrast is the cheapest accessibility fix there is',
      body: 'A failing pair is a two-character change to a colour token, but finding it without a checker means eyeballing swatches on a screen that may itself be poorly calibrated. The checker removes the guesswork.',
      points: [
        'WCAG 2.2 AA and AAA results for text and non-text criteria.',
        'Accepts hex, rgb(), hsl() and named CSS colours.',
        'A suggested alternative colour that passes your target level.',
        'A live preview of the pairing at realistic text sizes.',
      ],
    },
    faq: [
      {
        q: 'What ratio do I need for body text?',
        a: '4.5:1 for AA and 7:1 for AAA. Large text, defined as 18pt bold or 24pt regular, needs 3:1 for AA and 4.5:1 for AAA.',
      },
      {
        q: 'Do gradients and images need to pass?',
        a: 'The requirement still applies, but the ratio is measured against the worst-case background behind the text. For text over an image, that means adding a solid or sufficiently opaque overlay behind it.',
      },
      {
        q: 'What about icons and input borders?',
        a: 'WCAG 2.2 added success criterion 1.4.11, which requires 3:1 for the visual information needed to identify a control: borders, focus indicators and meaningful icons.',
      },
      {
        q: 'Does a text shadow help?',
        a: 'Not for the purposes of the criterion. The measurement is based on the declared foreground and background colours, and a shadow does not raise the computed ratio.',
      },
      {
        q: 'Why do my brand colours keep failing?',
        a: 'Saturated brand colours tend to sit around 3:1 against white, which passes for large text and fails for body copy. The usual fix is a darker tint of the same hue for text and the original colour for large elements and accents.',
      },
      {
        q: 'Does the tool account for transparency?',
        a: 'Not for the ratio itself. If a colour has an alpha channel, use the checker to find a solid replacement, since a translucent colour does not have one fixed contrast ratio against an arbitrary background.',
      },
    ],
    related: ['qr-generator', 'json-formatter', 'markdown-preview', 'url-encoder'],
    updated: '2026-10-08',
  },

  {
    slug: 'nanoid-generator',
    name: 'Nano ID Generator',
    glyph: 'NID',
    icon: 'tag',
    category: 'Developer Utilities',
    title: 'Nano ID Generator — Compact URL-Safe Random IDs',
    description:
      'Generate Nano ID style identifiers with a custom alphabet and length, using crypto-grade randomness. Ideal for short URL-safe ids that are not UUIDs.',
    h1: 'Generate short, URL-safe, collision-resistant identifiers',
    lede: 'A Nano ID is 21 characters and carries 126 bits of entropy, which is shorter than a UUID for the same security and safer to put in a URL. This generator lets you pick the alphabet and the length.',
    keywords: [
      'nanoid generator',
      'nanoid online',
      'short id generator',
      'url safe id generator',
      'random string generator',
      'custom alphabet id',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'related'],
    facts: [
      { label: 'Default length', value: '21 characters' },
      { label: 'Alphabet', value: 'Customisable' },
      { label: 'Entropy', value: 'crypto.getRandomValues' },
    ],
    steps: [
      {
        title: 'Set the length',
        body: 'The default is 21 characters. Shorter ids are easier to share and read; each additional character multiplies the number of possible values by the alphabet size.',
      },
      {
        title: 'Choose the alphabet',
        body: 'The default is URL-safe letters and digits. You can remove characters that cause trouble in your context, such as 0 and O, or restrict the set to digits only.',
      },
      {
        title: 'Generate and copy',
        body: 'Generate a batch, copy the list, and use them as ids, filenames or share links.',
      },
    ],
    examples: [
      {
        caption: 'Length and the space it covers',
        headers: ['Length', 'Default alphabet', 'Possible values'],
        rows: [
          ['`10`', '`A-Za-z0-9_-`', '`~8.4 × 10¹⁸`'],
          ['`21`', '`A-Za-z0-9_-`', '`~2.7 × 10³¹`'],
          ['`32`', '`A-Za-z0-9_-`', '`~8.6 × 10⁴⁴`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Short share links',
        body: 'A 10-character id in a URL is materially shorter than a UUID, and the character set is chosen so no escaping is ever needed.',
      },
      {
        title: 'Temporary filenames',
        body: 'Generated ids avoid collisions when a file is written to a shared directory by several workers at once.',
      },
      {
        title: 'Readable test fixtures',
        body: 'A custom alphabet without vowels, or with digits only, keeps ids easy to dictate or to paste into a terminal without a shell quoting mistake.',
      },
    ],
    notes: [
      {
        title: 'How much randomness do you need?',
        body: 'A 21-character id over a 64-character alphabet gives 126 bits, which is more than enough that a collision is impossible in practice even across billions of ids. Ten characters gives 60 bits, which is fine for a session id but not for a secret that must never be guessed.',
      },
    ],
    why: {
      title: 'Shorter ids mean better products',
      body: 'A UUID in a URL, a filename or a QR code costs more characters than it needs to. Nano IDs keep the same collision resistance in about a third of the space, which matters once ids are printed on physical things or read aloud over the phone.',
      points: [
        'Custom alphabet, so you can exclude problem characters.',
        'Any length from a handful of characters upwards.',
        'Batch generation up to a thousand ids.',
        'Generated locally with crypto.getRandomValues.',
      ],
    },
    faq: [
      {
        q: 'How does a Nano ID differ from a UUID?',
        a: 'A Nano ID is a short random string from a chosen alphabet, usually 21 characters, where a UUID is a fixed 36-character format with structure. A Nano ID is shorter and, with a custom alphabet, easier to type.',
      },
      {
        q: 'Are these ids random or sequential?',
        a: 'Fully random. They come from crypto.getRandomValues, so they contain no timestamp and no counter. For time-ordered ids, use a v7 UUID instead.',
      },
      {
        q: 'Which characters should I exclude?',
        a: 'It depends on where the id travels. In a spoken or transcribed context, exclude characters that look alike such as 0, O, 1 and l. In a URL, the default alphabet is already safe.',
      },
      {
        q: 'Can I use these as secrets?',
        a: 'For a session identifier, yes. For a credential, use a dedicated random secret generator, because an id that appears in a URL is routinely logged, stored in a referrer header and shared.',
      },
      {
        q: 'How many characters do I need?',
        a: 'Ten characters over the default alphabet give about 60 bits, which is plenty for identifiers. Twenty-one gives 126 bits. If the id is a secret, generate more.',
      },
      {
        q: 'Does it run offline?',
        a: 'Yes. Once the page has loaded, the generation works with no network access at all.',
      },
    ],
    related: ['uuid-generator', 'hash-generator', 'qr-generator', 'base64-encoder'],
    updated: '2026-10-06',
  },

  {
    slug: 'string-replace',
    name: 'Find & Replace Tool',
    glyph: '↺',
    icon: 'replace',
    category: 'Developer Utilities',
    title: 'Find and Replace — Regex Text Replacement Online',
    description:
      'Find and replace text with plain strings or regular expressions, case sensitivity and whole-word controls, and a side-by-side preview of every change.',
    h1: 'Find and replace across a block of text, with a preview first',
    lede: 'Doing a bulk rename inside a file is the job of your editor, not a web page. This is for the other case: a string that arrived from somewhere else, such as a log, a payload or a pasted configuration.',
    keywords: [
      'find and replace online',
      'string replace tool',
      'regex replace online',
      'text replace javascript',
      'bulk text replacement',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Modes', value: 'Literal or regex' },
      { label: 'Preview', value: 'Side by side' },
      { label: 'Capture groups', value: 'Supported' },
    ],
    steps: [
      {
        title: 'Paste the source text',
        body: 'The text you want to transform.',
      },
      {
        title: 'Enter the search and the replacement',
        body: 'Plain text or a regular expression, depending on the mode. In regex mode you can use $1, $2 and named groups in the replacement.',
      },
      {
        title: 'Review the changes',
        body: 'The result is shown next to the original with the number of replacements counted, and you can copy it once it looks right.',
      },
    ],
    cases: [
      {
        title: 'Normalising a pasted log',
        body: 'A log with a timestamp format you want to standardise, or with ids padded in an unhelpful way, is fixed before you paste it anywhere else.',
      },
      {
        title: 'Rewriting a configuration payload',
        body: 'Replace a placeholder value in a JSON or YAML string you received, without editing the original file on disk.',
      },
      {
        title: 'Extracting a pattern from a batch',
        body: 'Use a capture group to pull a field out of every line and rewrite each line to contain only that field.',
      },
    ],
    notes: [
      {
        title: 'Replacement syntax',
        body: 'In regex mode, $1 through $9 refer to the numbered groups and $name refers to a named group. A literal dollar sign is written as $$.',
      },
    ],
    why: {
      title: 'Bulk edits deserve a preview',
      body: 'A replacement that looks right and matches three thousand times is a disaster waiting to happen. Showing the transformed text next to the original, with a count, means you see the blast radius before you paste the result anywhere.',
      points: [
        'Literal and regular expression modes.',
        'Case sensitivity and whole-word controls.',
        'Numbered and named capture groups in the replacement.',
        'A side-by-side preview with the replacement count.',
      ],
    },
    faq: [
      {
        q: 'How do I use capture groups in the replacement?',
        a: 'In regex mode, write $1 for the first group, $2 for the second, and $name for a named group. A literal dollar sign is written as $$ so it is not mistaken for a reference.',
      },
      {
        q: 'Does it replace every occurrence or only the first?',
        a: 'Every occurrence. The count of replacements is reported so you can confirm what happened.',
      },
      {
        q: 'What is the difference between literal and regex mode?',
        a: 'In literal mode the search text is matched exactly. In regex mode it is a pattern, so a dot matches any character, brackets match a set, and a backslash starts an escape.',
      },
      {
        q: 'Can I search across multiple lines?',
        a: 'Yes, in regex mode the pattern can span newlines, and the s flag makes the dot match a line break as well.',
      },
      {
        q: 'Is there a size limit?',
        a: 'No explicit limit, though very large inputs make the live preview slow as you type. For files of many megabytes, use a command line tool.',
      },
      {
        q: 'Is my text sent to a server?',
        a: 'No. The replacement runs in the browser. That matters here because the text is often a log excerpt or a payload that contains identifiers you would rather not share.',
      },
    ],
    related: ['regex-tester', 'diff-checker', 'json-formatter', 'html-entity-encoder'],
    updated: '2026-10-10',
  },

  {
    slug: 'date-difference',
    name: 'Date Difference Calculator',
    glyph: 'Δ',
    icon: 'calendarSpan',
    category: 'Developer Utilities',
    title: 'Date Difference Calculator — Days Between Dates',
    description:
      'Calculate the exact difference between two dates in days, hours, minutes and seconds, with working days, weeks and totals across multiple date ranges.',
    h1: 'The exact distance between two moments in time',
    lede: 'Date arithmetic goes wrong in different timezones and around daylight saving boundaries. This calculator works in explicit timezones, counts working days and shows you the components of the difference rather than a single rounded number.',
    keywords: [
      'date difference calculator',
      'days between dates',
      'time between two dates',
      'date calculator',
      'working days between dates',
      'age calculator',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'related'],
    facts: [
      { label: 'Zones', value: 'Explicit timezones' },
      { label: 'Working days', value: 'Counted' },
      { label: 'Output', value: 'Full breakdown' },
    ],
    steps: [
      {
        title: 'Set both dates',
        body: 'Pick the start and the end date and time. Each side has its own timezone, so a handoff between two offices is measured correctly.',
      },
      {
        title: 'Read the breakdown',
        body: 'The result is given in days, hours, minutes and seconds, plus weeks, months, working days and a percentage of a year.',
      },
      {
        title: 'Check the calendar view',
        body: 'A month grid highlights the range and marks the weekends and public holidays in your selected country.',
      },
    ],
    examples: [
      {
        caption: 'Working out what a deadline means',
        headers: ['Measure', 'Value'],
        rows: [
          ['Total calendar days', '`45`'],
          ['Working days (Mon–Fri)', '`31`'],
          ['Full weeks', '`6 weeks and 3 days`'],
          ['In hours', '`1,080 hours`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Measuring a sprint',
        body: 'Calendar days and working days for a two-week sprint, which is the number that actually matters when you are estimating.',
      },
      {
        title: 'Checking a policy window',
        body: 'A retention period, a trial length or a chargeback window, computed to the day so you can compare it against a date in a contract.',
      },
      {
        title: 'Working across timezones',
        body: 'A handover from a team in Berlin to a team in San Francisco, measured in each local time so nobody is surprised by the morning.',
      },
    ],
    notes: [
      {
        title: 'Daylight saving changes the length of a day',
        body: 'On a spring-forward date the day is 23 hours long and on an autumn day it is 25. Any calculation that assumes 24 hours per day is wrong twice a year, which is why the hours component here is computed from real timestamps rather than from a day count.',
      },
    ],
    why: {
      title: 'Date maths is a common source of off-by-one bugs',
      body: 'A day count that is off by one because of a timezone, a leap year or a daylight saving boundary is the kind of defect that passes a code review and fails a customer. Doing the arithmetic in explicit timezones, with the components shown, makes the result checkable by eye.',
      points: [
        'Independent timezone for each date.',
        'Calendar days, working days, weeks, months and hours.',
        'Public holidays for a chosen country marked in the calendar.',
        'The result is computed from real timestamps, so DST is handled.',
      ],
    },
    faq: [
      {
        q: 'How are working days calculated?',
        a: 'Monday to Friday, excluding weekends and the public holidays registered for the selected country and year. If you need a different working week, count the calendar days and subtract manually.',
      },
      {
        q: 'Is the end date included?',
        a: 'The difference is the number of whole days between the two moments. For an inclusive count of days touched, add one, which is the convention in project planning tools.',
      },
      {
        q: 'How are months calculated?',
        a: 'As whole calendar months, with the leftover days counted separately. This is why 30 days is not one month in this calculation, and why a licence described in months behaves differently from one described in days.',
      },
      {
        q: 'Does it account for daylight saving?',
        a: 'Yes. The hours are derived from the actual timestamps, so a day that is 23 or 25 hours long is counted correctly. The two timezones are explicit so you can see which rules applied.',
      },
      {
        q: 'Can I add a duration to a date?',
        a: 'The second field accepts a date, and the difference is computed between them. To add a number of days, set the end date to the start date plus that offset, and the breakdown shows the components.',
      },
      {
        q: 'Which public holidays are included?',
        a: 'The major national holidays for the selected country and year, with fixed and observed dates handled. Regional and company holidays are not included, because there is no authoritative source for them.',
      },
    ],
    related: ['timestamp-converter', 'cron-builder', 'json-formatter', 'regex-tester'],
    updated: '2026-10-02',
  },
];

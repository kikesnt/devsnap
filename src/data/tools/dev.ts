import type { ToolDef } from '../types';

export const devTools: ToolDef[] = [
  {
    slug: 'regex-tester',
    name: 'Regex Tester & Explainer',
    glyph: '.*',
    icon: 'asterisk',
    category: 'Developer Utilities',
    title: 'Regex Tester — Test Regular Expressions Online',
    description:
      'Test a regular expression against sample text with every match highlighted, the capture groups listed and a plain-English explanation of each token.',
    h1: 'Test a regular expression and understand what each token does',
    lede: 'A regex that works on the happy path and fails quietly in production is the most common kind of bug you cannot see. This tester shows every match, every capture group and a plain-English reading of the pattern.',
    keywords: [
      'regex tester',
      'regular expression tester',
      'regex online',
      'test regex online',
      'regex explainer',
      'regex match tool',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Flags', value: 'g, i, m, s, u' },
      { label: 'Groups', value: 'Named + numbered' },
      { label: 'Engine', value: 'Browser native' },
    ],
    steps: [
      {
        title: 'Write the pattern',
        body: 'Type the expression without the delimiters. Add flags in the box next to it: g for global, i for case-insensitive, m for multiline, s for dot-matches-newline and u for full Unicode.',
      },
      {
        title: 'Paste the subject text',
        body: 'The sample text is scanned live. Every match is highlighted, and the number of matches, the capture groups and the match offsets are reported.',
      },
      {
        title: 'Read the breakdown',
        body: 'Each token in the pattern is explained in plain English, so a pattern copied from a forum post becomes something you can defend in a code review.',
      },
    ],
    examples: [
      {
        caption: 'Tokens explained',
        headers: ['Token', 'Meaning'],
        rows: [
          ['`^`', 'Start of the line'],
          ['`(?<year>\\d{4})`', 'A named group capturing exactly four digits'],
          ['`[-/]`', 'Either a hyphen or a slash as the separator'],
          ['`(?=\\d{2})`', 'A lookahead asserting two digits follow, without consuming them'],
          ['`$`', 'End of the line'],
        ],
      },
    ],
    cases: [
      {
        title: 'Validating a date pattern',
        body: 'Test a date regex against a mixed batch of valid and invalid strings to see exactly which ones slip through. A pattern that matches 2026-13-45 is worse than no pattern at all.',
      },
      {
        title: 'Extracting fields from a log line',
        body: 'Build the expression against a real log line, then confirm the capture groups land on the right values before putting it into the parser.',
      },
      {
        title: 'Checking a pattern someone sent you',
        body: 'A regex pasted into a chat message is often a service-wide destructive replacement. Test it against real data and read the explanation before you deploy it.',
      },
    ],
    notes: [
      {
        title: 'The JavaScript flavour',
        body: 'This uses the browser’s own RegExp engine, so the syntax is JavaScript’s: no lookbehind before a quantifier, no possessive quantifiers, and no \z or \A anchors. If your backend is Python, Go or Rust, check the dialect before you copy a pattern across.',
      },
      {
        title: 'Catastrophic backtracking is real',
        body: 'A pattern with nested quantifiers such as (a+)+ can take exponential time on a long non-matching input and lock the tab. If the tester appears to hang, look for that shape first — nested quantifiers are the usual cause.',
      },
    ],
    why: {
      title: 'Regexes hide their cost',
      body: 'The damage a bad pattern does is a production incident, not a compile error. A tester that shows the match count, the groups and the interpretation of the pattern turns an invisible risk into something you can review.',
      points: [
        'Live matching with every hit highlighted in the sample text.',
        'Numbered and named capture groups listed per match.',
        'A plain-English explanation of every token in the pattern.',
        'Runaway patterns are detected and reported instead of hanging silently.',
      ],
    },
    faq: [
      {
        q: 'Does the tester support every regex flavour?',
        a: 'It supports JavaScript regular expressions, which is what your browser uses. Python, Go, Java and .NET have small differences — Python adds \A and \Z anchors and named groups with a different syntax, and Go and Rust do not support lookbehind at all.',
      },
      {
        q: 'What does the g flag do?',
        a: 'It makes matching continue past the first hit. Without it, most methods return only the first match. The tester always reports every match regardless of the flag, and the flag mainly changes what find and replace do.',
      },
      {
        q: 'Why is my capture group empty?',
        a: 'Usually an optional group that did not participate in that particular match, a group inside a negative lookahead, or a group that was reset because the engine took a different path through the pattern.',
      },
      {
        q: 'What is a lookahead?',
        a: 'A zero-width assertion. A positive lookahead such as (?=\d{2}) checks that two digits follow without consuming them, and a negative lookahead such as (?!http) checks that something does not follow. It is how you express a constraint that is not part of the value you want to keep.',
      },
      {
        q: 'How do I make a pattern match across multiple lines?',
        a: 'Add the m flag for the anchors to match at each line boundary, and the s flag if the dot should also match a newline character.',
      },
      {
        q: 'Is my test text sent anywhere?',
        a: 'No. Both the pattern and the sample text are processed by the browser’s engine on your machine. This matters more here than in most tools, because test data is often a real customer record.',
      },
    ],
    related: ['diff-checker', 'json-diff', 'string-replace', 'base64-encoder'],
    updated: '2026-10-13',
  },

  {
    slug: 'cron-builder',
    name: 'Cron Expression Builder',
    glyph: '* *',
    icon: 'clock',
    category: 'Developer Utilities',
    title: 'Cron Builder — Explain Cron Schedules Online',
    description:
      'Build a cron expression from plain English, see the next run times, and get the equivalent for AWS, Quartz and GitHub Actions.',
    h1: 'Build a cron expression and see when it will actually run',
    lede: 'Five fields of stars and numbers are easy to write and easy to get wrong. This builder lets you pick what you want in plain language, shows the next run times, and explains each field of the expression it produces.',
    keywords: [
      'cron expression builder',
      'cron calculator',
      'explain cron expression',
      'cron schedule',
      'crontab generator',
      'next run time cron',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Flavours', value: 'Unix, Quartz, AWS, GitHub' },
      { label: 'Next runs', value: 'Calculated locally' },
      { label: 'Fields', value: 'Explained inline' },
    ],
    steps: [
      {
        title: 'Describe the schedule',
        body: 'Choose how often it should run — every minute, hourly, daily at a time, weekly on a day, monthly on a date — and the builder produces the expression.',
      },
      {
        title: 'Check the next run times',
        body: 'The next few execution times are listed in your local timezone, which is the fastest way to catch a schedule that fires at the wrong hour.',
      },
      {
        title: 'Copy the right flavour',
        body: 'Unix cron, Quartz, AWS EventBridge and GitHub Actions all differ. The equivalents are shown side by side so you paste the one your scheduler expects.',
      },
    ],
    examples: [
      {
        caption: 'The same schedule across schedulers',
        headers: ['Schedule', 'Unix cron', 'AWS EventBridge'],
        rows: [
          ['Every hour, on the hour', '`0 * * * *`', '`rate(1 hour)` or `cron(0 * * * ? *)`'],
          ['Every day at 03:30', '`30 3 * * *`', '`cron(30 3 * * ? *)`'],
          ['Every Monday at 09:00', '`0 9 * * 1`', '`cron(0 9 ? * MON-FRI *)`'],
          ['Every 15 minutes', '`*/15 * * * *`', '`rate(15 minutes)`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Setting up a scheduled job',
        body: 'Pick the schedule in words, confirm the next run times, and copy the expression in the flavour your scheduler wants. No guessing about which column is minutes.',
      },
      {
        title: 'Reading a cron expression you inherited',
        body: 'Paste an expression and get the field-by-field explanation plus the next run times, which is usually enough to work out why the job was never firing.',
      },
      {
        title: 'Finding a job that fires too often',
        body: 'The most expensive cron bug is a job that was meant to run daily and runs every minute. Seeing the next ten run times makes that obvious instantly.',
      },
    ],
    notes: [
      {
        title: 'Day-of-month and day-of-week are OR-ed, not AND-ed',
        body: 'This is the classic cron trap. In standard Unix cron, a schedule that sets both day-of-month and day-of-week fires whenever either one matches, not when both do. If you want the intersection, you need a tool that supports it, or you split the job into two.',
      },
      {
        title: 'Timezones are not part of the expression',
        body: 'A cron expression is interpreted in the timezone of the scheduler, which on a Linux server is usually UTC. The next-run times here are shown in your local timezone so you can see the real effect.',
      },
    ],
    why: {
      title: 'A wrong schedule is invisible until it bills you',
      body: 'The failure mode of a bad cron expression is not a crash, it is a job that runs 1,440 times a day and quietly consumes a budget. Seeing the actual run times before you deploy is the whole point.',
      points: [
        'Plain-English schedule picker for the common cases.',
        'The next ten run times in your timezone.',
        'Equivalent expressions for Unix cron, Quartz, AWS and GitHub Actions.',
        'Every field explained, with the ranges and special characters spelled out.',
      ],
    },
    faq: [
      {
        q: 'What is the difference between cron and Quartz?',
        a: 'Quartz has seven fields, adding seconds and a year, and uses ? in place of unused day fields. Unix cron has five: minute, hour, day of month, month and day of week. AWS and GitHub Actions each have their own quirks on top of either one.',
      },
      {
        q: 'Why does my job not run on the day I expect?',
        a: 'Check the day-of-month and day-of-week rule first. When both are restricted, standard cron fires if either matches. Then check the timezone: the expression is evaluated in the scheduler’s timezone, which is often UTC.',
      },
      {
        q: 'What do the special characters mean?',
        a: 'An asterisk means every value, a comma separates alternatives, a hyphen defines a range, a slash means every nth value, and question marks in Quartz and AWS mean "no specific value" in that field.',
      },
      {
        q: 'Can I run a job every 90 seconds?',
        a: 'Not in standard Unix cron, which has a one-minute minimum granularity. You need Quartz for second-level scheduling, or a scheduler such as systemd timers that supports sub-minute intervals.',
      },
      {
        q: 'Are the next run times computed in my timezone?',
        a: 'Yes. They are shown in your browser’s local timezone, so you can confirm that a job intended for 03:00 is not actually firing at 11:00 where you are sitting.',
      },
      {
        q: 'What is the shortest useful cron schedule?',
        a: 'For most production systems, hourly at worst. A job that runs every minute costs 43,200 executions a month and is almost always a sign that the schedule was never checked.',
      },
    ],
    related: ['timestamp-converter', 'regex-tester', 'json-formatter', 'dotenv-editor'],
    updated: '2026-10-09',
  },

  {
    slug: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    glyph: 'TS',
    icon: 'calendar',
    category: 'Developer Utilities',
    title: 'Unix Timestamp Converter — Epoch to Date Online',
    description:
      'Convert Unix timestamps to human-readable dates and back, in seconds, milliseconds, microseconds or nanoseconds, with timezone conversion to UTC and local time.',
    h1: 'Convert between Unix timestamps and readable dates',
    lede: 'Timestamps come out of logs, APIs and databases in whatever unit the system felt like using, and they always need to be read in a specific timezone. This converter handles the unit and the timezone explicitly.',
    keywords: [
      'timestamp converter',
      'unix timestamp to date',
      'epoch converter',
      'unix time converter',
      'epoch to human readable',
      'milliseconds to date',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Units', value: 's, ms, µs, ns' },
      { label: 'Zones', value: 'UTC and local' },
      { label: 'Direction', value: 'Both ways' },
    ],
    steps: [
      {
        title: 'Paste a timestamp or a date',
        body: 'A number is read as a Unix timestamp in the unit you select. A date string is parsed and converted the other way.',
      },
      {
        title: 'Pick the unit',
        body: 'Seconds, milliseconds, microseconds and nanoseconds are all common in the wild, and getting the unit wrong produces a date in the year 2000 or the year 55000.',
      },
      {
        title: 'Read it in both zones',
        body: 'The result is shown in UTC and in your local timezone, along with the ISO 8601 form, the RFC 3339 form and the relative offset.',
      },
    ],
    examples: [
      {
        caption: 'The same moment in different representations',
        headers: ['Representation', 'Value'],
        rows: [
          ['Unix seconds', '`1767225600`'],
          ['Unix milliseconds', '`1767225600000`'],
          ['ISO 8601 (UTC)', '`2026-01-01T00:00:00.000Z`'],
          ['RFC 3339', '`2026-01-01T00:00:00Z`'],
          ['SQL format', '`2026-01-01 00:00:00`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Reading a log line',
        body: 'A raw epoch in a log becomes a human date, with the timezone spelled out, in a single paste.',
      },
      {
        title: 'Debugging a date bug',
        body: 'When a date shows up 1,000 times too large, the system is mixing milliseconds and seconds. Seeing both units side by side makes the mismatch obvious.',
      },
      {
        title: 'Preparing an API parameter',
        body: 'Most payment and scheduling APIs want a Unix timestamp in seconds, and the most common cause of a rejected request is the wrong unit.',
      },
    ],
    notes: [
      {
        title: 'Unix time ignores leap seconds',
        body: 'Unix time counts seconds since 1970-01-01 UTC and does not account for leap seconds, so it drifts slightly from UTC. For anything requiring legally defined time, use UTC with an explicit leap-second table.',
      },
      {
        title: 'The 32-bit boundary',
        body: 'A 32-bit signed integer overflows in 2038. A value of 2,147,483,647 is the last second that fits, which is why you should use a 64-bit field for any timestamp you store.',
      },
    ],
    why: {
      title: 'A timestamp is not a time',
      body: 'A Unix timestamp is a duration since an epoch, and it carries no timezone at all. The moment it is rendered it is a specific instant in a specific zone, and getting that wrong is a classic source of off-by-hours bugs. Showing the UTC and local readings together makes the ambiguity impossible to miss.',
      points: [
        'Seconds, milliseconds, microseconds and nanoseconds.',
        'UTC, your local timezone and an arbitrary offset.',
        'ISO 8601, RFC 3339, SQL and HTTP-date output formats.',
        'Relative time such as "3 days ago" and the Unix day counter.',
      ],
    },
    faq: [
      {
        q: 'How do I know if a timestamp is in seconds or milliseconds?',
        a: 'By its magnitude. A seconds timestamp for a date around 2026 is a ten-digit number near 1,767,000,000. The same moment in milliseconds is thirteen digits near 1,767,000,000,000. If the number has more than 11 digits, it is almost certainly milliseconds.',
      },
      {
        q: 'What is the Unix epoch?',
        a: '1 January 1970 at 00:00:00 UTC. A Unix timestamp is the number of seconds since that moment. Timestamps before it are negative.',
      },
      {
        q: 'Does the converter handle leap years and DST?',
        a: 'Yes. Dates are computed with the full calendar rules for the relevant year. Daylight saving transitions are applied according to your local timezone, so a time that falls inside a DST jump is shown correctly.',
      },
      {
        q: 'What is the ISO 8601 format exactly?',
        a: 'A calendar date in the year-month-day form, followed by a T and a 24-hour time in hour:minute:second, with an optional fractional part and a Z or numeric offset for the timezone. The Z suffix means UTC.',
      },
      {
        q: 'Why does my date come out 45 years in the future?',
        a: 'A seconds timestamp was passed to a function expecting milliseconds. Multiply a seconds value by 1,000 to get milliseconds, and by 1,000,000 for microseconds.',
      },
      {
        q: 'Can I convert a date in a specific timezone?',
        a: 'Yes. Choose UTC, your local zone, or enter a fixed offset such as +05:30, and the result is converted into it.',
      },
    ],
    related: ['cron-builder', 'uuid-generator', 'date-difference', 'json-formatter'],
    updated: '2026-10-12',
  },

  {
    slug: 'json-schema-generator',
    name: 'JSON Schema Generator',
    glyph: 'SCH',
    icon: 'schema',
    category: 'Developer Utilities',
    title: 'JSON Schema Generator — From a JSON Sample',
    description:
      'Generate a JSON Schema from a sample document, with inferred types, required fields and nested objects. Draft 2020-12 output.',
    h1: 'Infer a JSON Schema from a sample document',
    lede: 'Writing a schema by hand for an API you did not design is slow and error-prone. Paste a representative response and this generates a draft 2020-12 schema with inferred types, required properties and nested structure.',
    keywords: [
      'json schema generator',
      'infer json schema',
      'json schema from example',
      'json schema validator draft 2020-12',
      'create json schema online',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Draft', value: '2020-12' },
      { label: 'Required', value: 'Inferred from presence' },
      { label: 'Output', value: 'JSON Schema' },
    ],
    steps: [
      {
        title: 'Paste a sample document',
        body: 'A real API response works best. The more representative the sample, the more accurate the required list.',
      },
      {
        title: 'Review the inferred types',
        body: 'String, number, integer, boolean, null, array and object types are detected, and nested objects become nested properties.',
      },
      {
        title: 'Copy the schema',
        body: 'The schema is emitted as formatted JSON, ready to paste into your validation library or your API documentation.',
      },
    ],
    examples: [
      {
        caption: 'What gets inferred',
        headers: ['Sample value', 'Inferred type'],
        rows: [
          ['`"id": 42`', '`integer`'],
          ['`"ratio": 3.14`', '`number`'],
          ['`"active": true`', '`boolean`'],
          ['`"deleted_at": null`', '`null` (add to the type list)'],
          ['`"tags": ["a", "b"]`', '`array` of `string`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Documenting a third-party API',
        body: 'Capture a real response, generate the schema and paste it into the docs. It describes the API that actually returns data rather than the one the marketing page describes.',
      },
      {
        title: 'Adding validation to an existing endpoint',
        body: 'A generated schema gives you a starting point for request validation in your service, and a fixture you can test against.',
      },
      {
        title: 'Writing a TypeScript type',
        body: 'The schema is close enough to a type definition to speed up generating one by hand, and it stays consistent with the JSON it describes.',
      },
    ],
    notes: [
      {
        title: 'Required means "present in your sample"',
        body: 'A property is marked required because it appeared in the document you pasted. That is a guess about the API, not a fact. If a field is occasionally absent, you need to know that from a second sample or from the documentation before you trust the required list.',
      },
      {
        title: 'One sample cannot describe a union',
        body: 'If a field is sometimes a string and sometimes an object, a single sample can only show you one of them. Sample each shape separately and merge the results, or edit the generated schema by hand.',
      },
    ],
    why: {
      title: 'Schemas are contracts, and contracts come from data',
      body: 'A schema written from documentation drifts from the API the first time the provider ships an undocumented field. Inferring from a real response captures what the API actually does, and doing it locally keeps the sample payload out of a third-party log.',
      points: [
        'Detects integer, number, string, boolean, null, array and object.',
        'Nested objects produce nested properties and nested items.',
        'Optional properties are detected when they are missing in the sample.',
        'The output is a standard draft 2020-12 schema.',
      ],
    },
    faq: [
      {
        q: 'Is the generated schema guaranteed to be accurate?',
        a: 'No. It is inferred from one document, so it describes the shape you saw. Treat it as a strong starting point and validate it against several real responses before you rely on it for validation.',
      },
      {
        q: 'How do I mark a property as optional?',
        a: 'A property that is absent from your sample is emitted as optional, and a property that is present in every object is marked required. If you want to force it, edit the generated schema directly.',
      },
      {
        q: 'Which JSON Schema draft is this?',
        a: 'Draft 2020-12, which is the current recommendation. Older drafts use slightly different syntax for references and vocabulary handling, so check what your validation library expects.',
      },
      {
        q: 'Does it handle arrays of objects?',
        a: 'Yes. The schema of the first array element becomes the items schema, and nested objects inside the array are described recursively.',
      },
      {
        q: 'Can I use this with ajv or a Python validator?',
        a: 'Yes, it is a standard JSON Schema document. ajv, jsonschema, pydantic and FastAPI all consume this format, so you can validate it against your own data straight away.',
      },
      {
        q: 'Why does my nullable field look odd?',
        a: 'A field whose value is null is typed as null. If the same field is a string in other responses, the sample needs to include both shapes for the schema to list both types.',
      },
    ],
    related: ['json-formatter', 'json-to-csv', 'yaml-to-json', 'json-diff'],
    updated: '2026-10-01',
  },

  {
    slug: 'diff-checker',
    name: 'Text Diff Checker',
    glyph: '±',
    icon: 'split',
    category: 'Developer Utilities',
    title: 'Text Diff Checker — Compare Two Texts Online',
    description:
      'Compare two blocks of text line by line and word by word, with additions, deletions and changed lines highlighted side by side.',
    h1: 'Compare two blocks of text and see exactly what changed',
    lede: 'Diffing two versions by eye does not scale. This checker aligns the two texts line by line, then within each changed line word by word, so a one-character difference does not look like a rewritten paragraph.',
    keywords: [
      'diff checker',
      'text compare online',
      'compare two texts',
      'diff tool',
      'text difference checker',
      'find differences in text',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'cases', 'notes', 'related'],
    facts: [
      { label: 'Granularity', value: 'Line and word' },
      { label: 'Options', value: 'Ignore whitespace, case' },
      { label: 'Output', value: 'Unified diff' },
    ],
    steps: [
      {
        title: 'Paste both versions',
        body: 'The left box holds the original and the right box the changed version. Either side can come from a file.',
      },
      {
        title: 'Adjust the comparison',
        body: 'Turn off whitespace sensitivity when a reindent is all that changed, and turn off case sensitivity when only capitalisation differs.',
      },
      {
        title: 'Read the result',
        body: 'Changed lines are marked in the side-by-side view, and a unified diff is available to copy straight into a commit message or a pull request description.',
      },
    ],
    cases: [
      {
        title: 'Comparing a generated file with a template',
        body: 'A codegen output against the expected output shows you exactly which line drifted, instead of scrolling two files side by side looking for the difference.',
      },
      {
        title: 'Checking a config change',
        body: 'Before and after a settings edit, diffed, shows the one line that moved and whether the whitespace changed too.',
      },
      {
        title: 'Reviewing a response body',
        body: 'When a response changes shape between two environments, diffing the two payloads finds the missing field in a second.',
      },
    ],
    notes: [
      {
        title: 'Why the word-level view matters',
        body: 'A line diff marks a whole line as changed when a single character differs. Adding the word-level pass narrows the highlight to the words that actually differ, which is the difference between a readable review and a wall of red.',
      },
    ],
    why: {
      title: 'Diffs are how you review changes',
      body: 'Every review, every debugging session and every audit starts by asking what changed. A diff tool that runs in the browser means you can compare two payloads — possibly containing customer data — without copying them into somebody else’s form.',
      points: [
        'Line-level and word-level highlighting.',
        'Optional whitespace and case insensitivity.',
        'A unified diff you can copy into a commit or a pull request.',
        'Summary counts of added, removed and changed lines.',
      ],
    },
    faq: [
      {
        q: 'How does the diff algorithm work?',
        a: 'It is a longest-common-subsequence comparison over lines, which is the same family of algorithm Git uses. When the two texts share large common blocks, the result is the minimal set of changes that explains the difference.',
      },
      {
        q: 'What is a unified diff?',
        a: 'The standard patch format with context lines and +/- prefixes, as produced by the diff command. It is what Git expects when you paste a patch, and it reads well in a pull request description.',
      },
      {
        q: 'Should I turn off whitespace sensitivity?',
        a: 'Yes, when a formatter or an editor has reindented the file and the logic is unchanged. Leave it on when whitespace carries meaning, such as in Python, YAML or a Makefile.',
      },
      {
        q: 'Is there a size limit?',
        a: 'No explicit limit, but the comparison is quadratic in the worst case. Text of a few hundred thousand lines is fine; a multi-gigabyte file is not what this is for.',
      },
      {
        q: 'Can I compare two files on disk?',
        a: 'Open them in a text editor and paste each into a box, or use a command line tool such as diff or git diff for very large files. This one is here for the moment when you need to compare something that is not in a repository.',
      },
      {
        q: 'Does the word-level view replace the line-level one?',
        a: 'No, and you want both. The line view shows which lines changed so you can navigate, and the word view narrows each changed line to the specific words that differ.',
      },
    ],
    related: ['json-diff', 'regex-tester', 'sql-formatter', 'json-formatter'],
    updated: '2026-10-07',
  },

  {
    slug: 'json-diff',
    name: 'JSON Diff & Comparator',
    glyph: '≠',
    icon: 'overlap',
    category: 'Developer Utilities',
    title: 'JSON Diff — Compare Two JSON Objects Structurally',
    description:
      'Compare two JSON documents by structure rather than by text. Reports added, removed and changed paths, and ignores key order.',
    h1: 'Compare two JSON documents by structure, not by text',
    lede: 'A text diff between two JSON payloads is dominated by reordering, which is noise. This comparator walks both documents in parallel and reports what actually changed: which paths were added, removed or given a different value.',
    keywords: [
      'json diff',
      'compare json',
      'json comparator',
      'json difference',
      'compare two json objects',
      'api response diff',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Comparison', value: 'Structural' },
      { label: 'Ignores', value: 'Key order, whitespace' },
      { label: 'Paths', value: 'Dotted with indices' },
    ],
    steps: [
      {
        title: 'Paste both documents',
        body: 'Two JSON values, one per box. Order does not matter: the comparator matches keys by name, not by position.',
      },
      {
        title: 'Read the difference list',
        body: 'Every difference is reported with a path, the type of change and the two values involved.',
      },
      {
        title: 'Work through the list',
        body: 'Filter to only the changes you care about, and copy the result into a ticket or a test fixture.',
      },
    ],
    examples: [
      {
        caption: 'What a structural diff reports',
        headers: ['Path', 'Change'],
        rows: [
          ['`user.address.city`', 'Changed: `"Lisbon"` → `"Porto"`'],
          ['`user.tags[2]`', 'Added: `"beta"`'],
          ['`legacy_id`', 'Removed: `10422`'],
          ['`items[0].qty`', 'Changed type: `2` → `"2"`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Comparing two API environments',
        body: 'A staging response against a production response, compared structurally, shows the field that a deploy added or renamed without the noise of reordering.',
      },
      {
        title: 'Writing a regression test',
        body: 'Turn an unexpected response change into an explicit list of assertions instead of a large string snapshot that fails for unrelated reasons.',
      },
      {
        title: 'Validating a migration',
        body: 'After a data migration, compare the migrated output against the original and confirm that only the intended fields differ.',
      },
    ],
    notes: [
      {
        title: 'Key order is ignored, arrays are not',
        body: 'Objects are compared by key name because object key order carries no meaning in JSON. Arrays are compared positionally because in most APIs the order does carry meaning. If yours does not, sort before comparing.',
      },
      {
        title: 'Types are compared as well as values',
        body: 'The number 2 and the string "2" are reported as different, with the type change noted. This catches a real class of bug where a serialiser starts quoting a numeric id.',
      },
    ],
    why: {
      title: 'Structural comparison is the only comparison that scales',
      body: 'A text diff on a reordered payload produces dozens of lines that say nothing. Structural comparison answers the question you actually have: what is different about the data, regardless of how it is laid out.',
      points: [
        'Added, removed, changed and type-changed paths.',
        'Array differences reported with the index.',
        'Key order and whitespace are irrelevant.',
        'No payload is transmitted to a server.',
      ],
    },
    faq: [
      {
        q: 'How are arrays compared?',
        a: 'Positionally, index by index, and the path includes the index. An item that exists at index 3 in one document and not the other is reported as added or removed at that position.',
      },
      {
        q: 'Does key order matter?',
        a: 'No. Objects are matched by key name, so a payload with the same data in a different order produces no differences.',
      },
      {
        q: 'Can it ignore specific fields?',
        a: 'Not in this version. Ignore volatile fields such as timestamps and request ids before comparing, or compare only the subtree you care about.',
      },
      {
        q: 'What is the difference between this and the text diff tool?',
        a: 'The text diff compares lines of text. This one compares parsed documents. For JSON, the structural view is the useful one, because a reordering in a text diff looks like a rewrite.',
      },
      {
        q: 'Does it handle deeply nested documents?',
        a: 'Yes, the walk is recursive, and the path notation identifies exactly where a difference lives, for example `a.b[0].c.d`.',
      },
      {
        q: 'Why does it say a value changed when the two look the same?',
        a: 'Almost always a type difference. The number 2 and the string "2" are different values in JSON, and the comparison treats them as such, which is exactly the class of change that breaks a downstream parser.',
      },
    ],
    related: ['diff-checker', 'json-formatter', 'json-schema-generator', 'json-to-csv'],
    updated: '2026-10-04',
  },
];

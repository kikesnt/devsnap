import type { ToolDef } from '../types';

/**
 * The five tools added after the first release, each one picked because it
 * covers a search intent that the original twenty-nine did not, and each one
 * something a developer can do entirely in the browser.
 */
export const extraTools: ToolDef[] = [
  {
    slug: 'json-repair',
    name: 'JSON Repair',
    glyph: '{}',
    icon: 'wrench',
    category: 'Format & Validate',
    title: 'JSON Repair — Fix Broken JSON Online',
    description:
      'Fix invalid JSON automatically. Recovers from trailing commas, single quotes, unquoted keys, comments, smart quotes, missing brackets and truncated responses.',
    h1: 'Fix broken JSON instead of hunting for the missing brace',
    lede: 'Copy a response out of the terminal, paste it into a form, and lose twenty minutes to a trailing comma. This repairs the common ways JSON breaks and tells you exactly what it changed.',
    keywords: [
      'json repair',
      'fix json',
      'repair invalid json',
      'json fixer online',
      'fix malformed json',
      'json validator fix',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Repairs', value: '9 common faults' },
      { label: 'Output', value: 'Valid JSON' },
      { label: 'Upload', value: 'None' },
    ],
    steps: [
      {
        title: 'Paste the broken text',
        body: 'The output of a curl command, a log line, a truncated response or something an LLM produced. It does not have to be close to valid.',
      },
      {
        title: 'Let it repair',
        body: 'The tool applies the fixes in order, from the safe to the risky, and reports which ones it used.',
      },
      {
        title: 'Check the diff',
        body: 'Every change is listed with the reason, so you can see whether the repair was sensible before you trust the result.',
      },
    ],
    examples: [
      {
        caption: 'What it can fix',
        headers: ['Broken input', 'The fault'],
        rows: [
          ['`{"a": 1,}`', 'Trailing comma'],
          ["{'a': 1}", 'Single quotes instead of double'],
          ['`{a: 1}`', 'Unquoted key'],
          ['`{"a": 1} // note`', 'A trailing comment'],
          ['`{"a": "he said "hi""}`', 'Unescaped quotes inside a string'],
          ['`{"a": [1, 2}`', 'A missing closing bracket'],
          ['`{"a": 1`', 'A truncated response'],
        ],
      },
    ],
    cases: [
      {
        title: 'A response that is almost JSON',
        body: 'Most APIs return valid JSON and the failures are in what surrounds it: a log prefix, a trailing comma, a copy-paste that picked up a smart quote. Those are all recoverable.',
      },
      {
        title: 'A truncated download',
        body: 'A response cut off mid-object is missing its closing braces. The repair adds them, and the output tells you it had to guess where the structure ended.',
      },
      {
        title: 'Configuration pasted from a chat window',
        body: 'Copy-paste from a terminal or a chat app often brings curly quotes and typographic dashes with it. Both are silently converted back.',
      },
    ],
    notes: [
      {
        title: 'A repair is a guess, and the tool says so',
        body: 'Repairing malformed input is inference. Where the original was ambiguous, the tool applies the most common convention and lists it under "changes". A repair is a first draft of the document, not the document itself.',
      },
      {
        title: 'What it will not do',
        body: 'It does not invent missing values, guess which of two conflicting keys is right, or turn a completely different format into JSON. If the input is not JSON-shaped at all, the tool says so rather than producing something plausible.',
      },
    ],
    why: {
      title: 'The payload that needs repairing is the one you cannot paste anywhere',
      body: 'A broken payload is usually a payload that contains something sensitive, because it came from a production log, a customer record or a private endpoint. Pasting it into a repair website means handing it to a third party at exactly the moment you least want to.',
      points: [
        'The repair runs in the browser tab.',
        'Every change is reported, so nothing is changed silently.',
        'The output is validated with a real JSON parser before it is returned.',
        'If the input is not recoverable, it says so instead of guessing.',
      ],
    },
    faq: [
      {
        q: 'Can it fix JSON that is truncated mid-object?',
        a: 'It can add the closing brackets, and it reports that it did so. Where the truncation happened is a guess, so treat the repaired value as an approximation and check it against the source.',
      },
      {
        q: 'Does it change any values?',
        a: 'It does not change a value that parses. It only repairs syntax, and every repair is listed with its reason.',
      },
      {
        q: 'What happens to comments?',
        a: 'A comment is not valid JSON, so it has to go. The tool removes it and reports that it did.',
      },
      {
        q: 'Can it repair YAML or XML?',
        a: 'No. It is a JSON repairer. The YAML converter and the XML formatter each handle their own format properly rather than through a generic repair path.',
      },
      {
        q: 'Is my payload uploaded?',
        a: 'No. The repair runs in the browser, which is the whole point: the payloads that need repairing are usually the ones you would least like to paste into a form.',
      },
      {
        q: 'Why does it not fix everything?',
        a: 'Because beyond a point the input is not recoverable in a principled way. A document that is 40% missing is a document where any output is a fabrication, and the tool would rather tell you that.',
      },
    ],
    related: ['json-formatter', 'json-diff', 'json-schema-generator', 'json-to-csv'],
    updated: '2026-10-16',
  },

  {
    slug: 'json-schema-validator',
    name: 'JSON Schema Validator',
    glyph: '✓',
    icon: 'checklist',
    category: 'Format & Validate',
    title: 'JSON Schema Validator — Validate JSON',
    description:
      'Validate a JSON document against a JSON Schema and see every violation with its path, the expected type and the value it received. Runs in your browser.',
    h1: 'Validate a document against a schema, and see exactly what broke',
    lede: 'A validator that says "invalid" is halfway to useless. This one reports every violation with the path, the rule that was broken, what the schema expected and what the document actually contained.',
    keywords: [
      'json schema validator',
      'validate json against schema',
      'json schema validation online',
      'json schema checker',
      'validate json instance',
      'json schema draft 2020-12 validator',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'cases', 'why', 'related'],
    facts: [
      { label: 'Draft', value: '2020-12' },
      { label: 'Output', value: 'Path-level errors' },
      { label: 'Server', value: 'None' },
    ],
    steps: [
      {
        title: 'Paste the schema',
        body: 'A draft 2020-12 schema. It can be a full schema with $ref, or a fragment with just type and properties.',
      },
      {
        title: 'Paste the document',
        body: 'The instance you want to check. It does not have to be pretty-printed.',
      },
      {
        title: 'Read the violations',
        body: 'Each failure is listed with its path, the keyword that failed, the expected value and the actual one.',
      },
    ],
    examples: [
      {
        caption: 'The errors this reports',
        headers: ['Keyword', 'Meaning'],
        rows: [
          ['`type`', 'The value is not of the declared type'],
          ['`required`', 'A required property is missing'],
          ['`enum`', 'The value is not one of the allowed values'],
          ['`minimum` / `maximum`', 'The number is out of range'],
          ['`minLength` / `maxLength`', 'The string is the wrong length'],
          ['`pattern`', 'The string does not match the regular expression'],
          ['`additionalProperties`', 'An unexpected property is present'],
        ],
      },
    ],
    cases: [
      {
        title: 'Checking a webhook payload',
        body: 'A provider publishes a schema for the payload it sends. Paste one real delivery and find out immediately whether it conforms.',
      },
      {
        title: 'Debugging a form submission',
        body: 'The client says the form is invalid and the server does not say why. Validating against the schema locally shows which field is wrong.',
      },
      {
        title: 'Contract testing in a pull request',
        body: 'Validating a fixture against the schema catches a breaking change to the contract before it reaches a consumer.',
      },
    ],
    notes: [
      {
        title: 'What is and is not validated',
        body: 'This validates an instance against a schema. It does not check the schema itself — a schema that says everything is optional will pass anything. If you need the schema to be well-formed, that is a different check.',
      },
      {
        title: 'References need their documents',
        body: 'A schema that uses $ref to another file cannot be resolved here, because resolving it would mean fetching a remote document, and the tool does not make network requests. Inline the referenced part, or paste the referenced schema into the document pane.',
      },
    ],
    why: {
      title: 'A schema is often a public document',
      body: 'The schema for a webhook is published, so the schema is not the secret. The instance is. Validating locally means the payload being checked never leaves your machine, which is the only acceptable way to handle a customer record or an internal response.',
      points: [
        'Validation runs in the browser against draft 2020-12.',
        'Every violation is reported with its path and the rule that failed.',
        'No network requests, so a $ref to a remote document is the only limitation.',
        'The document being validated is never transmitted.',
      ],
    },
    faq: [
      {
        q: 'Which JSON Schema draft is supported?',
        a: 'Draft 2020-12, which is the current recommendation. Most older schemas in the wild also work, since the core keywords have not changed.',
      },
      {
        q: 'Why is my $ref not resolving?',
        a: 'A reference to another file would need to be fetched over the network, and the tool makes no network requests. Inline the referenced fragment into the schema, or use a self-contained schema.',
      },
      {
        q: 'Does it validate the schema as well?',
        a: 'No. It validates the document against the schema. Whether the schema itself is sensible is a separate question, and a permissive schema will pass anything.',
      },
      {
        q: 'What does "invalid" mean exactly?',
        a: 'That at least one keyword was violated. The list names each one with the path of the offending value, so you get the location and the reason rather than a boolean.',
      },
      {
        q: 'Can it validate a whole folder of files?',
        a: 'Not in the browser. This tool handles one document at a time, which suits the common case of checking a payload or a fixture.',
      },
      {
        q: 'Is the document uploaded?',
        a: 'No. Validation runs in the browser. The document being validated is frequently a customer record or an internal API response, which is exactly the kind of thing that should not be pasted into a form.',
      },
    ],
    related: ['json-schema-generator', 'json-formatter', 'json-repair', 'json-diff'],
    updated: '2026-10-16',
  },

  {
    slug: 'curl-converter',
    name: 'cURL Converter',
    glyph: 'cURL',
    icon: 'curl',
    category: 'Developer Utilities',
    title: 'cURL Converter — Convert cURL to Other Code',
    description:
      'Convert a cURL command into fetch, JavaScript, Python requests, Go, PHP, Ruby, Rust or HTTPie, with headers, cookies and body handled correctly.',
    h1: 'Turn a cURL command into the language you actually write',
    lede: 'A cURL command copied out of the browser devtools is the most common way developers discover an API. Converting it by hand is tedious and easy to get wrong, especially the body and the header casing.',
    keywords: [
      'curl converter',
      'curl to python',
      'curl to javascript fetch',
      'curl command converter',
      'curl to go',
      'curl to httpie',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Targets', value: '8 languages' },
      { label: 'Handles', value: 'Headers, body, cookies' },
      { label: 'Runs', value: 'In your browser' },
    ],
    steps: [
      {
        title: 'Paste the command',
        body: 'A full command with flags, or a URL on its own. The parser understands the short and long forms of the common flags.',
      },
      {
        title: 'Pick a target',
        body: 'JavaScript fetch, Python requests, Go, PHP, Ruby, Rust, HTTPie or a plain fetch on the command line.',
      },
      {
        title: 'Copy the result',
        body: 'Headers, the request body, the method and the cookies are carried over. Values that need escaping are escaped.',
      },
    ],
    examples: [
      {
        caption: 'One command, three targets',
        headers: ['Target', 'Output'],
        rows: [
          ['`fetch`', '`await fetch(url, { method, headers, body })`'],
          ['`requests`', '`requests.post(url, headers=..., json=...)`'],
          ['`httpie`', '`http POST url "Key: value" key=value`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Documenting an API',
        body: 'A README that shows the request in curl and in three client languages is far more useful than one that shows only curl, which most people cannot read.',
      },
      {
        title: 'Debugging a client library',
        body: 'When a request works in curl and fails in your client, the difference is usually the body encoding or a header the library normalised. Comparing the two side by side finds it.',
      },
      {
        title: 'Migrating between runtimes',
        body: 'Moving a script from a shell to Node or Python, and needing the request in the new language without retyping it.',
      },
    ],
    notes: [
      {
        title: 'The body is where the conversions go wrong',
        body: 'A cURL command with --data carries a raw string. Whether that string is JSON, form-encoded or plain text determines the right call in the target language, and the tool infers JSON when the payload parses as JSON and falls back to a raw body otherwise.',
      },
      {
        title: 'Headers are case-insensitive, but libraries are not',
        body: 'HTTP header names are case-insensitive, so --header "content-type: application/json" and "Content-Type" mean the same thing. The converter lower-cases them for consistency, which is what most HTTP libraries do internally anyway.',
      },
    ],
    why: {
      title: 'The cURL command often carries a token',
        body: 'A command copied from the devtools usually includes an Authorization header with a live bearer token. Converting it on a server means sending that token to a third party, where it lands in a log. Converting it in the tab does not.',
      points: [
        'The command never leaves your browser.',
        'Eight targets, including the ones people actually use.',
        'The body, headers and cookies are carried over.',
        'A bearer token in the command is not transmitted anywhere.',
      ],
    },
    faq: [
      {
        q: 'Which languages are supported?',
        a: 'JavaScript fetch, Python requests, Go net/http, PHP cURL, Ruby net/http, Rust reqwest, HTTPie and a plain curl with the flags tidied up.',
      },
      {
        q: 'Does it handle the request body?',
        a: 'Yes. A --data payload is carried across, and when it parses as JSON it is emitted as a JSON body rather than as a raw string.',
      },
      {
        q: 'What about cookies and authentication flags?',
        a: 'A -b cookie string becomes a cookie header, and -u user:password becomes basic authentication in the target language.',
      },
      {
        q: 'Does it keep my headers exactly?',
        a: 'It keeps the header names and values, lower-casing the names for consistency. Duplicate headers of the same name are preserved as a list where the target language supports it.',
      },
      {
        q: 'Is the command uploaded anywhere?',
        a: 'No. The conversion runs in the browser, which matters because a cURL command copied from a browser almost always contains a live token.',
      },
      {
        q: 'Why did it not recognise my flag?',
        a: 'The parser covers the flags that appear in real commands. An unusual flag is reported as unsupported rather than being dropped silently, so you can see what was missed.',
      },
    ],
    related: ['http-status-codes', 'json-formatter', 'dotenv-editor', 'url-encoder'],
    updated: '2026-10-16',
  },

  {
    slug: 'case-converter',
    name: 'Case Converter',
    glyph: 'Aa',
    icon: 'letterCase',
    category: 'Developer Utilities',
    title: 'Case Converter — camelCase, snake_case and More',
    description:
      'Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, Title Case and more, with a live preview of every variant.',
    h1: 'Convert an identifier into every case style at once',
    lede: 'Naming is a small, constant annoyance: a value arrives in snake_case and the framework wants camelCase, or the opposite. This converts between all the common styles and shows every variant side by side so you can pick the right one.',
    keywords: [
      'case converter',
      'camelcase converter',
      'snake case to camel case',
      'kebab case converter',
      'pascal case converter',
      'convert string to camelcase online',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Styles', value: '10' },
      { label: 'Input', value: 'Any text' },
      { label: 'Bulk', value: 'One per line' },
    ],
    steps: [
      {
        title: 'Paste the identifier',
        body: 'One value, or a list with one per line. A whole list of column names converts at once.',
      },
      {
        title: 'Read the variants',
        body: 'Every style is shown at the same time, so you can see which one your codebase uses before you commit to it.',
      },
      {
        title: 'Copy the one you want',
        body: 'Each variant has its own copy button.',
      },
    ],
    examples: [
      {
        caption: 'One input, every style',
        headers: ['Style', 'Result'],
        rows: [
          ['`camelCase`', '`userAccountId`'],
          ['`PascalCase`', '`UserAccountId`'],
          ['`snake_case`', '`user_account_id`'],
          ['`kebab-case`', '`user-account-id`'],
          ['`CONSTANT_CASE`', '`USER_ACCOUNT_ID`'],
          ['`dot.case`', '`user.account.id`'],
          ['`Title Case`', '`User Account Id`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Migrating a database column',
        body: 'A column called `created_at` becomes `createdAt` in an ORM, or `CreatedAt` in a class, and picking the wrong one is a silent mismatch between your model and your schema.',
      },
      {
        title: 'Writing an API payload',
        body: 'Different APIs use different conventions, and the one you need depends on the service you are calling.',
      },
      {
        title: 'Cleaning up a batch of names',
        body: 'A list of field names from a spreadsheet converts to the style your codebase uses in one pass.',
      },
    ],
    notes: [
      {
        title: 'The words are detected, not the characters',
        body: 'The splitter looks for boundaries between lowercase and uppercase, between letters and digits, and between letters and underscores. That means `userID` becomes `user_id` and `HTTPServer` becomes `http_server`, which is usually what you want.',
      },
      {
        title: 'Acronyms are the hard case',
        body: '`parseURL` could split as `parse_url` or `parse_u_r_l`, and there is no way to know which without a dictionary. The tool assumes a run of capitals is one word, which is the common convention.',
      },
    ],
    why: {
      title: 'This is the most-repeated five seconds in a codebase',
      body: 'Every developer converts identifiers dozens of times a day, usually with a regular expression they half-remember. Getting the edge cases right once, in a tool that is open in a tab, is worth more than it sounds.',
      points: [
        'All ten styles at once, so you do not have to know the name of the one you want.',
        'A list converts in bulk, one value per line.',
        'Runs locally — an identifier is rarely a secret, but the list might be a schema.',
        'Each variant copies with one click.',
      ],
    },
    faq: [
      {
        q: 'How does it split words in an acronym?',
        a: 'A run of capitals is treated as one word, so `HTTPServer` becomes `http_server` and `parseURL` becomes `parse_url`. This is the convention used by most style guides, and the alternative is rarely what people want.',
      },
      {
        q: 'Can it convert a whole list?',
        a: 'Yes. Put one value per line and each line is converted independently.',
      },
      {
        q: 'What is the difference between snake_case and CONSTANT_CASE?',
        a: 'Only the casing. `CONSTANT_CASE` is the convention for constants and environment variables, so it is the same words in upper case with underscores.',
      },
      {
        q: 'Does it handle spaces?',
        a: 'Yes, spaces are treated as word boundaries, so `user account id` converts cleanly.',
      },
      {
        q: 'Will it break my identifiers?',
        a: 'It only changes casing and separators. Digits and the letters themselves are untouched, so a value like `user2FA` keeps its digits.',
      },
      {
        q: 'Is there a style I am missing?',
        a: 'The ten shown cover the conventions in common use. A style that does not appear can be built from any of them, and the words are the same either way.',
      },
    ],
    related: ['string-replace', 'json-formatter', 'regex-tester', 'utm-builder'],
    updated: '2026-10-16',
  },

  {
    slug: 'gitignore-generator',
    name: '.gitignore Generator',
    glyph: '.gi',
    icon: 'gitignore',
    category: 'Developer Utilities',
    title: '.gitignore Generator — Build One for Your Stack',
    description:
      'Generate a .gitignore file for your stack, with sensible defaults, editor files, OS files and language-specific entries. Copy it in one click.',
    h1: 'A .gitignore for your stack, without the copy-paste archaeology',
    lede: 'Every repository needs a .gitignore, and every repository gets one by copying the nearest example, which is how projects end up ignoring files they needed or missing files they did not. This builds one from what you actually use.',
    keywords: [
      'gitignore generator',
      'gitignore template',
      'create gitignore',
      'gitignore for node',
      'gitignore for python',
      'gitignore file online',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Stacks', value: '16' },
      { label: 'Groups', value: 'Editor, OS, secrets' },
      { label: 'Output', value: 'Ready to paste' },
    ],
    steps: [
      {
        title: 'Pick your stack',
        body: 'Node, Python, Go, Rust, Java, Ruby, PHP, .NET, Elixir, Swift, Kotlin, Terraform, Docker and more. You can select several.',
      },
      {
        title: 'Add the standard groups',
        body: 'Operating system files, editor and IDE directories, local environment files and build output. Most of them are wanted by everybody.',
      },
      {
        title: 'Copy the file',
        body: 'The result is a complete, commented .gitignore, ready to paste into the root of a repository.',
      },
    ],
    examples: [
      {
        caption: 'The sections you get',
        headers: ['Section', 'What it covers'],
        rows: [
          ['Operating system', '`.DS_Store`, `Thumbs.db`, `.Spotlight-V100`'],
          ['Editors', '`.vscode/`, `.idea/`, `*.swp`'],
          ['Environment', '`.env`, `.env.local`, `*.pem`'],
          ['Dependencies', '`node_modules/`, `vendor/`, `.venv/`'],
          ['Build output', '`dist/`, `build/`, `target/`'],
          ['Logs and caches', '`*.log`, `.cache/`, `__pycache__/`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Starting a new repository',
        body: 'A correct .gitignore from the first commit is much easier than adding one later, because a file that was already committed stays in the history.',
      },
      {
        title: 'Stopping a build artefact from being committed',
        body: 'A specific pattern added to the .gitignore stops the next commit, and the tool tells you the file is still tracked so you can untrack it.',
      },
      {
        title: 'Reviewing somebody else\'s repository',
        body: 'Checking what a repository ignores tells you what it is expected to build and which files are considered local.',
      },
    ],
    notes: [
      {
        title: 'Adding a pattern does not untrack a file',
        body: 'A .gitignore only affects files that are not already tracked. If a secret was committed, adding it to the .gitignore changes nothing and the secret stays in the history. It has to be removed from the index and, if it was a real credential, rotated.',
      },
      {
        title: 'The order of the patterns matters',
        body: 'Later patterns override earlier ones, so a broad rule followed by a narrow exception behaves the way you expect. The generated file groups the rules so exceptions are easy to add at the bottom.',
      },
    ],
    why: {
      title: 'A .gitignore is usually copied from a stranger',
        body: 'The most common .gitignore on GitHub is enormous, includes patterns for a hundred languages nobody in the project uses, and occasionally ignores something the project needs. A generated one contains what your stack actually produces.',
      points: [
        'Only the stacks you select, plus the universal groups.',
        'Commented, grouped and ordered so it stays readable.',
        'A reminder that ignoring a file is not the same as untracking it.',
        'Built in the browser, no account, nothing stored.',
      ],
    },
    faq: [
      {
        q: 'I already committed a secret. Is the .gitignore enough?',
        a: 'No. Ignoring a file does not remove it from the history. Remove it from the index, rewrite the history if it matters, and rotate the credential — a secret that was pushed should be considered compromised.',
      },
      {
        q: 'Should I ignore lock files?',
        a: 'No. Lock files should be committed, because they are what makes an install reproducible.',
      },
      {
        q: 'Why does it ignore .env?',
        a: 'Because environment files usually contain credentials and the local ones are machine-specific. Commit a .env.example with the keys and no values instead.',
      },
      {
        q: 'Can I add my own patterns?',
        a: 'Yes, and you should. The generated file is a starting point; put your project-specific exceptions at the bottom, where the ordering makes them win.',
      },
      {
        q: 'Does it include secrets?',
        a: 'It includes the common secret file names — .env, *.pem, *.key, credentials files — which is the behaviour most people want.',
      },
      {
        q: 'Is the file uploaded?',
        a: 'No. It is assembled in your browser and copied as text.',
      },
    ],
    related: ['dotenv-editor', 'case-converter', 'regex-tester', 'json-formatter'],
    updated: '2026-10-16',
  },
];

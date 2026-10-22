import type { ToolDef } from '../types';

export const formatTools: ToolDef[] = [
  {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    glyph: '{}',
    icon: 'braces',
    category: 'Format & Validate',
    title: 'JSON Formatter & Validator — Format JSON',
    description:
      'Format, validate and minify JSON in your browser. Catch syntax errors with the exact line and column, and nothing is uploaded.',
    h1: 'JSON formatter and validator that runs entirely in your browser',
    lede: 'Paste a JSON payload and get it pretty-printed, minified or rejected with the exact line and column of the offending character. Nothing is uploaded — the parser runs in the page you are reading.',
    keywords: [
      'json formatter',
      'json validator',
      'json beautifier',
      'format json online',
      'json minify',
      'check json validity',
      'json pretty print',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'cases', 'why', 'related'],
    facts: [
      { label: 'Runs on', value: 'Client-side' },
      { label: 'Payload limit', value: 'Unlimited' },
      { label: 'Server calls', value: 'Zero' },
    ],
    steps: [
      {
        title: 'Paste the payload',
        body: 'Drop your JSON into the input area. It re-validates on every keystroke, so the result below updates as you type.',
      },
      {
        title: 'Choose an output mode',
        body: 'Pretty-print with two or four space indentation, or minify to the smallest valid representation for API calls and cache keys.',
      },
      {
        title: 'Read the error location',
        body: 'If the payload is malformed the formatter reports the line and column of the failure and highlights the surrounding context so you can see what came before it.',
      },
      {
        title: 'Copy the result',
        body: 'One click copies the formatted output to your clipboard, ready to paste into a request body, a config file or a test fixture.',
      },
    ],
    cases: [
      {
        title: 'Debugging a rejected API request',
        body: 'A 400 from a third-party API usually means the body is not valid JSON. Formatting the raw string makes a trailing comma or a smart quote immediately obvious, and the error position points straight at the offending byte.',
      },
      {
        title: 'Shrinking payloads for logs and analytics',
        body: 'Minified JSON can be a third the size of pretty-printed JSON, which matters when you are shipping a payload to an analytics endpoint on every page view.',
      },
      {
        title: 'Generating test fixtures',
        body: 'Paste a response body, pretty-print it, and drop the result into a Jest or pytest fixture where a readable object beats a single 4 KB line.',
      },
    ],
    notes: [
      {
        title: 'Why line and column matter',
        body: 'A JSON syntax error at position 4,812 is useless. Most parsers give you an offset into a single-line string; this one converts the offset into a line, a column and a snippet of the surrounding text, which is the difference between a five-second fix and a five-minute one.',
      },
      {
        title: 'JSON is not a configuration format',
        body: 'JSON does not support comments, trailing commas or unquoted keys. If you are parsing a file that contains them, it is probably JSONC, JSON5 or HJSON rather than JSON, and it will fail here by design.',
      },
    ],
    why: {
      title: 'Why format JSON here instead of on a server-side formatter',
      body: 'Server-side formatters are a liability when the payload is a credential, a customer record or an internal API response. Because this tool parses with the browser’s own JSON engine, the only machine that ever sees your data is the one you are already using.',
      points: [
        'Nothing is transmitted — you can verify it by opening DevTools and watching the Network panel stay empty.',
        'No account, no sign-up wall, no rate limit.',
        'Works offline once the page has loaded.',
        'Large payloads are handled by the same engine your application would use.',
      ],
    },
    faq: [
      {
        q: 'Is my JSON sent to a server?',
        a: 'No. Parsing happens with the native JSON engine in your browser. The page makes no network requests once loaded, so a payload containing API keys or personal data never leaves your machine.',
      },
      {
        q: 'How large a payload can I format?',
        a: 'There is no explicit cap. The practical limit is the memory your browser tab has available, which in practice means payloads in the tens of megabytes format comfortably.',
      },
      {
        q: 'Why does my valid JSON fail to parse?',
        a: 'Three causes account for almost every failure: a trailing comma before a closing brace, single quotes instead of double quotes, or an unquoted key. The error output points at the exact position so you can check those three things first.',
      },
      {
        q: 'Does the formatter change my data?',
        a: 'No. Formatting only changes whitespace. Key order, number formatting such as 1e3 versus 1000, string escapes and duplicate keys are preserved exactly as they were in the input.',
      },
      {
        q: 'What is the difference between JSON formatting and minification?',
        a: 'Formatting adds indentation and line breaks so a human can read the structure; minification removes every optional whitespace character so a machine can transfer it. Both produce the same data. This tool does both with one toggle.',
      },
      {
        q: 'Can I use this on a phone?',
        a: 'Yes. The layout collapses to a single column, the output box scrolls independently and the copy button still works, because everything runs locally rather than through a resize-dependent desktop layout.',
      },
    ],
    related: ['json-diff', 'json-schema-generator', 'json-to-csv', 'yaml-to-json'],
    updated: '2026-10-12',
  },

  {
    slug: 'yaml-to-json',
    name: 'YAML → JSON Converter',
    glyph: 'Y→',
    icon: 'yaml',
    category: 'Format & Validate',
    title: 'YAML to JSON Converter — Convert YAML Online',
    description:
      'Convert YAML to JSON instantly in your browser. Handles anchors, multi-line strings, flow style and multiple documents.',
    h1: 'YAML to JSON converter with line-accurate error reporting',
    lede: 'YAML is forgiving to write and unforgiving to debug. This converter parses your document, resolves anchors and aliases, and hands back JSON that you can paste straight into a JavaScript config or an HTTP request body.',
    keywords: [
      'yaml to json',
      'convert yaml to json',
      'yaml converter',
      'yaml parser online',
      'yaml to json online',
      'parse yaml',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'why', 'related'],
    facts: [
      { label: 'YAML dialects', value: 'YAML 1.2 core' },
      { label: 'Documents', value: 'Multi-doc supported' },
      { label: 'Uploads', value: 'None' },
    ],
    steps: [
      {
        title: 'Paste your YAML',
        body: 'The source pane accepts block style, flow style and documents separated by --- markers.',
      },
      {
        title: 'Convert',
        body: 'The converter emits the JSON equivalent with two-space indentation. Anchors and merge keys are resolved into their expanded values.',
      },
      {
        title: 'Fix anything it flags',
        body: 'When the document cannot be parsed, the error names the line and column and shows the offending line so you can correct it without counting characters.',
      },
    ],
    examples: [
      {
        caption: 'Common YAML shapes and the JSON they produce',
        headers: ['YAML', 'JSON'],
        rows: [
          ['`name: devsnap`', '`{"name": "devsnap"}`'],
          ['`ports: [80, 443]`', '`{"ports": [80, 443]}`'],
          ['`on:\n  push:\n    branches: [main]`', '`{"on": {"push": {"branches": ["main"]}}}`'],
          ['`base: &b\n  retries: 3`', '`{"base": {"retries": 3}}`'],
        ],
      },
    ],
    notes: [
      {
        title: 'Indentation is the whole language',
        body: 'YAML uses spaces for structure, and a tab character is a hard error rather than a warning. If a document fails at an unexpected line, look for a tab that snuck in from an editor, and for a child key that is indented less than its parent.',
      },
      {
        title: 'The Norway problem',
        body: 'YAML 1.1 treats the bare tokens `no`, `yes`, `on` and `off` as booleans, so a country code of `NO` becomes `false` in a 1.1 parser. This converter follows YAML 1.2, where only `true` and `false` are booleans, which is what Kubernetes and most modern tooling expects.',
      },
    ],
    why: {
      title: 'A converter that does not keep a copy of your config',
      body: 'Configuration files are the most sensitive files a developer owns. They routinely contain registry credentials, database URLs and internal hostnames. Sending one to a conversion API means adding another party to that list, which is why this one converts in the tab.',
      points: [
        'Your file is parsed locally and never transmitted.',
        'YAML 1.2 semantics, so `NO` stays a string.',
        'Anchors, aliases and merge keys are resolved the way your runtime resolves them.',
        'Multiple documents separated by --- are converted one after another.',
      ],
    },
    faq: [
      {
        q: 'Can I convert JSON back to YAML as well?',
        a: 'The converter handles YAML in, JSON out. If you need the reverse direction, the JSON formatter gives you the same parsed structure and you can serialise it with whichever YAML library your project already uses.',
      },
      {
        q: 'Does it support YAML anchors and aliases?',
        a: 'Yes. An anchor defined with & and referenced with an alias or a merge key with << are expanded into the output, matching the behaviour of a standard YAML loader at runtime.',
      },
      {
        q: 'What is the difference between YAML 1.1 and YAML 1.2?',
        a: 'YAML 1.1 has legacy type coercions — `yes`, `no`, `on` and `off` become booleans and sexagesimal numbers are allowed. YAML 1.2 narrows those to `true` and `false`. The converter uses 1.2 because that is what Kubernetes, GitHub Actions and most current libraries implement.',
      },
      {
        q: 'Why does my Kubernetes manifest fail to parse?',
        a: 'Usually one of three things: a tab used for indentation, a `---` document separator that leaves trailing content, or a value that contains a colon followed by a space without being quoted.',
      },
      {
        q: 'How do I convert a multi-document YAML file?',
        a: 'Paste the whole file. Documents separated by --- are parsed independently and each one is emitted as its own JSON object, in order.',
      },
      {
        q: 'Is there a size limit?',
        a: 'No explicit limit. Very large documents are limited by the memory available to the browser tab, which is generous for the configuration-sized files this tool is built for.',
      },
    ],
    related: ['json-formatter', 'json-schema-generator', 'diff-checker', 'dotenv-editor'],
    updated: '2026-10-08',
  },

  {
    slug: 'xml-formatter',
    name: 'XML Formatter & Minifier',
    glyph: '<>',
    icon: 'xml',
    category: 'Format & Validate',
    title: 'XML Formatter & Minifier — Format XML Online',
    description:
      'Pretty-print or minify XML in your browser. Validates well-formedness, reports the exact line of a mismatched tag and strips comments.',
    h1: 'Format, validate and minify XML without uploading it',
    lede: 'Unformatted XML is miserable to read and hard to diff in review. This tool indents your document, flags mismatched or unclosed tags at the exact line, and can strip the whitespace and comments for a smaller payload.',
    keywords: [
      'xml formatter',
      'xml pretty print',
      'xml minifier',
      'format xml online',
      'xml validator',
      'xmllint alternative',
    ],
    layout: ['facts', 'tool', 'steps', 'cases', 'faq', 'notes', 'related'],
    facts: [
      { label: 'Output', value: 'Indented or minified' },
      { label: 'Comments', value: 'Optional removal' },
      { label: 'Encoding', value: 'UTF-8' },
    ],
    steps: [
      {
        title: 'Paste the XML',
        body: 'Works with SOAP envelopes, RSS feeds, SVG documents, Maven POMs and generic config XML alike.',
      },
      {
        title: 'Format or minify',
        body: 'Formatting produces a predictable two-space indentation with attributes kept on a single line. Minifying removes the whitespace between elements and, optionally, every comment.',
      },
      {
        title: 'Resolve reported errors',
        body: 'A mismatched closing tag is reported with the line it appears on and the tag it was expected to close, so the fix is a single edit rather than a hunt.',
      },
    ],
    cases: [
      {
        title: 'Comparing two API responses',
        body: 'Two semantically identical XML responses are impossible to diff when every element sits on one line. Formatting both sides with the same indentation makes a missing attribute pop out immediately.',
      },
      {
        title: 'Shrinking a template payload',
        body: 'Removing indentation and comments can cut an XML document by a third, which is meaningful when it is embedded in a SOAP request that crosses a network on every call.',
      },
      {
        title: 'Reading a generated file',
        body: 'Maven POM files and exported RSS feeds are painful to read unformatted. One pass through the formatter makes them navigable.',
      },
    ],
    notes: [
      {
        title: 'What "well-formed" means here',
        body: 'The formatter checks the rules a browser or an XML parser enforces: matching tag names, properly nested elements, a single root element, quoted attribute values and no unescaped ampersands. It does not validate against a schema — that is a different problem with a different tool.',
      },
    ],
    why: {
      title: 'XML usually contains things you would rather not share',
      body: 'A SOAP envelope for a payroll or healthcare system contains identifiers, credentials and internal endpoint URLs. Formatting it through a third-party service means transmitting all of it. Doing it locally removes the question entirely.',
      points: [
        'Parsing happens in the browser tab.',
        'Comments and CDATA blocks are preserved unless you ask to remove them.',
        'Self-closing tags stay self-closing.',
        'The XML declaration is preserved exactly as written.',
      ],
    },
    faq: [
      {
        q: 'Does it validate against an XSD or DTD?',
        a: 'No. It validates well-formedness, which is the structural layer: balanced tags, valid attributes, a single root. Schema validation is a separate, heavier operation and is not what this tool does.',
      },
      {
        q: 'What happens to comments and CDATA when I minify?',
        a: 'Minifying leaves comments alone unless you tick the option to strip them. CDATA sections are always preserved, because removing them would change the character content of their parent element.',
      },
      {
        q: 'How do I escape an ampersand?',
        a: 'Write &amp; in the source. A bare & is one of the most common XML parse errors and the formatter reports the line where it appears.',
      },
      {
        q: 'Can it handle very large XML files?',
        a: 'Files of a few megabytes are comfortable. Beyond that, the browser tab becomes the limiting factor rather than the tool.',
      },
      {
        q: 'Does it preserve the XML declaration?',
        a: 'Yes. The declaration, including its encoding attribute, is copied through unchanged when it sits on the first line.',
      },
      {
        q: 'Can I format an SVG file?',
        a: 'Yes, and it is one of the more common uses here. An SVG exported from a design tool is a single long line; formatting it makes the path structure readable, and minifying it reduces the bytes in your page.',
      },
    ],
    related: ['json-formatter', 'html-entity-encoder', 'diff-checker', 'json-to-csv'],
    updated: '2026-09-30',
  },

  {
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    glyph: 'SQL',
    icon: 'database',
    category: 'Format & Validate',
    title: 'SQL Formatter — Format SQL Queries Online',
    description:
      'Format SQL into readable, consistently indented queries. Supports SELECT, JOIN, CTEs, subqueries and window functions, with keyword casing.',
    h1: 'Format SQL into something a human can review',
    lede: 'A 300-line query dumped from a log is unreviewable. This formatter normalises indentation, capitalises keywords, lines up SELECT lists and breaks long JOIN chains across separate lines, without touching your dialect.',
    keywords: [
      'sql formatter',
      'format sql query',
      'sql beautifier',
      'pretty print sql',
      'sql code formatter online',
      'format sql for postgres',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Dialects', value: 'ANSI, PostgreSQL, MySQL' },
      { label: 'Keyword casing', value: 'Up, down or preserve' },
      { label: 'Parsing', value: 'In-browser' },
    ],
    steps: [
      {
        title: 'Paste the query',
        body: 'A single statement or a full script with several statements separated by semicolons both work.',
      },
      {
        title: 'Pick a style',
        body: 'Choose the indentation width and whether keywords are upper-cased, lower-cased or left exactly as you typed them.',
      },
      {
        title: 'Copy the formatted SQL',
        body: 'The output keeps your identifiers, string literals and comments intact — only whitespace and keyword casing are changed.',
      },
    ],
    examples: [
      {
        caption: 'Before and after on a typical join',
        headers: ['Input', 'Output'],
        rows: [
          [
            '`select o.id,o.total from orders o join customers c on c.id=o.customer_id where o.status=\'paid\' order by o.total desc`',
            '`SELECT\n  o.id,\n  o.total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = \'paid\'\nORDER BY o.total DESC`',
          ],
        ],
      },
      {
        caption: 'A CTE expands onto its own lines',
        headers: ['Construct', 'Formatted result'],
        rows: [
          ['`WITH recent AS (SELECT * FROM events WHERE created_at > now() - interval \'7 days\') SELECT count(*) FROM recent`', 'The CTE body is indented one level under `WITH`, and the outer `SELECT` returns to the left margin.'],
        ],
      },
    ],
    cases: [
      {
        title: 'Reviewing a query in a pull request',
        body: 'Formatting both sides of a diff with the same tool makes a real logic change visible. Without it, a reindented query can bury a changed WHERE clause in hundreds of lines of noise.',
      },
      {
        title: 'Reading a query out of application logs',
        body: 'Logged SQL arrives as a single string with no whitespace. Running it through the formatter gives you something you can read in a terminal.',
      },
      {
        title: 'Standardising a legacy codebase',
        body: 'A formatting pass with a fixed style gives a team one canonical shape for every query, which is worth more than it sounds once the diffs start to shrink.',
      },
    ],
    notes: [
      {
        title: 'Comments and literals are left alone',
        body: 'A `--` comment keeps its text, and a string literal such as `\'CASE WHEN\'` is not treated as a keyword. That distinction matters: a naive formatter will happily upper-case the word inside your quoted data.',
      },
      {
        title: 'Window functions and CTEs are first-class',
        body: 'The formatter understands `OVER (...)`, `WITH ... AS`, `FILTER (WHERE ...)` and common table expressions, so the indentation reflects real structure instead of just counting parentheses.',
      },
    ],
    why: {
      title: 'Readability is a security property',
      body: 'The most common cause of a production incident in a data pipeline is a WHERE clause that was quietly altered. Reviewing SQL is far easier when every query in the repository has the same shape, and this tool lets you set that shape in one place.',
      points: [
        'Works on SELECT, INSERT, UPDATE, DELETE, DDL and multi-statement scripts.',
        'Never modifies string literals or identifiers.',
        'Choose 2, 4 or 8 space indentation.',
        'Handles CTEs, subqueries, window functions and set operations.',
      ],
    },
    faq: [
      {
        q: 'Will the formatter change my query?',
        a: 'No. It only changes whitespace and, if you ask for it, the casing of SQL keywords. Table names, column names, string literals and comments are left byte-for-byte identical.',
      },
      {
        q: 'Does it support PostgreSQL, MySQL or BigQuery syntax?',
        a: 'It handles the common syntax shared across those dialects, including CTEs, window functions, `INSERT ... ON CONFLICT`, `FILTER` clauses and array literals. Vendor-specific procedural syntax inside a `DO` or `BEGIN` block is preserved but not re-indented.',
      },
      {
        q: 'How do I keep my table and column names lowercase?',
        a: 'Use the "preserve" keyword casing option. Only whitespace and layout are then adjusted, and your identifiers stay exactly as you wrote them.',
      },
      {
        q: 'Can it format a script with several statements?',
        a: 'Yes. Statements separated by semicolons are formatted individually and kept in order.',
      },
      {
        q: 'Does it reformat a stored procedure body?',
        a: 'It preserves the body as a block of text and formats the surrounding statement. Dialect-specific procedural bodies are not re-indented internally because doing so safely requires a full parser for that dialect.',
      },
      {
        q: 'Why is there no "execute" button?',
        a: 'Because there is no server to execute against. The tool never receives a connection string, which is exactly why it is safe to paste a query that points at a production database.',
      },
    ],
    related: ['json-formatter', 'diff-checker', 'regex-tester', 'http-status-codes'],
    updated: '2026-10-15',
  },

  {
    slug: 'csv-to-json',
    name: 'CSV → JSON Converter',
    glyph: 'C→',
    icon: 'tableArrow',
    category: 'Format & Validate',
    title: 'CSV to JSON Converter — Convert CSV to JSON Online',
    description:
      'Convert CSV to JSON in your browser with control over delimiters, quote handling and type inference. Ragged rows are reported.',
    h1: 'Turn a CSV export into JSON without uploading the file',
    lede: 'Spreadsheet exports arrive with inconsistent delimiters, stray quotes and columns that mix numbers and text. This converter lets you pick the separator, decide how headers are treated, and choose whether values are coerced into numbers, booleans and nulls.',
    keywords: [
      'csv to json',
      'convert csv to json online',
      'csv converter',
      'csv to json python alternative',
      'parse csv online',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'cases', 'notes', 'related'],
    facts: [
      { label: 'Delimiter', value: 'Auto-detected' },
      { label: 'Type coercion', value: 'Optional' },
      { label: 'Rows', value: 'Any number' },
    ],
    steps: [
      {
        title: 'Paste the CSV',
        body: 'Or drop a file onto the input. The first few lines are analysed to detect the delimiter, whether the first row is a header, and whether any field contains a delimiter that must be quoted.',
      },
      {
        title: 'Set the conversion rules',
        body: 'Override the delimiter if the detection is wrong, choose between an array of objects and a single keyed object, and decide whether numbers, booleans and empty strings should be typed or kept as text.',
      },
      {
        title: 'Copy the JSON',
        body: 'The output is pretty-printed by default so it stays readable, and every row becomes an object keyed by the header names.',
      },
    ],
    cases: [
      {
        title: 'Feeding an analytics export into a script',
        body: 'A CSV of product rows becomes a JSON array you can paste into a Node script, a fetch body or a fixture, without writing a parsing step first.',
      },
      {
        title: 'Migrating a spreadsheet into a database seed',
        body: 'Type inference turns an "amount" column of 12.50 into a number rather than a string, which is what a seed file for a numeric column expects.',
      },
      {
        title: 'Debugging a broken import',
        body: 'When a CSV import rejects row 47, the converter shows you how that row was parsed, so you can see whether the problem is a stray quote or a ragged column count.',
      },
    ],
    notes: [
      {
        title: 'Type inference is a double-edged tool',
        body: 'A zip code of 01234 becomes the number 1234 if you enable inference, and a postal code is a string in every country on earth. Leave inference off for identifiers, phone numbers, postcodes and any column with leading zeros.',
      },
      {
        title: 'Ragged rows are reported, not silently padded',
        body: 'A row with more fields than the header, or fewer, is flagged. Padding it silently is the fastest way to hide a real data problem.',
      },
    ],
    why: {
      title: 'Business exports are full of confidential data',
        body: 'A customer list with names, emails, order history and partial payment details is exactly the kind of file that should not be pasted into a form that posts to a stranger’s server. Converting it locally keeps that decision yours.',
      points: [
        'The file never leaves your browser.',
        'Delimiter, header and type rules are all under your control.',
        'Quoted fields with embedded newlines are handled correctly.',
        'Ragged rows are surfaced instead of hidden.',
      ],
    },
    faq: [
      {
        q: 'How does it detect the delimiter?',
        a: 'It counts the occurrences of comma, semicolon, tab and pipe across the first lines and picks the most consistent one. You can always override the choice with the delimiter selector.',
      },
      {
        q: 'Should I enable type inference?',
        a: 'Only for genuinely numeric or boolean columns. Keep it off for postcodes, phone numbers, account numbers, product codes and any value that may start with a zero.',
      },
      {
        q: 'What happens to rows with the wrong number of columns?',
        a: 'They are counted and reported in the output summary, and the extra or missing fields are marked so you can see the problem instead of having it silently absorbed.',
      },
      {
        q: 'Can I convert a file with quotes inside fields?',
        a: 'Yes. A field wrapped in double quotes may contain commas, newlines and escaped double quotes, and the parser reads it as a single value.',
      },
      {
        q: 'Does it handle UTF-8 characters and accents?',
        a: 'Yes. UTF-8 is the expected encoding, and accented letters, emoji and non-Latin scripts survive the conversion unchanged.',
      },
      {
        q: 'Can I get a keyed object instead of an array?',
        a: 'Yes. Choose the object output and pick which column becomes the key — a common pattern is to key the records by an id column.',
      },
    ],
    related: ['json-to-csv', 'json-formatter', 'json-diff', 'dotenv-editor'],
    updated: '2026-10-02',
  },

  {
    slug: 'json-to-csv',
    name: 'JSON → CSV Converter',
    glyph: '→C',
    icon: 'table',
    category: 'Format & Validate',
    title: 'JSON to CSV Converter — Convert JSON to CSV Online',
    description:
      'Convert a JSON array or object into CSV with flattened nested keys, custom delimiters and a header built from every record.',
    h1: 'Convert JSON to CSV, including the nested parts',
    lede: 'Flattening a nested JSON document is the tedious part of every JSON-to-CSV conversion: decide how to name a key that is three levels down, decide what to do with an array, and make sure no row is misaligned. This converter handles all three.',
    keywords: [
      'json to csv',
      'convert json to csv online',
      'json to csv converter',
      'flatten json to csv',
      'array to csv',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'why', 'related'],
    facts: [
      { label: 'Nesting', value: 'Flattened' },
      { label: 'Delimiter', value: 'Configurable' },
      { label: 'Header', value: 'Auto-derived' },
    ],
    steps: [
      {
        title: 'Paste the JSON',
        body: 'An array of objects works directly. A single object is treated as one row, and an object whose values are arrays is treated as a set of rows.',
      },
      {
        title: 'Choose the flattening rule',
        body: 'Nested objects become dotted keys such as `user.address.city`. Arrays of scalars are joined with a separator, and arrays of objects get an index in the key.',
      },
      {
        title: 'Copy the CSV',
        body: 'The header row is derived from the union of all keys across all records, so a field missing in one row still gets a column and an empty cell.',
      },
    ],
    examples: [
      {
        caption: 'How nested structures are flattened',
        headers: ['JSON path', 'CSV column'],
        rows: [
          ['`user.address.city`', '`user.address.city`'],
          ['`tags: ["a","b"]`', '`tags` (values joined by `; `)'],
          ['`items[0].sku`', '`items.0.sku`'],
          ['`id`', '`id`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Importing records into a spreadsheet',
        body: 'A JSON API response becomes a CSV you can open in Excel or Google Sheets, filter and pivot without writing a script first.',
      },
      {
        title: 'Feeding a CRM import',
        body: 'Most bulk import tools want a flat CSV with a fixed header. Flattening here means the file is ready before you upload it.',
      },
      {
        title: 'Handing a report to someone who uses Excel',
        body: 'Engineers and analysts live in different tools. A one-way JSON to CSV export removes a whole category of back-and-forth.',
      },
    ],
    notes: [
      {
        title: 'The union header rule',
        body: 'Headers are computed from every record, not just the first. If record three has a key the first record lacks, that key still gets a column and the first two rows simply leave it blank. Deriving headers from the first record alone is the most common way these conversions go wrong.',
      },
    ],
    why: {
      title: 'Flattening is a decision, so it should be visible',
      body: 'Every JSON to CSV converter has to make choices about nested keys and arrays. Hiding those choices behind a download button means you find out about them in Excel. Here the rule is stated on the page and the output shows the exact column names it produced.',
      points: [
        'Dotted key paths make the flattening explicit.',
        'The header is the union of all keys, so no row silently loses a column.',
        'Delimiter and quoting are configurable for European locales.',
        'Numbers and booleans can be emitted as-is or as quoted text.',
      ],
    },
    faq: [
      {
        q: 'How are nested objects converted?',
        a: 'They are flattened into dotted keys. An address object at user.address becomes the column `user.address.city`, and every leaf value in the tree gets its own column.',
      },
      {
        q: 'What happens to arrays?',
        a: 'An array of scalars is joined into a single cell with a separator you can change. An array of objects gets an index in the key path, so `items.0.sku` and `items.1.sku` become separate columns.',
      },
      {
        q: 'Can I change the delimiter to a semicolon?',
        a: 'Yes. Comma, semicolon, tab and pipe are available, which matters for locales where Excel expects a semicolon as the list separator.',
      },
      {
        q: 'Why is a column missing from my output?',
        a: 'It is only missing if no record in the input contained it. Because the header is the union of all keys, a field that appears in a single record still produces a column — the other rows simply have an empty cell.',
      },
      {
        q: 'Does the converter handle a top-level object that is not an array?',
        a: 'Yes. A single object becomes one row, and an object whose values are arrays of objects becomes one row per nested object.',
      },
      {
        q: 'Are values quoted automatically?',
        a: 'Only when they need it — a value containing the delimiter, a quote character or a newline is quoted and internal quotes are doubled, so the result opens cleanly in any spreadsheet.',
      },
    ],
    related: ['csv-to-json', 'json-formatter', 'json-diff', 'json-schema-generator'],
    updated: '2026-09-26',
  },

  {
    slug: 'html-entity-encoder',
    name: 'HTML Entity Encoder',
    glyph: '&',
    icon: 'entity',
    category: 'Format & Validate',
    title: 'HTML Entity Encoder & Decoder — Escape HTML',
    description:
      'Encode text to HTML entities or decode entities back to plain text. Handles named entities and numeric references.',
    h1: 'Encode and decode HTML entities in your browser',
    lede: 'Escaping user input is the difference between rendering a name and executing a script. This tool converts text to HTML entities and back again, covering named entities, decimal references and hexadecimal code points.',
    keywords: [
      'html entity encoder',
      'html entity decoder',
      'escape html online',
      'html escape',
      'decode html entities',
      'unicode to html entity',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Named entities', value: 'HTML5 set' },
      { label: 'Numeric refs', value: 'Decimal + hex' },
      { label: 'Direction', value: 'Encode / decode' },
    ],
    steps: [
      {
        title: 'Paste the text',
        body: 'Paste raw text to escape it, or paste a fragment containing &amp; and &copy; to decode it. The mode toggle switches between the two.',
      },
      {
        title: 'Choose the scope',
        body: 'Escape everything including quotes and slashes for maximum safety, or escape only the characters that break out of HTML text content.',
      },
      {
        title: 'Copy the escaped result',
        body: 'The output contains only the characters you need, so it can be dropped into an attribute, a text node or a JavaScript string.',
      },
    ],
    cases: [
      {
        title: 'Storing user input safely',
        body: 'Before a comment or a display name is written into a page, escaping it removes any possibility that the value is interpreted as markup. Escape at the point of output, not at the point of input.',
      },
      {
        title: 'Cleaning up scraped content',
        body: 'Text pulled from an old site or a CMS export is often full of entities. Decoding first makes it searchable and comparable with plain-text sources.',
      },
      {
        title: 'Preparing content for an XML document',
        body: 'XML only recognises five named entities, so numeric references are the portable choice when a value contains an ampersand, a less-than sign or a quote.',
      },
    ],
    notes: [
      {
        title: 'Encode at output time',
        body: 'Storing pre-escaped data means you have to guess at every future context it might be rendered in. Escaping at the point where the value enters the HTML means each context can decide for itself — and you stop double-escaping existing entities.',
      },
    ],
    why: {
      title: 'Escaping a value is a security decision',
      body: 'A value that is escaped in one context and not another is a stored cross-site scripting bug waiting to happen. Doing the escaping locally keeps the decision in the code you are writing, and keeps the string out of a third-party log.',
      points: [
        'Named entities from the HTML5 set, plus decimal and hex numeric references.',
        'A minimal mode that escapes only the five characters that matter for text content.',
        'A maximum mode that also escapes quotes and slashes for attribute contexts.',
        'No network requests, so the string never lands in a log.',
      ],
    },
    faq: [
      {
        q: 'Which characters need escaping?',
        a: 'In HTML text content, the ampersand, the less-than sign and the greater-than sign matter. Inside an attribute value you also need to escape double quotes. The strict mode escapes all of those plus the single quote and the slash.',
      },
      {
        q: 'What is the difference between &#38; and &amp;?',
        a: 'They mean the same thing. The named form &amp; is more readable, the numeric form &#38; is shorter and is the only portable option in XML.',
      },
      {
        q: 'Does the decoder handle numeric references?',
        a: 'Yes. Both decimal references such as `&#8212;` and hexadecimal references such as `&#x2014;` are decoded, along with the named HTML5 entities.',
      },
      {
        q: 'Will decoding fix broken HTML?',
        a: 'No. It converts entity references back into characters. It does not repair unbalanced tags, and it cannot recover text that was already mangled before it reached you.',
      },
      {
        q: 'Should I escape the ampersand in a URL?',
        a: 'Inside HTML text, yes — a bare ampersand in a query string is invalid HTML even though browsers tolerate it. Inside a URL, the ampersand is usually correct as-is; encode it as %26 only when it is part of a parameter value.',
      },
      {
        q: 'Does this tool protect against XSS on its own?',
        a: 'Escaping is one layer, not the whole defence. Output encoding matters, but so do a strict Content Security Policy, avoiding unsafe DOM APIs such as innerHTML on untrusted strings, and validating URLs before you put them in an href.',
      },
    ],
    related: ['json-formatter', 'xml-formatter', 'regex-tester', 'url-encoder'],
    updated: '2026-09-22',
  },
];

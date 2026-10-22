import type { GuideDef } from './guides';

/**
 * The second block of guides.
 *
 * These were picked because they cover a search intent the first block did
 * not: the recurring developer questions that produce tutorials, forum
 * answers and documentation links. A guide is the only thing on this site
 * that earns links slowly and permanently, so the topics are chosen for the
 * questions people actually ask rather than for the tools they point at.
 */
export const guidesExtra: GuideDef[] = [
  {
    slug: 'common-json-errors',
    title: 'Common JSON Errors and How to Fix Them',
    description:
      'The six JSON mistakes behind almost every parse error: trailing commas, single quotes, unquoted keys, comments, smart quotes and truncation.',
    h1: 'The six JSON mistakes that cause almost every parse error',
    lede: 'A JSON parse error tells you where the problem is, not what it is. In practice the cause is one of a short list, and each one has a different fix.',
    readingTime: '7 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'Unexpected end of JSON input',
        paragraphs: [
          'The single most common error, and the least obvious, because the parser is telling you that the document ended before it was finished. The usual causes are a truncated network response, a body that was cut off in a log, or a string that was closed early.',
          'If the payload came from a network call, the first thing to check is the length. A response that is 1,024 bytes long when you expected 4,096 is a truncated response, not a malformed document.',
        ],
        code: `// The parser points at the end because the document simply stops there.
{
  "id": 42,
  "name": "Ada"      <-- no closing brace
`,
        list: [
          'Check whether the response was truncated in transit.',
          'Check whether a string contains an unescaped quote that closed it early.',
          'Check whether you are parsing a log line rather than the payload.',
        ],
      },
      {
        heading: 'Trailing comma',
        paragraphs: [
          'A comma after the last item in an object or an array is not valid JSON, and it is the mistake that gets introduced most often, because it is legal in JavaScript, in Python and in most configuration formats.',
          'The error position points at the comma, which is confusing, because the actual problem is the character after it. Look one character to the right of the reported position.',
        ],
        code: `{
  "id": 42,
  "name": "Ada",     <-- this comma
}`,
      },
      {
        heading: 'Single quotes instead of double quotes',
        paragraphs: [
          'JSON requires double quotes around every string and every key. Single quotes are valid JavaScript, valid Python and valid YAML, which is exactly why they survive a copy-paste from a chat window or a Python dictionary.',
          'The error usually appears on the very first quote, which is a useful signal: if a document starts with a single quote, the whole file is probably single-quoted.',
        ],
      },
      {
        heading: 'Unquoted keys',
        paragraphs: [
          'JavaScript object literals do not need quotes around keys when they are valid identifiers, and neither does Python. JSON does. The parser reports the position of the key, which makes it easy to fix once you know what you are looking at.',
        ],
        code: `{ id: 42, name: "Ada" }   // JavaScript
{ "id": 42, "name": "Ada" }   // JSON`,
      },
      {
        heading: 'Comments',
        paragraphs: [
          'JSON has no comment syntax, which is an old decision that JSONC, JSON5 and HJSON were invented to work around. If a file has `//` or `/* */` in it, it is one of those formats, and a strict JSON parser will reject it.',
          'The practical fix is to strip the comments before parsing, which has to be done with a parser that understands strings, because a `//` inside a string is not a comment.',
        ],
      },
      {
        heading: 'Smart quotes and invisible characters',
        paragraphs: [
          'A document that came out of a word processor, a chat application or a PDF can contain typographic quotation marks, a non-breaking space or a zero-width space. All of them are valid characters in a JSON string and none of them are what you meant.',
          'The error position is a character in the middle of a key, and the character at that position is not the one on your screen. Replacing the smart quotes with straight ones usually fixes it, and the BOM at the start of a UTF-8 file exported from Windows is the same class of problem.',
        ],
        list: [
          '`“` and `”` should be `"`',
          'The typographic single quotes `‘` and `’` become a straight ASCII apostrophe (U+0027)',
          'A zero-width space is invisible in most editors. A hex dump finds it.',
          'A byte order mark at the start of the file is a common cause of an error reported at position 0.',
        ],
      },
    ],
    takeaways: [
      'Look one character to the right of the reported position; the parser blames the character before the problem.',
      'Trailing commas, single quotes and unquoted keys are legal in most other languages, which is why they survive.',
      '"Unexpected end of input" usually means a truncated response, not a syntax error.',
      'Smart quotes and a byte order mark are invisible causes that a hex dump will find.',
    ],
    relatedTools: ['json-repair', 'json-formatter', 'json-diff', 'json-schema-validator'],
  },

  {
    slug: 'base64-is-not-encryption',
    title: 'Base64 Is Not Encryption',
    description:
      'What Base64 actually does, why it is not a security measure, when it is the right tool, and the three cases where people reach for it by mistake.',
    h1: 'Base64 is a transport encoding, not a secret',
    lede: 'Base64 appears in security advice often enough that people assume it protects something. It does not. It is a way of writing binary data using characters that survive systems which only handle text.',
    readingTime: '6 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'What it does',
        paragraphs: [
          'Base64 maps every three bytes of binary data onto four printable characters from a 64-character alphabet. That expansion is why the output is a third larger than the input, and it is why a JPEG becomes a long line of text that can be pasted into a JSON body or an email header without corrupting anything.',
          'The alphabet has two variants. The standard one uses `+` and `/`, and the URL-safe one uses `-` and `_` and usually drops the padding, which is what a JWT and a URL query parameter require.',
        ],
        list: [
          'Standard: `A-Z a-z 0-9 + /` with `=` padding',
          'URL-safe: `A-Z a-z 0-9 - _` without padding',
          'The conversion is reversible by anyone, in one step, with no key.',
        ],
      },
      {
        heading: 'Why it is not encryption',
        paragraphs: [
          'Encryption needs a key. Base64 has none, so anybody who can see the string can decode it. The decode is a single function call in every language, and the online version of it is a text box.',
          'The base64 of a secret is not a secret. If a credential is base64-encoded in a configuration file, in a URL, in a log line or in a database column, it is a plaintext credential with extra characters. It has to be protected exactly like the plaintext would be, which usually means it should not be stored there at all.',
        ],
        code: `// This is not protection.
const encoded = btoa(password);

// This is the same password.
console.log(atob(encoded));`,
      },
      {
        heading: 'The three cases where people reach for it by mistake',
        paragraphs: [
          'The first is hiding a password. The second is signing a payload, where the right tool is HMAC or a signature over the original bytes. The third is obfuscating an API key in a client-side application, where the key is readable by anyone with devtools open.',
          'In the third case the key is in the bundle, whether it is base64, encrypted with a key that is also in the bundle, or split into pieces that are reassembled in the same file. The only real fix is for the secret to not be in the client at all.',
        ],
      },
      {
        heading: 'Where Base64 is the right tool',
        paragraphs: [
          'Base64 is genuinely the right answer in several common situations, and reaching for it there is correct rather than naive. It is how binary data travels through a text-only channel, how a data URI embeds an image in a stylesheet, how an HTTP header carries an attachment, and how a JWT carries its payload in a URL-safe form.',
          'In all of them, the point is transport rather than secrecy, and the security comes from somewhere else: TLS, a signature, or the fact that the content was never secret.',
        ],
        list: [
          'Encoding binary in JSON, XML, a query string or an email header.',
          'Building a `data:` URI for an inline image or a font.',
          'Encoding an SMTP attachment or an HTTP header value.',
          'The payload and header of a JWT, where the signature is what provides integrity.',
        ],
      },
    ],
    takeaways: [
      'Base64 has no key, so anybody who can see it can decode it.',
      'A base64-encoded secret is a plaintext secret with extra characters.',
      'The output is a third larger than the input, which matters in a URL.',
      'Base64 is the right tool for moving binary through a text channel, and the wrong tool for hiding anything.',
    ],
    relatedTools: ['base64-encoder', 'jwt-decoder', 'hash-generator', 'url-encoder'],
  },

  {
    slug: 'http-cache-headers',
    title: 'Cache-Control and ETag, Explained',
    description:
      'How HTTP caching works: what Cache-Control directives mean, what an ETag is, what Vary does, and how a misconfigured header serves the wrong page.',
    h1: 'How HTTP caching works, and what each header actually controls',
    lede: 'Cache headers are the difference between a site that feels instant and one that feels broken. They are also the number one source of the bug where a user sees somebody else’s data.',
    readingTime: '9 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'The two independent decisions',
        paragraphs: [
          'Every cache decision is two questions: may this response be stored, and may it be reused without asking the origin again. The first is answered by cache directives, and the second by freshness information such as `Expires`, `max-age` or an `ETag`.',
          'A response can be storable but stale, which is what `max-age=0, must-revalidate` means: the browser may keep a copy, but it has to check before using it. That combination is what you want for a personalised page.',
        ],
      },
      {
        heading: 'The Cache-Control directives that matter',
        paragraphs: [
          'The full grammar is large, but almost every real application uses five or six of them. The difference between them is frequently the difference between a bug and a working site.',
        ],
        list: [
          '`max-age=3600` — fresh for an hour. The browser does not ask again within that window.',
          '`no-cache` — store it, but revalidate before every use. The name is misleading; it does not mean "do not store".',
          '`no-store` — do not store it at all. The only correct directive for a response containing a secret.',
          '`private` — only the browser may store it, not a shared cache such as a CDN.',
          '`public` — a shared cache may store it. Correct for a public asset, wrong for a personalised page.',
          '`must-revalidate` — once stale, do not serve it without checking with the origin.',
          '`immutable` — the response will not change, so never revalidate it. Safe for a file with a hash in its name.',
        ],
      },
      {
        heading: 'ETags and conditional requests',
        paragraphs: [
          'An ETag is a validator: an opaque string that changes when the resource changes. It does not have to be a hash, but a strong ETag has to change whenever the representation does, and a weak ETag may be shared across semantically equivalent representations.',
          'The browser sends it back as `If-None-Match`, and the server answers with `304 Not Modified` and no body. That is a conditional request, and it is how a page can be checked for freshness without transferring the page again.',
          'The mistake that causes the "user sees another user’s data" bug is caching a personalised response on a shared cache without `private`. A CDN will then serve the first user’s HTML to everyone until it expires.',
        ],
        code: `ETag: "a1b2c3"
Cache-Control: private, max-age=0, must-revalidate

# The browser revalidates with:
If-None-Match: "a1b2c3"

# The server answers:
304 Not Modified`,
      },
      {
        heading: 'What Vary is for',
        paragraphs: [
          '`Vary` tells a cache which request headers affect the response. A page that renders differently depending on `Accept-Encoding` has to say `Vary: Accept-Encoding`, otherwise the cache may store the compressed version and serve it to a client that cannot read it.',
          'A page that varies by `Accept-Language` or by a cookie needs the same treatment. The cost of a wrong `Vary` is high, and the cost of a right one is a few bytes and a lower hit rate.',
        ],
      },
      {
        heading: 'A sensible default for a static site',
        paragraphs: [
          'For a file with a content hash in its name, the headers are simple and should be aggressive, because the URL changes when the content changes. For the HTML document itself, the safe default is a short lifetime with revalidation, because the document usually points at the hashed assets.',
        ],
        code: `# Hashed asset — cache forever
Cache-Control: public, max-age=31536000, immutable

# The HTML document — revalidate every time
Cache-Control: public, max-age=0, must-revalidate`,
      },
    ],
    takeaways: [
      'Storing and reusing are two separate decisions, answered by different headers.',
      '`no-cache` means "revalidate", not "do not store". `no-store` is the one that means that.',
      'A personalised response on a shared cache needs `private`, or a CDN will serve it to the wrong person.',
      '`immutable` is only safe when the URL changes with the content.',
    ],
    relatedTools: ['http-status-codes', 'curl-converter', 'url-encoder', 'dotenv-editor'],
  },

  {
    slug: 'api-error-responses',
    title: 'Designing API Error Responses',
    description:
      'What an API error body should contain, which status code to use, and how to keep errors debuggable without leaking internals.',
    h1: 'What an API error should look like when it fails',
    lede: 'An error response is part of the API, not an afterthought. Clients branch on the status code, then on a stable machine-readable code, and only then show a human message.',
    readingTime: '8 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'Three layers, in the order a client uses them',
        paragraphs: [
          'The status code tells the client what kind of failure it is: a problem with the request, a problem with authentication, a problem with the resource, or a problem on your side. It is the layer every HTTP library already understands.',
          'The error code is a stable, machine-readable identifier for the specific failure — `insufficient_funds`, `email_already_verified`, `rate_limit_exceeded`. It is the layer your client code should branch on, because a human-readable message can be reworded, localised or translated without breaking anybody.',
          'The message is for the person reading the response. It should be specific enough to act on and should never contain a stack trace, a SQL fragment or an internal hostname.',
        ],
        code: `HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "error": {
    "code": "email_already_verified",
    "message": "That address was already verified on 3 March 2026.",
    "request_id": "req_8f2a1c4b7d3e91",
    "docs": "https://api.example.com/errors/email_already_verified"
  }
}`,
      },
      {
        heading: 'Which status code to use',
        paragraphs: [
          'The distinction that causes the most confusion is between a malformed request and an invalid one, and between not being allowed and not being authenticated. Getting these right means clients do not have to guess whether to retry, refresh a token or give up.',
        ],
        list: [
          '`400` — the request could not be parsed. Malformed JSON, a bad header, a broken query string.',
          '`401` — no valid credentials were presented. Send a `WWW-Authenticate` header.',
          '`403` — authenticated, but not allowed to do this. The server will not say why.',
          '`404` — the resource does not exist, or you are hiding that it does.',
          '`409` — the request conflicts with the current state. A duplicate, a version mismatch.',
          '`410` — it existed and is deliberately gone, and will not come back.',
          '`422` — it parsed, and the content failed validation. The precise counterpart to `400`.',
          '`429` — the rate limit was hit. Always send `Retry-After`.',
          '`500` — something broke on your side. Never the client’s fault.',
          '`503` — temporarily unavailable, with a `Retry-After`. A retry may work.',
        ],
      },
      {
        heading: 'Make it safe to retry',
        paragraphs: [
          'A client that cannot tell a retryable failure from a permanent one either retries forever or gives up too early. The status code is the main signal, and it is worth being deliberate about it.',
          'A network timeout, a `429` and a `503` are retryable. A `400`, a `401`, a `403` and a `422` are not, and retrying them just wastes the user’s time and your capacity. When a request genuinely is idempotent, say so, and consider accepting an idempotency key so a retry cannot create a duplicate.',
        ],
      },
      {
        heading: 'Keep it debuggable without leaking',
        paragraphs: [
          'The tension is that the person who needs the most detail is the one who did not write the error: a developer debugging an integration at 2am. The answer is a correlation identifier rather than more detail in the body.',
          'Return an identifier in the error body, put the same identifier in your logs, and let the support conversation start there. The client gets a safe message, your logs keep the stack trace, and nobody has to paste internal details into a ticket.',
        ],
        list: [
          'A `request_id` in the body and in every log line for that request.',
          'Stack traces and internal hostnames stay in the logs.',
          'Database errors are logged with their code and summarised for the client.',
          'A link to the documentation for the error code, when there is one.',
        ],
      },
    ],
    takeaways: [
      'Status code for the class of failure, a stable error code for the specific one, a message for the human.',
      '`400` is malformed, `422` is invalid, `401` is unauthenticated, `403` is forbidden.',
      'Say explicitly which failures are retryable, and send `Retry-After` when they are.',
      'Use a request identifier to be debuggable without leaking internals.',
    ],
    relatedTools: ['http-status-codes', 'json-formatter', 'json-schema-generator', 'curl-converter'],
  },

  {
    slug: 'webhook-signatures',
    title: 'How Webhook Signature Verification Works',
    description:
      'How to verify that a webhook really came from the provider: HMAC signatures, the raw body requirement, replay protection and constant-time comparison.',
    h1: 'How to know a webhook really came from the provider',
    lede: 'A webhook endpoint that accepts anything posted to it is an open door. Signature verification closes it, and almost every implementation of it has the same two bugs.',
    readingTime: '8 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'The shape of the scheme',
        paragraphs: [
          'The provider signs the request body with a secret only you and it know, and sends the signature in a header. You recompute the signature over the body you received and compare.',
          'The signature is usually an HMAC, and HMAC is the right primitive here: it authenticates the message and detects any modification in transit, with a key. A plain hash of the body would be useless, because anybody who can see the body can recompute the hash.',
        ],
        code: `// Provider side
signature = HMAC_SHA256(secret, raw_body)

// Your side
expected = HMAC_SHA256(secret, raw_body_received)
valid = constant_time_equals(signature_received, expected)`,
      },
      {
        heading: 'The raw body, not the parsed one',
        paragraphs: [
          'This is the first bug, and it is the one that breaks implementations that work perfectly in testing. A signature is computed over the exact bytes of the body. If your framework parsed the JSON and then you re-serialise it to compute the signature, the bytes will differ.',
          'Whitespace, key order, the escaping of a slash, the encoding of a non-ASCII character: all of it changes the bytes. A payload with `"name": "Ada"` and one with `"name":"Ada"` sign differently, and the second one will be rejected with a valid signature on the other side.',
          'Most frameworks give you the raw body somewhere. Use that, always.',
        ],
        list: [
          'Express: `express.raw({ type: "application/json" })` on the webhook route, and read `req.body` as a Buffer.',
          'Fastify: `bodyLimit` plus a content type parser that keeps the raw buffer.',
          'Django: `request.body` rather than `request.POST`.',
          'Rails: `request.raw_post`.',
        ],
      },
      {
        heading: 'The timestamp, and why replay protection is not optional',
        paragraphs: [
          'A valid signature proves the request came from the provider. It does not prove the request is new, and a signature captured from a log or a proxy can be replayed indefinitely.',
          'The fix is to include a timestamp in the signed payload, and to reject anything outside a window — five minutes is the usual choice. GitHub, Stripe and Slack all send the timestamp in a header and all document this window.',
        ],
        code: `t=1767225600,v1=5257a869e7ec...   // GitHub style

// Reject when |now - t| > 300 seconds
if (Math.abs(now - t) > 300) return 400;`,
      },
      {
        heading: 'Compare in constant time',
        paragraphs: [
          'The second bug. A string comparison in most languages returns as soon as it finds a difference, which makes the time it takes depend on how many leading characters matched.',
          'It is a timing side channel. In practice the attack is hard, but the fix is one function call and there is no reason to leave it. Compare the raw bytes with a constant-time comparison, and do it over the decoded digest rather than over the hex string.',
        ],
        code: `import { timingSafeEqual } from "node:crypto";

const a = Buffer.from(expectedHex, "hex");
const b = Buffer.from(receivedHex, "hex");
if (a.length !== b.length) return false;
return timingSafeEqual(a, b);`,
      },
      {
        heading: 'Do the work after the response',
        paragraphs: [
          'Providers retry a webhook that does not get a success response, and they enforce a timeout, often five or ten seconds. If your handler does a slow database write before responding, you will get duplicate deliveries, which is why every provider sends an idempotency identifier.',
          'The pattern is to verify the signature, enqueue the event, respond with a 2xx, and do the real work in a worker. A duplicate delivery then does no harm, because the consumer checks the identifier it has already processed.',
        ],
      },
    ],
    takeaways: [
      'Sign the raw bytes, never a re-serialised version of the parsed body.',
      'Include a timestamp in the signed payload and reject anything outside a five-minute window.',
      'Compare digests in constant time; the fix is one function call.',
      'Respond quickly and process asynchronously, because providers retry and they will time you out.',
    ],
    relatedTools: ['hash-generator', 'jwt-decoder', 'base64-encoder', 'json-formatter'],
  },

  {
    slug: 'shell-quoting-and-escaping',
    title: 'Quoting and Escaping in Shell Commands',
    description:
      'Why unquoted variables break, the difference between single and double quotes, and how to pass a value to another command safely.',
    h1: 'Why unquoted variables break, and what to do instead',
    lede: 'Shell quoting is not a style preference. An unquoted variable is a word-splitting instruction, and a filename with a space in it is enough to turn a working script into a broken one or an exploitable one.',
    readingTime: '9 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'The default behaviour is to split',
        paragraphs: [
          'An unquoted variable is expanded and then split on whitespace, and each resulting piece is treated as a separate argument. A filename with a space, a glob character or a newline in it therefore does not survive.',
          'The same expansion also expands globs, so a variable containing `*` turns into a list of files, and a variable containing `~` expands to a home directory. Neither is usually what the author intended.',
        ],
        code: `file="my report.txt"
cat $file        # cat: 'my' 'report.txt' — two arguments
cat "$file"      # cat: my report.txt — one argument, correct`,
      },
      {
        heading: 'Single quotes, double quotes, and the difference',
        paragraphs: [
          'Single quotes protect everything: no expansion of variables, no command substitution, no globbing, no backslash escapes except a literal quote. The contents are completely literal.',
          'Double quotes protect the *structure* — the value stays one argument — but the content is still expanded: variables, command substitution and backslash escapes are all processed inside them.',
          'That difference is the one that bites. A value that contains a dollar sign is safe in single quotes and dangerous in double quotes, because in double quotes the shell will try to expand whatever follows the dollar sign.',
        ],
        code: `# Literal, always safe
name='$HOME and \`whoami\`'
echo "$name"     # $HOME and \`whoami\`

# Expanded, not what you wanted
name='$HOME'
echo "$name"     # /root`,
      },
      {
        heading: 'Command substitution runs code',
        paragraphs: [
          'Backticks and `$(...)` run the command inside them and substitute the output. In a double-quoted string the substitution still happens, which means untrusted data can end up being executed.',
          'This is the mechanism behind a whole family of injection bugs. A parameter that contains `$(rm -rf ...)` and is interpolated into a command inside double quotes will be executed.',
        ],
        code: `input='$(touch /tmp/pwned)'
eval "echo $input"     # creates the file
echo "$input"          # safe, prints the literal text`,
      },
      {
        heading: 'Passing a value to another command safely',
        paragraphs: [
          'The correct way to hand a value to another program is as a separate argument, quoted, with the command called directly. That is the shape that avoids the shell entirely and is immune to every problem above.',
          'If you truly must build a command as a string, the safe way is to use `printf %q`, which quotes a value so that the shell will read it as exactly one argument, or to stop building strings and use an array.',
        ],
        code: `# Correct: separate argument, quoted
rm -- "$file"

# Correct: an array, no re-parsing
cmd=(rm -- "$file")
"\${cmd[@]}"

# Correct: a format string, never interpolation
printf 'Processing %s\\n' "$file"`,
      },
      {
        heading: 'Things that are not quoting',
        paragraphs: [
          'A backslash before a space works in an interactive shell, but it is fragile, unreadable and does not survive being put in a variable. It also does nothing inside single quotes, and inside double quotes it only escapes a small set of characters.',
          'Braces, `${var}` and `$var` are not quoting. Brace expansion happens before any other expansion and turns `{a,b}` into two words. `${var}` and `$var` are the same expansion, and both of them split and glob the result unless they are inside double quotes.',
        ],
        list: [
          '`\\ ` escapes a space, but not inside single quotes, and not reliably inside double quotes.',
          '`{a,b}` expands to two words, before variables are even looked at.',
          '`${var}` and `$var` behave identically. Neither of them quotes.',
        ],
      },
    ],
    takeaways: [
      'Always double-quote a variable expansion unless you specifically want splitting and globbing.',
      'Single quotes are fully literal; double quotes still expand variables and command substitutions.',
      'Never build a command by interpolating untrusted data into a string.',
      'Pass values as separate arguments, and use an array or `printf %q` when a string is unavoidable.',
    ],
    relatedTools: ['string-replace', 'regex-tester', 'dotenv-editor', 'utm-builder'],
  },

  {
    slug: 'id-strategies',
    title: 'UUIDs, ULIDs and Snowflake IDs',
    description:
      'How to choose an identifier: random UUIDv4, time-ordered UUIDv7, ULID, Snowflake and auto-increment, with the index and privacy trade-offs.',
    h1: 'How to choose an identifier, and what each one costs you',
    lede: 'The identifier is the one decision in a data model that is expensive to change later. The choice is not between formats, it is between a random id that scatters your index and an ordered one that leaks the order of your data.',
    readingTime: '9 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'What an identifier is for',
        paragraphs: [
          'An identifier has to be unique, it has to be cheap to generate, it has to be cheap to store and index, and — depending on the system — it has to not leak information. Those requirements conflict, and every option is a different answer to which one you give up.',
          'The fifth requirement is the one that is easiest to forget. A sequential id tells everybody how many records exist and in what order they were created, which is a business metric you may not want to publish.',
        ],
        list: [
          'Uniqueness across every node that might generate one.',
          'Generation cost and collision probability.',
          'Index locality, which is the effect people forget.',
          'Information leakage, which is the effect people regret.',
        ],
      },
      {
        heading: 'Auto-increment integers',
        paragraphs: [
          'The smallest and the fastest. An 8-byte integer is cheaper to store and to index than any text id, and because the values are increasing, every insert lands at the end of the index, which keeps the pages contiguous and the write amplification low.',
          'The cost is that the id is sequential, so it leaks the volume and the order of the table, and it can only be generated by one place. A single database that owns its own tables is the ideal case for this choice.',
        ],
      },
      {
        heading: 'Random UUIDv4',
        paragraphs: [
          '122 bits of randomness, generated anywhere without coordination, and no coordination means no network round trip and no central point of failure. That is why it is the default in distributed systems.',
          'The cost is index locality. A random id scatters inserts across the whole index, which fragments the pages and turns every insert into a page split. On a high-write table this is the difference between a database that keeps up and one that does not.',
          'There is also a storage consideration: as a `uuid` column it is 16 bytes, but as a `char(36)` string it is 36 bytes, and the text form also has a random-looking index order, which is the worst of both.',
        ],
      },
      {
        heading: 'Time-ordered identifiers',
        paragraphs: [
          'UUIDv7, ULID and Snowflake all solve the same problem by putting a timestamp in the leading bits. The id sorts by creation time, so inserts stay sequential in the index, while the trailing bits stay random enough that ids are not predictable.',
          'UUIDv7 is the one to prefer if you are starting today. It is a standard, RFC 9562, supported by the major database drivers, and it keeps the UUID format so it does not force a schema change.',
          'The trade-off is the same for all of them: the id reveals the creation time. A `users` table with ordered ids tells you exactly when each account was created, and an attacker with a user id can estimate the id range of every other user.',
        ],
        list: [
          'UUIDv7 — standard, 16 bytes, time-ordered, RFC 9562. The default choice.',
          'ULID — 26 characters of Crockford base32, sortable as text. Bigger, but human-readable and monotonic within a millisecond.',
          'Snowflake — 64 bits, time plus node plus sequence. Compact and fast, but the epoch is custom and the format is a vendor convention.',
          'K-sortable IDs and the rest — variations on the same idea.',
        ],
      },
      {
        heading: 'Monotonicity inside a millisecond',
        paragraphs: [
          'Two records created in the same millisecond need a tiebreak, otherwise the order between them is arbitrary. UUIDv7 handles it with a counter in the random bits, and ULID libraries usually add a monotonic increment.',
          'This matters when you rely on the id order for something. If a client sorts by id and assumes insertion order, a non-monotonic generator will occasionally produce a record that sorts before one that was inserted earlier.',
        ],
        code: `// UUIDv7, 48 bits of timestamp then random bits
2026-01-14T09:30:00Z  ->  0198f2a1-c4b7-7d3e-9c02-1e6a7b3d5f90
         ^^^^^^^^         ^^^^^^^^
         milliseconds     random, with a counter for ties`,
      },
      {
        heading: 'A workable default',
        paragraphs: [
          'For a new system, use UUIDv7 as a 16-byte native column, generated in the application, and accept that it reveals creation time. It needs no coordination, it does not fragment the index, and it is a standard rather than a convention.',
          'If the tables are owned by a single database and never need to merge with another system, an auto-increment integer is still better on every axis except the ability to generate the id anywhere.',
          'Whatever you choose, decide how the value is stored. A native `uuid` column is 16 bytes; a `varchar(36)` with a text index is 36 bytes and a random index order, and it is the most common way to accidentally undo the benefit of an ordered id.',
        ],
      },
    ],
    takeaways: [
      'Random UUIDv4 fragments the index; time-ordered ids fix that but reveal creation time.',
      'UUIDv7 is the sensible default for a new distributed system, because it is a standard.',
      'Store the id in a native 16-byte column, not as a 36-character string with a text index.',
      'Auto-increment integers are still the best answer when one database owns the data.',
    ],
    relatedTools: ['uuid-generator', 'nanoid-generator', 'timestamp-converter', 'json-schema-generator'],
  },

  {
    slug: 'sql-injection-explained',
    title: 'How SQL Injection Works, and How to Prevent It',
    description:
      'What SQL injection is, how string concatenation creates it, why parameterised queries fix it, and the cases where the danger is not the database at all.',
    h1: 'How SQL injection works, and why parameterised queries fix it',
    lede: 'SQL injection is not exotic. It is what happens when a value that came from outside your program is pasted into a query as text, and it is entirely prevented by a mechanism that has existed since the 1970s.',
    readingTime: '9 min read',
    updated: '2026-10-18',
    sections: [
      {
        heading: 'What the bug actually is',
        paragraphs: [
          'A query is a string. When you build it by concatenating a value into that string, the database cannot tell the difference between the part you wrote and the part the user wrote. It parses the whole thing as one statement.',
          'So if the value is `1; DROP TABLE users; --`, the database receives two statements, and the second one runs. The escape is not a special character that has to be filtered. It is the absence of a boundary.',
        ],
        code: `// Vulnerable: the name is pasted into the query text
const sql = "SELECT * FROM users WHERE name = '" + name + "'";

// The database sees one statement:
SELECT * FROM users WHERE name = 'x' OR '1'='1'`,
      },
      {
        heading: 'Why escaping is not the answer',
        paragraphs: [
          'Escaping exists, and it is done correctly by the driver, but hand-rolled escaping is where the bypasses live. The famous ones — the GBK character set in MySQL, the `\` escape in PostgreSQL, the difference between a backslash and a quote in a standard string — all come from the same place: somebody wrote their own escape function.',
          'There are also context-specific problems. A value that is safe inside a quoted string is not safe as an identifier, and not safe as a `LIMIT` value, and not safe as a `LIKE` pattern. One escape function cannot cover all of them.',
        ],
      },
      {
        heading: 'What parameterised queries do',
        paragraphs: [
          'A parameterised query sends the query text and the values over separate channels. The database parses the statement first, decides where a parameter belongs, and then binds the value into that slot as data. A value that contains a quote is just a quote.',
          'The rule that follows is simple: the query text is structure, and it is written by the programmer. Every value, including numbers and identifiers, goes through a parameter.',
        ],
        code: `// Safe: the value never becomes part of the query text
const sql = "SELECT * FROM users WHERE name = ?";
const [rows] = await db.execute(sql, [name]);

// Identifiers cannot be parameterised, so they are
// checked against an allow-list rather than escaped.
const column = ALLOWED_COLUMNS.includes(input) ? input : "id";`,
      },
      {
        heading: 'The places that are not the database',
        paragraphs: [
          'The interesting part of injection is that the database is only the most visible target. The same mistake of pasting untrusted text into a command appears everywhere, and each context has its own safe form.',
        ],
        list: [
          'Shell commands — pass the value as a separate argument, never inside a string.',
          'LDAP filters — escape the value for the filter grammar.',
          'Templates and HTML — escape for the output context, at the point of output.',
          'NoSQL — an operator is a value in a document store, so a query object built from user input can be rewritten.',
          'Log files — a newline in a value can forge a log entry.',
          'Templates that compile code — a template string built from user input is code execution.',
        ],
      },
      {
        heading: 'ORMs reduce the risk, and do not remove it',
        paragraphs: [
          'An ORM parameterises its queries by default, which removes the most common injection point. It does not remove the class of bug, because every ORM has a way to escape into raw SQL: a raw query, a literal fragment, a column name taken from a request.',
          'The rule that survives the ORM is the same one: structure comes from the programmer, values come from the user, and the two are never concatenated.',
        ],
        code: `// The escape hatches that reintroduce the bug
db.raw("SELECT * FROM t WHERE id = " + id)   // concatenated
db.raw("SELECT * FROM t WHERE id = ?", [id])  // parameterised`,
      },
    ],
    takeaways: [
      'Injection is a missing boundary, not a missing filter.',
      'Parameterise every value, including numbers, and allow-list any identifier.',
      'The same mistake exists in shells, LDAP, logs, templates and NoSQL queries.',
      'An ORM reduces the risk; it does not remove the need to parameterise the raw paths.',
    ],
    relatedTools: ['sql-formatter', 'regex-tester', 'json-formatter', 'curl-converter'],
  },
];

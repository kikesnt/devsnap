import type { ToolDef } from '../types';

export const encodeTools: ToolDef[] = [
  {
    slug: 'base64-encoder',
    name: 'Base64 Encoder & Decoder',
    glyph: 'B64',
    icon: 'binary',
    category: 'Encode & Hash',
    title: 'Base64 Encoder & Decoder — Encode Base64',
    description:
      'Encode text to Base64 or decode Base64 back to text, with URL-safe output, UTF-8 handling and binary support. Runs entirely in your browser with no uploads.',
    h1: 'Base64 encoder and decoder that handles UTF-8 and binary properly',
    lede: 'Base64 is easy to get subtly wrong: standard versus URL-safe alphabet, newline padding, and text that is not ASCII. This tool does the conversion correctly for all three and shows you exactly which variant it produced.',
    keywords: [
      'base64 encode',
      'base64 decode',
      'base64 converter online',
      'url safe base64',
      'base64 image data uri',
      'decode base64 string',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Alphabets', value: 'Standard + URL-safe' },
      { label: 'Encoding', value: 'UTF-8 aware' },
      { label: 'Binary', value: 'Supported' },
    ],
    steps: [
      {
        title: 'Paste the value',
        body: 'Type or paste the text to encode, or the Base64 string to decode. Decoding is detected automatically, so you do not need to switch modes first.',
      },
      {
        title: 'Pick the variant',
        body: 'Standard Base64 uses + and / and pads with =. URL-safe Base64 swaps them for - and _ and can drop the padding, which is what JWT and URL query parameters require.',
      },
      {
        title: 'Copy the result',
        body: 'The output shows the encoded string, its length before and after, and a ready-made data URI when the input looks like binary.',
      },
    ],
    examples: [
      {
        caption: 'The same payload in both alphabets',
        headers: ['Input', 'Standard', 'URL-safe'],
        rows: [
          ['`{"a":1,"b":"x?y"}`', '`eyJhIjoxLCJiIjoiePx5In0=`', '`eyJhIjoxLCJiIjoiePx5In0=`'],
          ['`binary bytes 0xFB 0xFF`', '`+/8=`', '`-_8=`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Building a data URI for an inline image',
        body: 'The output includes the complete `data:image/png;base64,...` prefix, which is what you need to inline a small image in CSS or an email template.',
      },
      {
        title: 'Reading an encoded string from a config file',
        body: 'A base64 secret in a deployment manifest decodes in one step, so you can confirm what a value actually is without touching a terminal.',
      },
      {
        title: 'Preparing a JWT segment',
        body: 'JWTs use the URL-safe alphabet without padding, which is the single most common reason a hand-built token fails signature validation.',
      },
    ],
    notes: [
      {
        title: 'Base64 is not encryption',
        body: 'Base64 is a transport encoding with no key and no confidentiality. Anyone can decode it, and a secret that is only base64-encoded is a secret that is public. It protects nothing against someone who can read the string.',
      },
      {
        title: 'Why padding matters',
        body: 'A standard Base64 string is padded with = to a multiple of four characters. URL-safe variants usually strip the padding. Decoders in strict mode will reject a string whose length and padding disagree, which is why the decoder here is tolerant and reports what it removed.',
      },
    ],
    why: {
      title: 'Encoded payloads are still payloads',
      body: 'A Base64 string may hide a credential, a private key or a customer record. Decoding it on somebody else’s server hands that content to a third party, which is why the decode happens in the tab with no network requests at all.',
      points: [
        'Standard and URL-safe alphabets, with or without padding.',
        'UTF-8 text is handled correctly, including emoji and non-Latin scripts.',
        'Binary input is supported and can be output as a data URI.',
        'Nothing is transmitted, ever.',
      ],
    },
    faq: [
      {
        q: 'Is Base64 encryption?',
        a: 'No. It is a reversible encoding with no key. Treat a base64-encoded value as plain text for confidentiality purposes, and encrypt anything that genuinely needs protecting.',
      },
      {
        q: 'What is the difference between standard and URL-safe Base64?',
        a: 'Standard Base64 uses + and / for the last two alphabet characters and pads with =. The URL-safe variant, defined in RFC 4648 section 5, replaces them with - and _ and usually drops the padding so the result can be placed in a URL without escaping.',
      },
      {
        q: 'Why did my Base64 decode to garbage?',
        a: 'Most often the string was encoded from binary rather than text and you are viewing it as a string. Second most common: the input is URL-safe Base64 that a strict standard decoder rejected — this decoder accepts both. Third: the string was truncated in transit, which you can spot in the length readout.',
      },
      {
        q: 'Does it handle emoji and non-Latin characters?',
        a: 'Yes. Text is converted to UTF-8 bytes before encoding, so emoji, accented letters, Cyrillic, Arabic and CJK text all round-trip correctly.',
      },
      {
        q: 'How large a file can I encode?',
        a: 'Text of a few megabytes is comfortable. For files, note that Base64 adds roughly a third in size, which is usually a bad trade compared with sending the file itself over HTTP.',
      },
      {
        q: 'Can I decode a Base64 image?',
        a: 'Yes, and the output includes the data URI form so you can paste it straight into an image tag or a stylesheet. The decoder also reports whether the decoded bytes look like a recognised image format.',
      },
    ],
    related: ['url-encoder', 'jwt-decoder', 'hash-generator', 'json-formatter'],
    updated: '2026-10-10',
  },

  {
    slug: 'url-encoder',
    name: 'URL Encoder & Query Parser',
    glyph: '%',
    icon: 'link',
    category: 'Encode & Hash',
    title: 'URL Encoder & Query Parser — Encode URLs',
    description:
      'Percent-encode or decode URLs, and parse a query string into readable key and value pairs. Everything runs in your browser.',
    h1: 'Encode URLs and read query strings without guessing',
    lede: 'Percent-encoding has more than one correct answer depending on context, and a query string with a dozen parameters is unreadable in raw form. This tool encodes a full URL or a single component, and parses any query string into a table.',
    keywords: [
      'url encoder',
      'url decoder',
      'percent encoding',
      'query string parser',
      'url encode online',
      'decode url parameters',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'why', 'related'],
    facts: [
      { label: 'Modes', value: 'Full URL or component' },
      { label: 'Parser', value: 'Query to table' },
      { label: 'Encoding', value: 'UTF-8' },
    ],
    steps: [
      {
        title: 'Paste the URL or the fragment',
        body: 'A whole URL, a single query parameter value, or a raw query string all work. The parser mode takes a query string on its own.',
      },
      {
        title: 'Encode or decode',
        body: 'Encoding percent-escapes reserved characters. Decoding turns %20 back into a space and %26 back into an ampersand.',
      },
      {
        title: 'Read the parsed parameters',
        body: 'The parser shows every parameter in a table with its decoded name and value, and flags repeated keys that would otherwise silently overwrite each other.',
      },
    ],
    examples: [
      {
        caption: 'Query string parsing',
        headers: ['Raw parameter', 'Decoded name', 'Decoded value'],
        rows: [
          ['`q=blue%20shoes`', '`q`', '`blue shoes`'],
          ['`redirect=https%3A%2F%2Fa.com%2Fb`', '`redirect`', '`https://a.com/b`'],
          ['`tags%5B%5D=a&tags%5B%5D=b`', '`tags[]`', '`a` (and `b` — a repeated key)'],
        ],
      },
    ],
    cases: [
      {
        title: 'Building a link with a redirect parameter',
        body: 'Nested URLs have to be encoded or the outer URL breaks at the first ampersand. Encoding the inner value separately and then assembling the link is the reliable way.',
      },
      {
        title: 'Debugging a tracking URL',
        body: 'When analytics reports a campaign with the wrong medium, the URL was probably assembled with an unencoded space or a raw ampersand inside a value. Parsing the final URL shows what the server actually received.',
      },
      {
        title: 'Reading a callback URL',
        body: 'OAuth and payment callbacks come back with state, code and scope parameters. Parsing them into a table is much faster than squinting at a single line.',
      },
    ],
    notes: [
      {
        title: 'Which characters to escape',
        body: 'Unreserved characters (letters, digits, hyphen, underscore, dot and tilde) never need escaping. Everything else depends on context: a path segment allows different characters than a query value, and a fragment follows yet another set. Encoding the whole URL when you only meant one component is a common and confusing mistake.',
      },
      {
        title: 'The plus sign',
        body: 'A + in a query string means a space in the widely used form-encoding convention, but a literal + in a path means a literal plus. Decoders that treat + as a space everywhere will corrupt path segments.',
      },
    ],
    why: {
      title: 'URLs carry more than addresses',
      body: 'Reset tokens, session identifiers, OAuth codes and email campaign parameters all travel inside a URL. Parsing one through a remote service means transmitting that token to a third party, where it is very likely to end up in an access log.',
      points: [
        'No server sees the URL you are inspecting.',
        'Full-URL mode leaves the scheme and host untouched and only escapes the path, query and fragment.',
        'The parser flags duplicate query keys, which silently drop data in most frameworks.',
        'UTF-8 aware, so multibyte characters encode correctly.',
      ],
    },
    faq: [
      {
        q: 'When should I encode a whole URL versus a single component?',
        a: 'Encode a single component when you are inserting a value into a URL you already have. Encode a whole URL when it is going into another URL, because its own reserved characters would otherwise be interpreted as structure by the outer URL.',
      },
      {
        q: 'Should spaces be %20 or +?',
        a: 'In a query string built with form encoding, a space is +. In a path, in a fragment, or in anything you want to survive being copied between systems, %20 is the safe choice because + can be a literal plus.',
      },
      {
        q: 'Why does my parser show duplicate parameters?',
        a: 'Because the query string genuinely contains them. Most frameworks keep only the last occurrence of a repeated key, which means the first value is lost without a trace. A repeated key like tags[] is a deliberate array encoding and is fine.',
      },
      {
        q: 'Does it decode plus signs as spaces?',
        a: 'Only in query-string context, where that is the convention. Path segments keep their literal plus signs.',
      },
      {
        q: 'Can I encode a JSON payload for a URL parameter?',
        a: 'Yes, but compress it first if you can. A JSON payload is usually longer than the limit most servers accept, and base64 does not shrink it. The base64 tool in this toolbox is the right companion for opaque values.',
      },
      {
        q: 'Is the encoding reversible for non-ASCII characters?',
        a: 'Yes. UTF-8 bytes are escaped, so a character like é becomes its multibyte percent-encoded form and decodes back to the same character.',
      },
    ],
    related: ['base64-encoder', 'utm-builder', 'html-entity-encoder', 'hash-generator'],
    updated: '2026-10-06',
  },

  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    glyph: '#',
    icon: 'hash',
    category: 'Encode & Hash',
    title: 'Hash Generator — SHA-256, SHA-512 and HMAC',
    description:
      'Generate SHA-256, SHA-384 and SHA-512 digests, plus HMAC signatures, directly in your browser. No uploads, no server-side processing of your secret values.',
    h1: 'Generate SHA digests and HMAC signatures in your browser',
    lede: 'Hash a string with SHA-256, SHA-384 or SHA-512, or sign a payload with HMAC using your own secret. Every computation uses the browser crypto engine, so the value you hash never travels anywhere.',
    keywords: [
      'hash generator',
      'sha256 generator',
      'sha512 online',
      'hmac generator',
      'md5 alternative online',
      'checksum string',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Algorithms', value: 'SHA-1 / 256 / 384 / 512' },
      { label: 'HMAC', value: 'Included' },
      { label: 'MD5', value: 'Not offered' },
    ],
    steps: [
      {
        title: 'Enter the value to hash',
        body: 'Text is encoded as UTF-8 before hashing, so accented characters and emoji produce the digest you would get from a standard command line tool.',
      },
      {
        title: 'Choose the algorithm',
        body: 'SHA-256 is the default and the right answer for almost everything. SHA-512 is available when a protocol requires a wider digest.',
      },
      {
        title: 'Optionally add an HMAC key',
        body: 'With a key set, the tool switches to keyed hashing, which is what a webhook signature actually uses.',
      },
    ],
    cases: [
      {
        title: 'Verifying a file checksum',
        body: 'Compare the digest of a downloaded artefact against the value published in the release notes, in either direction.',
      },
      {
        title: 'Checking a webhook signature',
        body: 'Compute the HMAC of a raw request body with the endpoint secret and compare it to the signature header the provider sent.',
      },
      {
        title: 'Seeding deterministic test data',
        body: 'Hash a fixed string to get a stable identifier for fixtures, so the same input always produces the same value across machines.',
      },
    ],
    notes: [
      {
        title: 'Why there is no MD5 here',
        body: 'MD5 is broken for collision resistance: two different inputs can be crafted to produce the same digest, which is why certificates, package signatures and git have all moved away from it. Adding it for legacy compatibility is reasonable, but it should never be your default, and a tool that lists it first is giving bad advice. SHA-256 is the default here.',
      },
      {
        title: 'Hashing is not encryption',
        body: 'A digest cannot be reversed, but it is also not a password store. For passwords you want a deliberately slow, salted algorithm such as Argon2, bcrypt or scrypt. A plain SHA-256 of a password is crackable at billions of guesses per second on a GPU.',
      },
    ],
    why: {
      title: 'Hashing a secret is handing over the secret',
      body: 'The input to a hash is often a shared secret, a personal identifier or a payload from a customer record. Hashing it on a remote service means the clear text is transmitted to a third party, which is the exact thing hashing was supposed to prevent.',
      points: [
        'The digest is computed with the Web Crypto API in your browser.',
        'HMAC signing works with any secret, and the secret stays in the tab.',
        'Output is lowercase hex by default and can be switched to base64.',
        'No amount or length limits beyond available memory.',
      ],
    },
    faq: [
      {
        q: 'Is SHA-1 still safe to use?',
        a: 'For a checksum, yes. For anything security-sensitive, no. SHA-1 has practical collision attacks, which is why Git moved to SHA-256 and why certificates stopped using it years ago.',
      },
      {
        q: 'Why do you not offer MD5?',
        a: 'Because it is the most common wrong answer on the internet. MD5 collisions can be produced deliberately and cheaply, so it is unsuitable for signatures and integrity checks against an adversary. If you need MD5 for a legacy system, SHA-256 is almost always accepted as well.',
      },
      {
        q: 'How is the digest formatted?',
        a: 'Lowercase hexadecimal by default, which is what sha256sum and most build systems print. You can switch the output to base64, which is what JWT and many API signatures use.',
      },
      {
        q: 'How do I verify a webhook signature?',
        a: 'Take the raw request body exactly as received, compute the HMAC with the endpoint secret and the algorithm the provider specified, then compare the result to the signature header using a constant-time comparison.',
      },
      {
        q: 'Can I hash a file?',
        a: 'The input here is text. For a multi-megabyte binary file, use your platform tooling — sha256sum on Linux, Get-FileHash on Windows, or shasum on macOS — rather than pasting bytes into a web form.',
      },
      {
        q: 'Does the tool keep a log of what I hash?',
        a: 'No, because there is no server. The page makes no network requests, so there is nothing to log.',
      },
    ],
    related: ['checksum-calculator', 'base64-encoder', 'jwt-decoder', 'uuid-generator'],
    updated: '2026-10-14',
  },

  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder & Inspector',
    glyph: 'JWT',
    icon: 'token',
    category: 'Encode & Hash',
    title: 'JWT Decoder — Decode and Inspect JSON Web Tokens',
    description:
      'Decode JSON Web Tokens in your browser and inspect the header, payload, signature and expiry. Nothing is sent anywhere, so tokens stay on your machine.',
    h1: 'Inspect a JSON Web Token without sending it anywhere',
    lede: 'A JWT carries its own claims in readable base64. This decoder shows you the header and the payload side by side, flags the standard claims, and tells you whether the token has expired — all without transmitting the token to a server.',
    keywords: [
      'jwt decoder',
      'decode jwt',
      'json web token decoder',
      'jwt token viewer',
      'jwt parser online',
      'inspect jwt',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Verifies signature', value: 'No, by design' },
      { label: 'Claims', value: 'Standard set flagged' },
      { label: 'Transmission', value: 'None' },
    ],
    steps: [
      {
        title: 'Paste the token',
        body: 'A full token looks like header.payload.signature. The decoder also accepts a token with the Bearer prefix still attached.',
      },
      {
        title: 'Read the decoded parts',
        body: 'The header and payload are decoded and pretty-printed, with the standard claims such as exp, iss, aud and nbf highlighted and translated.',
      },
      {
        title: 'Check the lifetime',
        body: 'The expiry is shown in both UTC and local time with a remaining-lifetime countdown, and expired tokens are labelled clearly.',
      },
    ],
    examples: [
      {
        caption: 'Registered claims the decoder flags',
        headers: ['Claim', 'Meaning', 'Type'],
        rows: [
          ['`iss`', 'Issuer', 'String'],
          ['`sub`', 'Subject — usually a user id', 'String'],
          ['`aud`', 'Audience — who the token is for', 'String or array'],
          ['`exp`', 'Expiry time', 'Numeric date'],
          ['`nbf`', 'Not valid before', 'Numeric date'],
          ['`iat`', 'Issued at', 'Numeric date'],
          ['`jti`', 'Unique token id', 'String'],
        ],
      },
    ],
    cases: [
      {
        title: 'Finding out why a request is rejected',
        body: 'A 401 from an API is often a token that has expired, is signed for a different audience, or was issued by a staging issuer. The decoded claims make that visible in seconds.',
      },
      {
        title: 'Checking what a third-party integration stores',
        body: 'Before connecting an OAuth provider, decode the token to see exactly which scopes and claims you are agreeing to hand over.',
      },
      {
        title: 'Debugging a session that keeps dropping',
        body: 'If exp is close to the present time, the session lifetime is the problem, not your code. The countdown shows it immediately.',
      },
    ],
    notes: [
      {
        title: 'Decoding is not verification',
        body: 'Anyone can create a token with any claims they like, because the payload is only base64-encoded, not encrypted. A real check requires verifying the signature with the issuer’s public key. This tool explicitly does not do that, because verifying requires a key you would have to hand to a server.',
      },
      {
        title: 'Base64url, not base64',
        body: 'JWT segments use the URL-safe base64 alphabet with the padding stripped. A decoder built for standard base64 will often reject a perfectly valid token, which is the usual reason a “broken” token fails to decode.',
      },
    ],
    why: {
      title: 'A live token is a live credential',
      body: 'Paste a token into a decoding website and you have handed a working credential to whoever runs it. Tokens get logged, indexed and replayed. Decoding in the tab means the credential stays in the process you were already in.',
      points: [
        'The token is decoded in the browser and never transmitted.',
        'The signature segment is shown, not validated — and the page says so.',
        'Expiry, not-before and issued-at are shown in UTC and local time.',
        'Works with bearer-prefixed tokens and with detached segments.',
      ],
    },
    faq: [
      {
        q: 'Does this tool verify the signature?',
        a: 'No. Verifying requires the issuer’s public key, and uploading a key to a third party to check a token would be worse than not checking it at all. The token is decoded and inspected only.',
      },
      {
        q: 'Why does my token fail to decode?',
        a: 'Most often it is a copy-paste artefact: a trailing newline, a truncated token, or a segment that was URL-encoded. Another common cause is a JWE, which has five segments instead of three — this decoder handles the signed form.',
      },
      {
        q: 'What does the payload of a JWT contain?',
        a: 'Whatever the issuer put there. Standard claims like sub, iss and exp are optional, and many services add their own — role, permissions, tenant id, an email address. Because the payload is only encoded, treat everything in it as readable by anyone holding the token.',
      },
      {
        q: 'Is the token secret?',
        a: 'Yes. Anyone with a copy of it can act as the user until it expires, and until it expires is often an hour or more. That is why a token should be treated exactly like a password and never pasted into a shared site.',
      },
      {
        q: 'What is the difference between a JWT and a session cookie?',
        a: 'A JWT is self-contained: it carries its own claims and the server verifies it without a lookup. A session cookie is an opaque key into server-side state. JWTs are simpler to scale horizontally, but they cannot be revoked before expiry, which is the usual reason to choose sessions for sensitive operations.',
      },
      {
        q: 'Can I decode a JWT that has expired?',
        a: 'Yes, and it is worth doing. Expired tokens still decode, and seeing the exp claim confirms whether the expiry is the actual cause of the failure.',
      },
    ],
    related: ['base64-encoder', 'hash-generator', 'json-formatter', 'url-encoder'],
    updated: '2026-10-11',
  },

  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    glyph: 'ID',
    icon: 'id',
    category: 'Encode & Hash',
    title: 'UUID Generator — v4 and v7 UUIDs Online',
    description:
      'Generate UUID v4 (random) and UUID v7 (time-ordered) identifiers in bulk, with options for uppercase, braces and no hyphens. Runs locally in your browser.',
    h1: 'Generate UUID v4 and v7 identifiers in bulk',
    lede: 'Random v4 UUIDs for anything that just needs uniqueness, time-ordered v7 UUIDs for database primary keys where insert locality matters. Both are generated in the browser with crypto-grade randomness.',
    keywords: [
      'uuid generator',
      'guid generator',
      'uuid v4',
      'uuid v7',
      'random uuid bulk',
      'nanoid alternative',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'examples', 'notes', 'related'],
    facts: [
      { label: 'Versions', value: 'v4 random, v7 time-ordered' },
      { label: 'Bulk', value: 'Up to 10,000' },
      { label: 'Randomness', value: 'crypto.getRandomValues' },
    ],
    steps: [
      {
        title: 'Choose the version',
        body: 'v4 is fully random and the safe default. v7 embeds a millisecond timestamp in the leading bits, which keeps indexes compact in an ordered database.',
      },
      {
        title: 'Set the count and the format',
        body: 'Generate between one and ten thousand identifiers at once, and choose whether to output them in the standard hyphenated form, uppercase, wrapped in braces or without hyphens.',
      },
      {
        title: 'Copy the list',
        body: 'One click copies every generated identifier, newline separated, ready to paste into a seed script or a fixture file.',
      },
    ],
    examples: [
      {
        caption: 'The same identifier in different notations',
        headers: ['Format', 'Value'],
        rows: [
          ['Standard', '`3f2b9c14-7a5e-4d8b-9c02-1e6a7b3d5f90`'],
          ['Uppercase', '`3F2B9C14-7A5E-4D8B-9C02-1E6A7B3D5F90`'],
          ['No hyphens', '`3f2b9c147a5e4d8b9c021e6a7b3d5f90`'],
          ['Braced', '`{3f2b9c14-7a5e-4d8b-9c02-1e6a7b3d5f90}`'],
        ],
      },
    ],
    cases: [
      {
        title: 'Seeding a database with primary keys',
        body: 'A thousand random v4 UUIDs scatter inserts across a B-tree index, which fragments the pages and slows writes. v7 keeps the leading bytes monotonic and the index stays sequential.',
      },
      {
        title: 'Generating test data for a fixture',
        body: 'Bulk generation with a stable format gives you a reproducible set of identifiers to drop into a seed file.',
      },
      {
        title: 'Correlation ids for a request',
        body: 'A v7 identifier carries the creation time, so you can sort log lines by id alone and still read the timestamp off the value itself.',
      },
    ],
    notes: [
      {
        title: 'Why v7 exists',
        body: 'A v4 UUID starts with random bits, so consecutive inserts land in random parts of the index. A v7 UUID starts with a 48-bit millisecond timestamp, so ids sort by creation time and inserts stay at the end of the index. The random 74 bits are still there afterwards, so the collision probability is unchanged.',
      },
      {
        title: 'Do not use a UUID as a secret',
        body: 'A v4 UUID has 122 random bits, which is enough that guessing is hopeless, but the identifiers are routinely logged, put in URLs and returned in API responses. Treat a UUID as a public identifier, not a token, and use a proper credential for anything that grants access.',
      },
    ],
    why: {
      title: 'Identifiers rarely stay secret',
      body: 'Even when a UUID is generated locally, a bulk generator that ships ids to a server is one more place your id space gets logged. Keeping generation in the tab means the ids exist only where you paste them.',
      points: [
        'v4 uses crypto.getRandomValues, not Math.random.',
        'v7 is time-ordered and sortable.',
        'Bulk generation up to ten thousand identifiers.',
        'Output in hyphenated, uppercase, braced or compact form.',
      ],
    },
    faq: [
      {
        q: 'What is the difference between UUID v4 and v7?',
        a: 'v4 is entirely random. v7 puts a 48-bit millisecond timestamp in the first six bytes and fills the rest with random bits, so ids are sortable by creation time while remaining just as collision-resistant.',
      },
      {
        q: 'Are these identifiers cryptographically random?',
        a: 'Yes. They come from the browser’s crypto.getRandomValues, which is a CSPRNG. Math.random is never used.',
      },
      {
        q: 'Can I use these as database primary keys?',
        a: 'Yes, and v7 is the better choice for a distributed or high-write system because inserts stay sequential in the index. If you are using v4, consider a native sequential type instead unless you specifically need globally unique ids across systems.',
      },
      {
        q: 'What are the nil UUID and the max UUID?',
        a: 'The nil UUID is all zeroes and the max UUID is all ones. Both are reserved; the nil UUID conventionally means "no value" and is used to indicate an unset field.',
      },
      {
        q: 'Do generated identifiers differ between page loads?',
        a: 'Yes, every generation call produces new values. Nothing is cached, stored or sent to a server.',
      },
      {
        q: 'Should I use a UUID or an auto-incrementing integer?',
        a: 'Use an integer when a single database owns the data and you want the smallest possible index. Use a v7 UUID when ids must be created in more than one place, merged across systems, or exposed in an API where leaking row counts is a concern.',
      },
    ],
    related: ['hash-generator', 'timestamp-converter', 'nanoid-generator', 'json-formatter'],
    updated: '2026-10-05',
  },

  {
    slug: 'checksum-calculator',
    name: 'Checksum Calculator',
    glyph: 'CRC',
    icon: 'shield',
    category: 'Encode & Hash',
    title: 'Checksum Calculator — CRC32, Adler-32, Fletcher-16',
    description:
      'Compute CRC32, Adler-32, Fletcher-16 and CRC-16 checksums of any text in your browser, with hex and decimal output for data integrity checks.',
    h1: 'Compute CRC and Fletcher checksums for data integrity checks',
    lede: 'Checksums answer a different question from cryptographic hashes: not "could someone forge this" but "did these bytes survive the trip intact". This calculator covers the classic CRC and Fletcher algorithms used by ZIP, PNG, gzip and many binary formats.',
    keywords: [
      'checksum calculator',
      'crc32 online',
      'adler32',
      'crc32 checksum generator',
      'fletcher16',
      'file checksum text',
    ],
    layout: ['facts', 'tool', 'steps', 'faq', 'notes', 'cases', 'related'],
    facts: [
      { label: 'Algorithms', value: 'CRC-32, Adler-32, Fletcher-16' },
      { label: 'Output', value: 'Hex and decimal' },
      { label: 'Input', value: 'UTF-8 bytes' },
    ],
    steps: [
      {
        title: 'Enter the data',
        body: 'Type or paste the bytes you want to checksum. The text is converted to UTF-8 before the checksum is computed, which is what a command line tool would do.',
      },
      {
        title: 'Pick the algorithm',
        body: 'CRC-32 is the one used by ZIP and PNG. Adler-32 is the faster checksum used by zlib. Fletcher-16 is a lightweight variant found in many simple protocols.',
      },
      {
        title: 'Compare the value',
        body: 'A matching checksum confirms the data is byte-identical. A mismatch means corruption somewhere between the two ends.',
      },
    ],
    cases: [
      {
        title: 'Verifying a transferred payload',
        body: 'A CRC attached to a data frame detects truncation and bit flips in transit, which is exactly what a transport protocol needs and what a cryptographic hash does not do efficiently.',
      },
      {
        title: 'Debugging a corrupt archive',
        body: 'When a ZIP file refuses to open, comparing the CRC of each member against the value in the central directory tells you whether the archive itself is damaged or the data was altered.',
      },
      {
        title: 'Implementing a binary format',
        body: 'If you are writing a parser for a format that includes a checksum field, the exact algorithm and byte order matter, and this gives you a reference value to test against.',
      },
    ],
    notes: [
      {
        title: 'Checksum versus hash',
        body: 'A CRC is short, fast and detects accidental corruption, but it is trivial to forge: you can construct a collision in seconds. A cryptographic hash is designed so that producing a matching value is computationally infeasible. Choose a CRC for integrity against noise, a hash for integrity against an adversary.',
      },
    ],
    why: {
      title: 'Binary formats depend on exact byte order',
      body: 'Whether a checksum matches depends on the byte order and on whether the text was encoded as UTF-8. Getting that wrong produces a value that looks plausible and is wrong, so the byte-level details should be visible rather than hidden behind a black box.',
      points: [
        'Standard CRC-32 (IEEE 802.3, the same one used by ZIP and PNG).',
        'Adler-32, the checksum used inside zlib streams.',
        'Fletcher-16, a cheap checksum for small payloads.',
        'Hexadecimal and decimal output side by side.',
      ],
    },
    faq: [
      {
        q: 'Which checksum does ZIP use?',
        a: 'CRC-32, the IEEE polynomial. Each member of a ZIP archive stores its own CRC-32 in the central directory, which is how unzip can verify a member after extraction.',
      },
      {
        q: 'Is CRC-32 good for security?',
        a: 'No. It detects accidental corruption, not tampering. Anyone can deliberately craft two different inputs with the same CRC-32 in seconds, so it must never be used for authentication or signature purposes.',
      },
      {
        q: 'What is the difference between Adler-32 and CRC-32?',
        a: 'Adler-32 is simpler and faster but detects fewer error patterns, and it is weak against reordering. CRC-32 is what you want for general file integrity.',
      },
      {
        q: 'How are the bytes encoded before hashing?',
        a: 'As UTF-8. If you are checksumming binary data, this text-based calculator is the wrong tool — use a file utility such as cksum or md5sum, which read the raw bytes.',
      },
      {
        q: 'Why does my checksum differ from the one on a command line?',
        a: 'Most often the encoding differs, or a trailing newline was added or removed when the text was copied. A newline is a byte, and one extra byte changes the checksum completely.',
      },
      {
        q: 'Can I checksum a file here?',
        a: 'Not as a file upload — this tool works on text, and the point of a checksum utility is to check bytes exactly. Use your platform tool for files: cksum on macOS and Linux, Get-FileHash on Windows.',
      },
    ],
    related: ['hash-generator', 'base64-encoder', 'uuid-generator', 'json-formatter'],
    updated: '2026-09-28',
  },
];

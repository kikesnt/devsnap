import type { ToolDef } from '../types';

export const creatorTools: ToolDef[] = [
  {
    slug: 'snapshot',
    name: 'Code Snapshot',
    glyph: '❯_',
    icon: 'terminal',
    category: 'Create & Share',
    title: 'Code Snapshot — Turn Code Into a Shareable Image',
    description:
      'Turn a code snippet, diff, JSON payload or terminal output into a clean, shareable PNG image. Themes, accents, 2x export, no upload.',
    h1: 'Turn a snippet into an image worth posting',
    lede: 'A screenshot of a code block is the currency of technical communities, and most tools that make one upload your code to a server. This one draws the image in your browser with canvas, so a snippet containing a credential never leaves your machine.',
    keywords: [
      'code screenshot generator',
      'code to image',
      'carbon alternative',
      'share code snippet',
      'code image generator online',
      'beautiful code screenshot',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Rendering', value: 'Canvas, in-browser' },
      { label: 'Output', value: 'PNG, 2x resolution' },
      { label: 'Uploads', value: 'Never' },
    ],
    steps: [
      {
        title: 'Paste what you want to show',
        body: 'Code, a diff, a JSON payload, a stack trace, a terminal session — anything monospaced. The language is detected so the highlighting matches.',
      },
      {
        title: 'Style it',
        body: 'Pick a theme, an accent colour, a font size and whether to show the window chrome. A title bar is a good place for a filename or a ticket number.',
      },
      {
        title: 'Download and post',
        body: 'The image is generated as a PNG at twice the display resolution, so it stays sharp on a retina screen. A share button opens a post-to-X intent with the image already attached.',
      },
    ],
    examples: [
      {
        caption: 'What it works well for',
        headers: ['Content', 'Why it is worth an image'],
        rows: [
          ['A before and after diff', 'A diff in an image reads at a glance; in a text post it is a wall of + and − signs'],
          ['A terminal session', 'Shows the command and the output together, which is the whole point of the terminal'],
          ['A stack trace', 'A shared trace is the fastest way to ask a question about a bug'],
          ['A configuration block', 'The exact YAML somebody is asking about, with the comments intact'],
        ],
      },
    ],
    cases: [
      {
        title: 'Answering a question in a forum or chat',
        body: 'Dropping a rendered snippet into a thread gets an answer far faster than a wall of text, because people read the code and reply to the code.',
      },
      {
        title: 'Documenting a bug report',
        body: 'Attach the image to the issue. The reporter gets to describe the problem in words and you get the exact bytes in a format that cannot be mangled by markdown escaping.',
      },
      {
        title: 'Posting a snippet on a social network',
        body: 'An image of a snippet performs better than a code block in a social timeline, and the code block in a post is usually unreadable on a phone.',
      },
    ],
    notes: [
      {
        title: 'Why this is not an upload',
        body: 'The image is drawn onto a canvas element using the Canvas 2D API and downloaded with a blob URL. There is no request to a rendering service, no account and no queue. A snippet with a customer name or an API key stays in the tab.',
      },
      {
        title: 'Language detection',
        body: 'The highlighter looks at the content and picks a syntax mode, which is why a diff gets green and red lines and a JSON payload gets coloured keys. If the detection is wrong, the colours are still readable, they are just not semantic.',
      },
    ],
    why: {
      title: 'The output is the distribution',
      body: 'Every other tool on this site solves a problem and disappears. This one produces an artefact that people post, and each post is an advert for the site. That is the difference between a tool that earns a few impressions and one that earns thousands.',
      points: [
        'Everything is rendered locally with canvas.',
        'Seven themes, a custom accent colour and adjustable padding.',
        'Exported at 2x so it does not look soft on a retina display.',
        'No watermark, no sign-up, no waiting for a render queue.',
      ],
    },
    faq: [
      {
        q: 'Is my code uploaded anywhere?',
        a: 'No. The image is drawn on a canvas in your browser and downloaded as a blob from that canvas. Open the network panel and you will see the request that loads this page and nothing else.',
      },
      {
        q: 'Can I use this for a diff?',
        a: 'Yes, and it is one of the strongest use cases. Paste the output of git diff and the added and removed lines are highlighted in the classic colours.',
      },
      {
        q: 'What resolution is the exported image?',
        a: 'Twice the on-screen size, so a 900 pixel wide preview exports at 1800 pixels. That keeps the text sharp on a high-density display and when the image is viewed full width on a large monitor.',
      },
      {
        q: 'Can I share directly to X or LinkedIn?',
        a: 'There is a share button that opens a post composer with the image attached where the browser supports it. The native share sheet is used when available, and otherwise the image is downloaded so you can attach it yourself.',
      },
      {
        q: 'Which fonts are used?',
        a: 'The system monospace font, rendered on canvas. That keeps the tool dependency-free and the result consistent with the machine the image was made on.',
      },
      {
        q: 'Is there a limit on how much text I can paste?',
        a: 'The canvas has a finite size, so very long input is trimmed. A few hundred lines renders comfortably, which covers a diff or a stack trace. Beyond that, scroll the source to the part that matters.',
      },
    ],
    related: ['json-formatter', 'diff-checker', 'qr-generator', 'json-diff'],
    updated: '2026-10-15',
  },

  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    glyph: 'QR',
    icon: 'qr',
    category: 'Create & Share',
    title: 'QR Code Generator — Custom QR Codes Online',
    description:
      'Create QR codes for URLs, text, WiFi credentials, vCards and more, with custom colours and error correction. Generated in your browser.',
    h1: 'Generate a QR code without uploading the target',
    lede: 'A QR code for a private link, a ticket or a WiFi password is a QR code for something you did not want to publish. This generator encodes and draws the code in your browser, so the content never reaches a server.',
    keywords: [
      'qr code generator',
      'create qr code',
      'qr generator online',
      'wifi qr code',
      'vcard qr code',
      'custom qr code',
    ],
    layout: ['facts', 'tool', 'steps', 'examples', 'faq', 'cases', 'notes', 'why', 'related'],
    facts: [
      { label: 'Encoding', value: 'Local, canvas-rendered' },
      { label: 'Presets', value: 'URL, WiFi, vCard, email' },
      { label: 'Output', value: 'PNG at any size' },
    ],
    steps: [
      {
        title: 'Choose what the code should hold',
        body: 'A plain URL, WiFi credentials, a vCard contact, an email with a subject, an SMS, or a calendar event. The right fields appear for each choice.',
      },
      {
        title: 'Adjust the appearance',
        body: 'Set the foreground and background colours, pick the size and the error correction level. Keep a strong contrast between the two, or scanners will struggle.',
      },
      {
        title: 'Download it',
        body: 'The code is exported as a PNG at the size you choose, or as an SVG for print. A preview of the scan result is shown next to the code so you can check it with a phone.',
      },
    ],
    examples: [
      {
        caption: 'What each preset encodes',
        headers: ['Preset', 'Payload format'],
        rows: [
          ['URL', '`https://example.com/page?ref=qr`'],
          ['WiFi', '`WIFI:T:WPA;S:Network;P:Password;H:false;;`'],
          ['vCard', '`BEGIN:VCARD` … `END:VCARD`'],
          ['Email', '`mailto:someone@example.com?subject=Hello`'],
          ['SMS', '`SMSTO:+34600000000:Body text`'],
        ],
      },
    ],
    cases: [
      {
        title: 'A WiFi code for a guest network',
        body: 'Guests scan instead of typing a password on a keyboard, which removes the most common reason people ask for the password twice.',
      },
      {
        title: 'A vCard for an event',
        body: 'One scan adds the contact details, which raises the rate at which people actually save them.',
      },
      {
        title: 'A trackable code for print',
        body: 'A UTM-tagged URL in a poster, so the physical distribution is attributed in the analytics report.',
      },
    ],
    notes: [
      {
        title: 'Error correction has a cost',
        body: 'The H level tolerates about 30% damage and makes the code denser, which makes it harder to scan at a distance. Level M, the default here, is the sensible compromise unless you are overlaying a logo, which needs Q or H.',
      },
      {
        title: 'Contrast matters more than resolution',
        body: 'A high-resolution code with a pale foreground on a pale background will fail to scan. Dark on light is the rule, and light-on-dark works only when the scanner is comfortable inverting.',
      },
    ],
    why: {
      title: 'A QR code is a URL, and the URL might be private',
      body: 'The codes that matter most are the ones pointing at a private dashboard, a guest network, a ticket with a personal link or a document with an access token. Generating those on a server means the destination is in somebody else’s log.',
      points: [
        'Encoding and drawing happen in the browser.',
        'Presets for URL, WiFi, vCard, email, SMS and event.',
        'Custom colours, size and error correction level.',
        'PNG download or an SVG for print, with no watermark.',
      ],
    },
    faq: [
      {
        q: 'Is the content of my QR code sent to a server?',
        a: 'No. The payload is encoded into the code locally and drawn on a canvas, then exported as an image from that canvas. Nothing is transmitted.',
      },
      {
        q: 'How big should the printed code be?',
        a: 'A common rule is that the printed code should be at least a tenth of the scanning distance, so a code read from two metres should be at least 20 centimetres across. Test with a phone before printing a batch.',
      },
      {
        q: 'Which error correction level should I pick?',
        a: 'Level M for a clean print on a screen. Level H if you overlay a logo or the code may be partially covered. Higher levels make the code denser, which is harder to scan when small.',
      },
      {
        q: 'Can I put a logo in the middle?',
        a: 'Yes, and you should raise the error correction level to H to compensate for the area the logo covers. Keep the logo under about a quarter of the code.',
      },
      {
        q: 'Do you add a tracking pixel?',
        a: 'No. A dynamic QR code with a tracking pixel has to be resolved through a server, which means a third party can see who scanned it. This one is a static code that goes exactly where you point it.',
      },
      {
        q: 'Can I make the code work for a WiFi network?',
        a: 'Yes. Choose the WiFi preset, enter the network name, the password and the security type. Most phones offer to join the network straight from the scan result.',
      },
    ],
    related: ['utm-builder', 'snapshot', 'color-contrast-checker', 'url-encoder'],
    updated: '2026-10-11',
  },
];

import type { AstroIntegration } from 'astro';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import sharp from 'sharp';
import { tools } from '../data/tools';
import { allGuides as guides } from '../data/guides';
import { SITE } from '../config';

/**
 * Generates the Open Graph images at build time.
 *
 * Each image is a 1200×630 PNG rendered from an SVG template. The title is
 * wrapped manually because SVG has no text wrapping, and the font stack is
 * the system one so the build has no font dependency.
 */

const WIDTH = 1200;
const HEIGHT = 630;

interface OgEntry {
  slug: string;
  title: string;
  kicker: string;
  accent: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function buildSvg({ title, kicker, accent }: OgEntry): string {
  const lines = wrapText(title, 34);
  const fontSize = lines.length > 3 ? 42 : 52;
  const lineHeight = fontSize * 1.22;
  const startY = 268 - ((lines.length - 1) * lineHeight) / 2;

  const text = lines
    .map(
      (line, index) =>
        `<text x="80" y="${Math.round(startY + index * lineHeight)}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" letter-spacing="-1">${escapeXml(line)}</text>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1020"/>
      <stop offset="100%" stop-color="#171a35"/>
    </linearGradient>
    <linearGradient id="accentbar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="1080" cy="120" r="260" fill="${accent}" opacity="0.10"/>
  <circle cx="120" cy="560" r="220" fill="#0ea5e9" opacity="0.08"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="url(#accentbar)"/>
  <g transform="translate(80, 92)">
    <rect width="44" height="44" rx="11" fill="${accent}"/>
    <text x="22" y="30" text-anchor="middle" font-family="Menlo, monospace" font-size="19" font-weight="700" fill="#ffffff">DS</text>
    <text x="62" y="30" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="600" fill="#c7d2fe">${escapeXml(kicker)}</text>
  </g>
  ${text}
  <g transform="translate(80, 546)">
    <rect width="6" height="34" rx="3" fill="${accent}"/>
    <text x="22" y="26" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#9aa4bd">Runs entirely in your browser — nothing is uploaded</text>
  </g>
</svg>`;
}

export function ogImages(): AstroIntegration {
  const entries: OgEntry[] = [
    ...tools.map((tool) => ({
      slug: tool.slug,
      title: tool.h1,
      kicker: tool.name,
      accent: '#4f46e5',
    })),
    ...guides.map((guide) => ({
      slug: `guides/${guide.slug}`,
      title: guide.title,
      kicker: 'Guide',
      accent: '#0ea5e9',
    })),
    {
      slug: 'benchmarks',
      title: 'Every tool, measured',
      kicker: 'Benchmarks',
      accent: '#0f766e',
    },
    {
      slug: 'guides',
      title: 'Guides for the concepts behind the tools',
      kicker: 'Guides',
      accent: '#0ea5e9',
    },
    { slug: 'default', title: SITE.tagline, kicker: SITE.name, accent: '#4f46e5' },
  ];

  return {
    name: 'devsnap:og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const ogDir = join(dir.pathname, 'og');
        await mkdir(ogDir, { recursive: true });

        for (const entry of entries) {
          const svg = buildSvg(entry);
          const buffer = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
          const target = join(ogDir, `${entry.slug}.png`);
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, buffer);
        }

        logger.info(`Generated ${entries.length} Open Graph images`);

        // Apple touch icon, derived from the same brand mark as the favicon.
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
          <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4f46e5"/><stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient></defs>
          <rect width="180" height="180" fill="url(#g)"/>
          <path d="M56 68 L38 90 L56 112" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M124 68 L142 90 L124 112" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M102 52 L78 128" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round"/>
        </svg>`;
        const iconBuffer = await sharp(Buffer.from(icon)).png().toBuffer();
        await writeFile(join(dir.pathname, 'apple-touch-icon.png'), iconBuffer);
      },
    },
  };
}

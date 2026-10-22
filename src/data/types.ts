export interface FaqItem {
  q: string;
  a: string;
}

export interface Step {
  title: string;
  body: string;
}

export interface CaseItem {
  title: string;
  body: string;
}

export interface ExampleTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface Note {
  title: string;
  body: string;
}

export interface WhyBlock {
  title: string;
  body: string;
  points: string[];
}

export interface Fact {
  label: string;
  value: string;
}

/**
 * Ordered list of content modules rendered on a tool page.
 *
 * The order is intentionally different for every tool. A tool site whose
 * 30 pages share an identical module rhythm reads as a template to a human
 * reviewer, and cross-page homogeneity — not per-page word count — is what
 * gets these pages flagged as low value.
 */
export type ModuleId =
  | 'facts'
  | 'tool'
  | 'steps'
  | 'cases'
  | 'examples'
  | 'faq'
  | 'notes'
  | 'why'
  | 'related';

/** Names of the icons in the shared SVG set (see src/components/ToolIcon.astro). */
export type IconName =
  | 'braces'
  | 'yaml'
  | 'xml'
  | 'database'
  | 'table'
  | 'tableArrow'
  | 'entity'
  | 'binary'
  | 'link'
  | 'hash'
  | 'token'
  | 'id'
  | 'shield'
  | 'asterisk'
  | 'clock'
  | 'calendar'
  | 'schema'
  | 'split'
  | 'overlap'
  | 'keyFile'
  | 'tagLink'
  | 'server'
  | 'markdown'
  | 'contrast'
  | 'tag'
  | 'replace'
  | 'calendarSpan'
  | 'terminal'
  | 'qr'
  | 'wrench'
  | 'checklist'
  | 'curl'
  | 'letterCase'
  | 'gitignore'
  | 'sparkle';

export interface ToolDef {
  slug: string;
  name: string;
  /** Short monospace badge shown in the card grid. */
  glyph: string;
  /** Icon from the shared SVG set, used on the cards and the tool header. */
  icon: IconName;
  category: string;
  /** Content of the <title> element. */
  title: string;
  /** Meta description. */
  description: string;
  h1: string;
  lede: string;
  keywords: string[];
  layout: ModuleId[];
  facts?: Fact[];
  steps?: Step[];
  cases?: CaseItem[];
  examples?: ExampleTable[];
  notes?: Note[];
  why?: WhyBlock;
  faq: FaqItem[];
  related: string[];
  updated: string;
}

/**
 * Identifier case conversion.
 *
 * The interesting part is the word splitter: it has to decide where a word
 * boundary is in `userAccountId`, `USER_ID`, `user-id` and `HTTPServer`.
 */

/** Splits an identifier into its words. */
export function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

function lower(word: string): string {
  return word.toLowerCase();
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export const caseStyles = {
  camelCase: (words: string[]) =>
    words.map((word, index) => (index === 0 ? lower(word) : capitalize(word))).join(''),
  PascalCase: (words: string[]) => words.map(capitalize).join(''),
  snake_case: (words: string[]) => words.map(lower).join('_'),
  CONSTANT_CASE: (words: string[]) => words.map((word) => word.toUpperCase()).join('_'),
  'kebab-case': (words: string[]) => words.map(lower).join('-'),
  'dot.case': (words: string[]) => words.map(lower).join('.'),
  'Title Case': (words: string[]) => words.map(capitalize).join(' '),
  'Train-Case': (words: string[]) => words.map(capitalize).join('-'),
  'HTTP Header': (words: string[]) =>
    words.map((word) => word.toUpperCase().replace(/-/g, '')).join('-'),
  'space separated': (words: string[]) => words.map(lower).join(' '),
} as const;

export type CaseStyleName = keyof typeof caseStyles;

export const caseStyleNames = Object.keys(caseStyles) as CaseStyleName[];

export function convertCase(input: string, style: CaseStyleName): string {
  const words = splitWords(input);
  if (words.length === 0) return '';
  return caseStyles[style](words);
}

export function allCaseVariants(input: string): Record<CaseStyleName, string> {
  const words = splitWords(input);
  const out = {} as Record<CaseStyleName, string>;
  for (const name of caseStyleNames) {
    out[name] = words.length === 0 ? '' : caseStyles[name](words);
  }
  return out;
}

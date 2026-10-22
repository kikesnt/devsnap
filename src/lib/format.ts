/**
 * Truncates a string at a word boundary and appends an ellipsis.
 *
 * Used for the short descriptions in card grids, where a cut in the middle of
 * a word reads as a rendering bug.
 */
export function truncate(value: string, maxLength: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;

  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  const body = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${body.replace(/[.,;:]$/, '')}…`;
}

import type { ToolDef } from '../types';
import { formatTools } from './format';
import { encodeTools } from './encode';
import { devTools } from './dev';
import { workflowTools } from './workflow';
import { creatorTools } from './creator';
import { extraTools } from './extra';

export const tools: ToolDef[] = [
  ...extraTools,
  ...creatorTools,
  ...formatTools,
  ...encodeTools,
  ...devTools,
  ...workflowTools,
];

export const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

export const toolCategories = [...new Set(tools.map((tool) => tool.category))];

export function toolsByCategory(): { category: string; tools: ToolDef[] }[] {
  return toolCategories.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category),
  }));
}

export function getTool(slug: string): ToolDef | undefined {
  return toolBySlug.get(slug);
}

/**
 * Resolves the related-tools list, dropping any slug that no longer exists so
 * a stale entry can never produce a broken internal link.
 */
export function resolveRelated(slugs: string[]): ToolDef[] {
  return slugs
    .map((slug) => toolBySlug.get(slug))
    .filter((tool): tool is ToolDef => Boolean(tool));
}

import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

/**
 * Returns merged MDX components for the docs renderer.
 *
 * fumadocs-ui/mdx ships pre-styled heading, code, table, callout etc. components.
 * Add project-specific overrides here as needed.
 *
 * The cast to unknown→MDXComponents bypasses a deep generic incompatibility
 * between fumadocs-ui's component types and the mdx/types MDXComponents index
 * signature — this is a known upstream type mismatch.
 */
export function getMDXComponents(overrides?: MDXComponents): MDXComponents {
  return {
    ...(defaultMdxComponents as unknown as MDXComponents),
    ...overrides,
  };
}

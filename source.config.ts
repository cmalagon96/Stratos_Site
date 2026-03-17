import { defineConfig, defineDocs } from "fumadocs-mdx/config";

// ─── Docs Collection ──────────────────────────────────────────────────────────
// Scans content/docs/**/*.mdx and makes pages available via fumadocs-core
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    // Add remark/rehype plugins here as needed
  },
});

import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { source } from "@/lib/docs-source";
import "fumadocs-ui/style.css";

/**
 * Docs layout — wraps all /docs pages with Fumadocs UI sidebar + navigation.
 *
 * RootProvider is required by fumadocs-ui for search, theme, and i18n context.
 * DocsLayout provides the collapsible sidebar with the page tree from our
 * docs content collection.
 */
export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>
          <DocsLayout
            tree={source.pageTree}
            nav={{
              title: (
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "oklch(72% 0.19 160)",
                  }}
                >
                  Stratos Docs
                </span>
              ),
              url: "/docs",
            }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}

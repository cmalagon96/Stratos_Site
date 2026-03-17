import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/page";
import { getMDXComponents } from "@/lib/mdx-components";
import { source } from "@/lib/docs-source";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

// ─── Static Generation ────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return source.generateParams();
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: `https://stratosstrat.com/docs/${slug?.join("/") ?? ""}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DocsContentPage({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description && (
        <DocsDescription>{page.data.description}</DocsDescription>
      )}
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

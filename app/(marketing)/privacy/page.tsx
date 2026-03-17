import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Stratos Strategies LLC collects, uses, and protects your personal information.",
  robots: { index: true, follow: false },
};

/**
 * Privacy Policy page.
 *
 * Replace the TERMLY_EMBED_ID value below with the actual embed ID from your
 * Termly dashboard once the policy is generated:
 *   https://app.termly.io → Privacy Policy → Embed
 *
 * The Termly embed script auto-renders into the div with
 * data-id matching your policy ID.
 */
const TERMLY_EMBED_ID = process.env.NEXT_PUBLIC_TERMLY_PRIVACY_ID ?? "";

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 md:px-12">
      {/* Page header */}
      <div
        className="mb-3 text-[0.52rem] uppercase tracking-[0.45em] text-emerald"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Legal
      </div>

      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-text-hi md:text-5xl">
        Privacy Policy
      </h1>

      <p
        className="mb-12 text-[0.7rem] uppercase tracking-[0.3em] text-text-lo"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Stratos Strategies LLC — Last updated via Termly
      </p>

      {/* Termly embed container */}
      {TERMLY_EMBED_ID ? (
        <div
          className="prose-invert prose max-w-none [&_a]:text-emerald [&_h2]:text-text-hi [&_h3]:text-text-mid [&_p]:text-text-mid"
          // Termly populates this div via its embed script (loaded in <head>)
          data-id={TERMLY_EMBED_ID}
          data-type="iframe"
          style={{ minHeight: "600px" }}
        />
      ) : (
        /* Fallback while Termly ID is not yet configured */
        <div className="glass space-y-6 p-8">
          <p className="text-sm leading-relaxed text-text-mid">
            Stratos Strategies LLC (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your
            privacy and is committed to protecting your personal information.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Information We Collect
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            We collect information you provide directly (name, email, company) when
            you contact us or create an account. We also collect usage data through
            PostHog analytics in cookie-free mode, which means no cookies are placed
            on your device and no cross-site tracking occurs.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            How We Use Your Information
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            We use your information to provide our services, respond to inquiries,
            send transactional emails, and improve our products. We do not sell or
            rent your personal data to third parties.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Analytics
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            This site uses PostHog in cookie-free, memory-only persistence mode.
            No tracking cookies are set. Session data is not stored between visits.
            Do Not Track (DNT) signals are respected — analytics are disabled when
            DNT is enabled in your browser.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Contact
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            For privacy-related questions, contact us at{" "}
            <a
              href="mailto:privacy@stratosstrat.com"
              className="text-emerald underline underline-offset-2 hover:text-emerald-bright"
            >
              privacy@stratosstrat.com
            </a>
            .
          </p>

          <p
            className="pt-4 text-[0.55rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Full policy via Termly — set NEXT_PUBLIC_TERMLY_PRIVACY_ID to enable embed
          </p>
        </div>
      )}
    </section>
  );
}

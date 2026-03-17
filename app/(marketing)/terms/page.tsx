import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing use of Stratos Strategies LLC products and services.",
  robots: { index: true, follow: false },
};

/**
 * Terms of Service page.
 *
 * Replace TERMLY_EMBED_ID with the actual embed ID from your Termly dashboard:
 *   https://app.termly.io → Terms of Service → Embed
 */
const TERMLY_EMBED_ID = process.env.NEXT_PUBLIC_TERMLY_TERMS_ID ?? "";

export default function TermsPage() {
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
        Terms of Service
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
          data-id={TERMLY_EMBED_ID}
          data-type="iframe"
          style={{ minHeight: "600px" }}
        />
      ) : (
        /* Fallback while Termly ID is not yet configured */
        <div className="glass space-y-6 p-8">
          <p className="text-sm leading-relaxed text-text-mid">
            By accessing or using Stratos Strategies LLC products and services, you
            agree to be bound by these Terms of Service. Please read them carefully
            before using our platform.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Acceptance of Terms
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            These terms govern your use of all Stratos Strategies LLC products
            including BillFlow, RosaBio, GenThrust, and associated services. By
            creating an account or making a purchase, you accept these terms.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            License
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            Stratos Strategies LLC grants you a limited, non-exclusive,
            non-transferable license to use our software products for your internal
            business purposes. You may not reverse engineer, resell, or redistribute
            our products without written permission.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Payment & Subscriptions
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            Subscription fees are billed in advance on a monthly or annual basis.
            All payments are processed securely via Stripe. Refunds are handled on a
            case-by-case basis — contact support within 14 days of a charge for
            consideration.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Limitation of Liability
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            To the maximum extent permitted by law, Stratos Strategies LLC shall not
            be liable for indirect, incidental, or consequential damages arising from
            your use of our services.
          </p>

          <h2
            className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Contact
          </h2>
          <p className="text-sm leading-relaxed text-text-mid">
            Questions about these terms? Email us at{" "}
            <a
              href="mailto:legal@stratosstrat.com"
              className="text-emerald underline underline-offset-2 hover:text-emerald-bright"
            >
              legal@stratosstrat.com
            </a>
            .
          </p>

          <p
            className="pt-4 text-[0.55rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Full policy via Termly — set NEXT_PUBLIC_TERMLY_TERMS_ID to enable embed
          </p>
        </div>
      )}
    </section>
  );
}

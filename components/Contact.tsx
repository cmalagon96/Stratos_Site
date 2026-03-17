"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { EnvelopeSimple, MapPin, Buildings, PaperPlaneTilt, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { contactSchema } from "@/lib/schemas/contact";
import type { ZodError } from "zod";

const initialForm = {
  name: "",
  email: "",
  company: "",
  projectType: "Cloud Infrastructure",
  message: ""
};

const PROJECT_TYPES = [
  "Cloud Infrastructure",
  "Compliance & Security",
  "Software Development",
  "Business Automation",
  "Aviation Technology",
  "Other"
];

type FieldErrors = Partial<Record<keyof typeof initialForm, string>>;

export default function Contact() {
  const [formState, setFormState] = useState(initialForm);
  const [status, setStatus]       = useState<"idle" | "sending" | "success" | "error">("idle");
  // P2-07: Inline field-level validation errors from Zod
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear the field's error as the user types
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // P2-07: Validate with the shared Zod schema before sending
    const result = contactSchema.safeParse(formState);
    if (!result.success) {
      const errors: FieldErrors = {};
      (result.error as ZodError).issues.forEach((issue) => {
        const field = issue.path[0] as keyof FieldErrors;
        if (field && !errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data)
      });
      if (!response.ok) throw new Error("Submission failed");
      setStatus("success");
      setFormState(initialForm);
    } catch {
      setStatus("error");
    }
  };

  const inputCls = [
    "w-full bg-[oklch(13%_0.010_160)] border border-[oklch(72%_0.19_160/0.10)]",
    "px-4 py-3 text-[0.88rem] text-[oklch(80%_0.01_160)]",
    "placeholder:text-[oklch(28%_0.01_160)]",
    "outline-none transition-all duration-200",
    "focus:border-[oklch(72%_0.19_160/0.55)] focus:shadow-[0_0_18px_oklch(72%_0.19_160/0.08)]",
    "rounded-none"
  ].join(" ");

  const inputErrorCls = inputCls.replace(
    "border-[oklch(72%_0.19_160/0.10)]",
    "border-[oklch(62%_0.22_25/0.55)]"
  );

  const labelCls = "block text-[0.55rem] uppercase tracking-[0.38em] text-[oklch(36%_0.01_160)] mb-2";
  const errorCls = "mt-1 block text-[0.62rem] uppercase tracking-[0.2em]";

  const inputClass = (field: keyof FieldErrors) =>
    fieldErrors[field] ? inputErrorCls : inputCls;

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-32 scroll-mt-20"
      style={{ background: "oklch(10% 0.010 160)" }}
    >
      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />

      {/* Bottom bloom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 100%, oklch(72% 0.19 160 / 0.04) 0%, transparent 65%)"
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">

        {/* Header */}
        <m.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <span className="section-label">Let&apos;s Talk</span>
          <h2
            className="mt-5 max-w-2xl text-[2.5rem] uppercase leading-[0.91] tracking-[0.015em] text-white md:text-[3.4rem]"
            style={{ fontWeight: 900 }}
          >
            Ready to start? Tell us about your{" "}
            <span style={{ color: "oklch(72% 0.19 160)" }}>project.</span>
          </h2>
          <p className="mt-5 max-w-lg text-[0.9rem] leading-relaxed text-[oklch(38%_0.01_160)]">
            All inquiries are handled directly by our principals. Average response time: 24 hours.
          </p>
        </m.div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">

          {/* Form */}
          <m.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.55 }}
            noValidate
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label>
                  <span className={labelCls} style={{ fontFamily: "var(--font-mono)" }}>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className={inputClass("name")}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "error-name" : undefined}
                  />
                </label>
                {fieldErrors.name && (
                  <span id="error-name" className={errorCls} style={{ fontFamily: "var(--font-mono)", color: "oklch(62% 0.22 25)" }}>
                    {fieldErrors.name}
                  </span>
                )}
              </div>
              <div>
                <label>
                  <span className={labelCls} style={{ fontFamily: "var(--font-mono)" }}>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    placeholder="you@company.com"
                    className={inputClass("email")}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "error-email" : undefined}
                  />
                </label>
                {fieldErrors.email && (
                  <span id="error-email" className={errorCls} style={{ fontFamily: "var(--font-mono)", color: "oklch(62% 0.22 25)" }}>
                    {fieldErrors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label>
                  <span className={labelCls} style={{ fontFamily: "var(--font-mono)" }}>Company (Optional)</span>
                  <input
                    type="text"
                    name="company"
                    value={formState.company}
                    onChange={handleChange}
                    placeholder="Your company"
                    className={inputClass("company")}
                    aria-invalid={!!fieldErrors.company}
                    aria-describedby={fieldErrors.company ? "error-company" : undefined}
                  />
                </label>
                {fieldErrors.company && (
                  <span id="error-company" className={errorCls} style={{ fontFamily: "var(--font-mono)", color: "oklch(62% 0.22 25)" }}>
                    {fieldErrors.company}
                  </span>
                )}
              </div>
              <div>
                <label>
                  <span className={labelCls} style={{ fontFamily: "var(--font-mono)" }}>Project Type</span>
                  <select
                    name="projectType"
                    value={formState.projectType}
                    onChange={handleChange}
                    className={inputClass("projectType")}
                    aria-invalid={!!fieldErrors.projectType}
                    aria-describedby={fieldErrors.projectType ? "error-projectType" : undefined}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
                {fieldErrors.projectType && (
                  <span id="error-projectType" className={errorCls} style={{ fontFamily: "var(--font-mono)", color: "oklch(62% 0.22 25)" }}>
                    {fieldErrors.projectType}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label>
                <span className={labelCls} style={{ fontFamily: "var(--font-mono)" }}>Message</span>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe your project, timeline, and technical requirements..."
                  className={inputClass("message") + " resize-none"}
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={fieldErrors.message ? "error-message" : undefined}
                />
              </label>
              {fieldErrors.message && (
                <span id="error-message" className={errorCls} style={{ fontFamily: "var(--font-mono)", color: "oklch(62% 0.22 25)" }}>
                  {fieldErrors.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center gap-5">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-3 border border-[oklch(72%_0.19_160/0.40)] bg-[oklch(72%_0.19_160/0.08)] px-8 py-4 transition-all duration-300 disabled:opacity-50 hover:border-[oklch(72%_0.19_160/0.75)] hover:bg-[oklch(72%_0.19_160/0.14)] hover:shadow-[0_0_28px_oklch(72%_0.19_160/0.18)]"
              >
                <span
                  className="text-[0.6rem] uppercase tracking-[0.38em] text-emerald"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {status === "sending" ? "Transmitting..." : "Send Message"}
                </span>
                <PaperPlaneTilt
                  weight="bold"
                  size={14}
                  className="text-emerald transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>

            {/* Status messages */}
            {status === "success" && (
              <m.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <CheckCircle weight="fill" size={16} style={{ color: "oklch(72% 0.19 160)" }} />
                <span
                  className="text-[0.78rem] uppercase tracking-[0.2em] text-emerald"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Message received. We will respond shortly.
                </span>
              </m.div>
            )}
            {status === "error" && (
              <m.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <WarningCircle weight="fill" size={16} style={{ color: "oklch(62% 0.22 25)" }} />
                <span
                  className="text-[0.78rem] uppercase tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-mono)", color: "oklch(62% 0.22 25)" }}
                >
                  Transmission failed. Please try again.
                </span>
              </m.div>
            )}
          </m.form>

          {/* Contact sidebar */}
          <m.div
            className="flex flex-col gap-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            {/* Contact info card */}
            <div
              className="border border-[oklch(72%_0.19_160/0.10)] bg-[oklch(13%_0.010_160)] p-7"
            >
              <span
                className="block text-[0.55rem] uppercase tracking-[0.45em] text-[oklch(30%_0.01_160)] mb-6"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Contact Details
              </span>

              {[
                { Icon: EnvelopeSimple, label: "Email", value: "contact@stratosstrat.com", isLink: true, href: "mailto:contact@stratosstrat.com" },
                { Icon: MapPin, label: "Location", value: "Doral, FL", isLink: false, href: null },
                { Icon: Buildings, label: "Entity", value: "Stratos Strategies LLC", isLink: false, href: null }
              ].map(({ Icon, label, value, isLink, href }) => (
                <div key={label} className="group flex items-start gap-4 py-4 border-b border-[oklch(72%_0.19_160/0.06)] last:border-0">
                  <div
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(72%_0.19_160/0.05)]"
                  >
                    <Icon weight="bold" size={13} style={{ color: "oklch(72% 0.19 160 / 0.7)" }} />
                  </div>
                  <div>
                    <span
                      className="block text-[0.52rem] uppercase tracking-[0.38em] text-[oklch(30%_0.01_160)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {label}
                    </span>
                    {isLink && href ? (
                      <a
                        href={href}
                        className="mt-1 block text-[0.82rem] text-[oklch(58%_0.01_160)] transition-colors duration-200 hover:text-emerald"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="mt-1 block text-[0.82rem] text-[oklch(58%_0.01_160)]">
                        {value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Response time block */}
            <div
              className="border border-t-0 border-[oklch(72%_0.19_160/0.10)] p-5"
              style={{ background: "oklch(72% 0.19 160 / 0.03)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 h-[6px] w-[6px] flex-shrink-0 rounded-full bg-emerald"
                  style={{ boxShadow: "0 0 8px oklch(72% 0.19 160 / 0.6)" }}
                />
                <p
                  className="text-[0.75rem] leading-[1.7] text-[oklch(35%_0.01_160)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Average response time: 24 hours.
                  <br />
                  All inquiries handled directly by our principals.
                  <br />
                  No outsourcing. No bots.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Building2 } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  company: "",
  projectType: "Cloud Infrastructure",
  message: ""
};

export default function Contact() {
  const [formState, setFormState] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setStatus("success");
      setFormState(initialForm);
    } catch (error) {
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-glass-border bg-obsidian-mid px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:border-aviation-cobalt focus:outline-none focus:ring-1 focus:ring-aviation-cobalt/50 transition-colors";

  return (
    <section id="contact" className="relative bg-obsidian-light py-24">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-bio-mint">
            Let&apos;s Talk
          </span>
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            Ready to start? Tell us about your project.
          </h2>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                Name
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                Email
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className={inputClasses}
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                Company (Optional)
                <input
                  type="text"
                  name="company"
                  value={formState.company}
                  onChange={handleChange}
                  placeholder="Your company"
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                Project Type
                <select
                  name="projectType"
                  value={formState.projectType}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option>Cloud Infrastructure</option>
                  <option>Compliance &amp; Security</option>
                  <option>Software Development</option>
                  <option>Automation</option>
                  <option>Aviation Technology</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
              Message
              <textarea
                name="message"
                value={formState.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Tell us about your project..."
                className={inputClasses + " resize-none"}
              />
            </label>

            <button
              type="submit"
              className="group inline-flex w-fit items-center gap-3 rounded-lg border border-bio-mint/50 bg-bio-mint/10 px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-bio-mint transition-all duration-300 hover:border-bio-mint hover:bg-bio-mint/20 hover:shadow-glow-mint disabled:opacity-50"
              disabled={status === "sending"}
            >
              <span>{status === "sending" ? "Sending..." : "Send Message"}</span>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {status === "success" && (
              <p className="text-sm text-bio-mint">
                Message received. We will respond shortly.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-rose">
                Something went wrong. Please try again.
              </p>
            )}
          </motion.form>

          <motion.div
            className="flex flex-col gap-6 rounded-xl border border-glass-border bg-obsidian-mid p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-glass-border bg-aviation-cobalt/10 p-2">
                <Mail className="h-4 w-4 text-aviation-cobalt" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  contact@stratosstrat.com
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-glass-border bg-dna-purple/10 p-2">
                <MapPin className="h-4 w-4 text-dna-purple" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                  Location
                </p>
                <p className="mt-1 text-sm text-slate-300">Doral, FL</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-glass-border bg-bio-mint/10 p-2">
                <Building2 className="h-4 w-4 text-bio-mint" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                  Entity
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Stratos Strategies LLC
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

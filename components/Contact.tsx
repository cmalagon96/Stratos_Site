"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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

  return (
    <section id="contact" className="relative bg-navy-deep py-24">
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-teal-bright">
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
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Name
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-[rgba(232,236,241,0.18)] bg-navy-mid px-4 py-3 text-sm text-silver-light focus:border-teal-bright focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Email
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-[rgba(232,236,241,0.18)] bg-navy-mid px-4 py-3 text-sm text-silver-light focus:border-teal-bright focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Company (Optional)
                <input
                  type="text"
                  name="company"
                  value={formState.company}
                  onChange={handleChange}
                  className="w-full border border-[rgba(232,236,241,0.18)] bg-navy-mid px-4 py-3 text-sm text-silver-light focus:border-teal-bright focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Project Type
                <select
                  name="projectType"
                  value={formState.projectType}
                  onChange={handleChange}
                  className="w-full border border-[rgba(232,236,241,0.18)] bg-navy-mid px-4 py-3 text-sm text-silver-light focus:border-teal-bright focus:outline-none"
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

            <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
              Message
              <textarea
                name="message"
                value={formState.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full border border-[rgba(232,236,241,0.18)] bg-navy-mid px-4 py-3 text-sm text-silver-light focus:border-teal-bright focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-fit bg-teal-bright px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-navy-deep transition-all duration-300 hover:shadow-tealGlow"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <p className="text-sm text-teal-bright">
                Message received. We will respond shortly.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-300">
                Something went wrong. Please try again.
              </p>
            )}
          </motion.form>

          <motion.div
            className="flex flex-col gap-4 border border-[rgba(232,236,241,0.18)] bg-navy-mid px-6 py-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Email
              </p>
              <p className="text-sm text-silver-light">
                contact@stratosstrat.com
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Location
              </p>
              <p className="text-sm text-silver-light">Doral, FL</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                Entity
              </p>
              <p className="text-sm text-silver-light">
                Stratos Strategies LLC
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

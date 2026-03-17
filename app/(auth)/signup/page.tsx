"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";
import { signUp } from "@/lib/auth/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupForm, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const result = signupSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignupForm, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupForm;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await signUp.email(
        {
          email: form.email,
          password: form.password,
          name: form.name,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (ctx) => {
            setServerError(ctx.error.message ?? "Registration failed. Please try again.");
          },
        },
      );
      if (error) {
        setServerError(error.message ?? "Registration failed. Please try again.");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-8 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <span className="section-label mb-3">New Account</span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-text-hi">
          Create Account
        </h1>
        <p className="mt-2 text-xs text-text-mid">
          Get access to products, licenses, and your personal dashboard.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div
          className="mb-6 border border-[oklch(62%_0.22_25/0.35)] bg-[oklch(62%_0.22_25/0.06)] p-3"
          role="alert"
        >
          <p
            className="text-[0.55rem] uppercase tracking-[0.3em] text-[oklch(62%_0.22_25)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {serverError}
          </p>
        </div>
      )}

      {/* Registration form */}
      <form
        className="flex flex-col gap-5"
        aria-label="Create account form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Name */}
        <Input
          label="Full Name"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
        />

        {/* Email */}
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
        />

        {/* Password */}
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Min. 12 characters"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          hint="At least 12 characters with uppercase, lowercase, and a number"
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          error={errors.confirmPassword}
        />

        {/* Submit */}
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Create Account
        </Button>
      </form>

      {/* TOS */}
      <p className="mt-4 text-center text-[0.52rem] leading-relaxed text-text-lo">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-emerald-dim hover:text-emerald">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-emerald-dim hover:text-emerald">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-6 text-center text-xs text-text-mid">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald transition-colors hover:text-emerald-bright">
          Sign in
        </Link>
      </p>
    </div>
  );
}

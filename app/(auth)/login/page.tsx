"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod/v4";
import { signIn, authClient } from "@/lib/auth/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="glass p-8 md:p-10 flex items-center justify-center min-h-[400px]">
          <span className="text-xs uppercase tracking-[0.3em] text-text-lo" style={{ fontFamily: "var(--font-mono)" }}>
            Loading...
          </span>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Validate callbackUrl is a relative path to prevent open redirect
  const rawCallback = searchParams.get("callbackUrl") ?? "/dashboard";
  const callbackUrl = rawCallback.startsWith("/") && !rawCallback.startsWith("//")
    ? rawCallback
    : "/dashboard";

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  function validate(): boolean {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginForm, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginForm;
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
      const { error } = await signIn.email(
        {
          email: form.email,
          password: form.password,
          callbackURL: callbackUrl,
        },
        {
          onSuccess: () => {
            router.push(callbackUrl);
          },
          onError: (ctx) => {
            setServerError(ctx.error.message ?? "Invalid credentials. Please try again.");
          },
        },
      );
      if (error) {
        setServerError(error.message ?? "Invalid credentials. Please try again.");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasskeySignIn() {
    setServerError(null);
    setPasskeyLoading(true);
    try {
      const { error } = await authClient.signIn.passkey();
      if (error) {
        setServerError(error.message ?? "Passkey authentication failed.");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setServerError("Passkey authentication failed. Please try again.");
    } finally {
      setPasskeyLoading(false);
    }
  }

  return (
    <div className="glass p-8 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <span
          className="section-label mb-3"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Account Access
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight text-text-hi">
          Sign In
        </h1>
        <p className="mt-2 text-xs text-text-mid">
          Welcome back. Enter your credentials to access your dashboard.
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

      {/* Login form */}
      <form
        className="flex flex-col gap-5"
        aria-label="Sign in form"
        onSubmit={handleSubmit}
        noValidate
      >
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="flex items-center gap-1 text-[0.52rem] uppercase tracking-[0.38em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Password
              <span className="text-emerald" aria-hidden="true">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[0.52rem] uppercase tracking-[0.3em] text-emerald-dim transition-colors hover:text-emerald"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            aria-invalid={!!errors.password}
            className={[
              "w-full rounded-none border bg-[oklch(10%_0.010_160)] px-3 py-2.5 text-xs text-text-hi",
              "placeholder:text-text-lo",
              "transition-all duration-200 outline-none",
              "focus:border-[oklch(72%_0.19_160/0.6)] focus:shadow-[0_0_0_1px_oklch(72%_0.19_160/0.25)]",
              errors.password
                ? "border-[oklch(62%_0.22_25/0.50)]"
                : "border-[oklch(22%_0.015_160)]",
            ].join(" ")}
          />
          {errors.password && (
            <p
              role="alert"
              className="text-[0.52rem] uppercase tracking-[0.32em] text-[oklch(62%_0.22_25)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-[oklch(72%_0.19_160/0.08)]" />
        <span
          className="text-[0.48rem] uppercase tracking-[0.4em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          or
        </span>
        <div className="h-[1px] flex-1 bg-[oklch(72%_0.19_160/0.08)]" />
      </div>

      {/* Passkey sign-in */}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        loading={passkeyLoading}
        onClick={handlePasskeySignIn}
      >
        Sign In with Passkey
      </Button>

      {/* Sign up link */}
      <p className="mt-6 text-center text-xs text-text-mid">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-emerald transition-colors hover:text-emerald-bright"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

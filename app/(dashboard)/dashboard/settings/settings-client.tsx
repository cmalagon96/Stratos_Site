"use client";

import { useState, useCallback } from "react";
import { useSession, signOut, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block text-[0.52rem] uppercase tracking-[0.38em] text-text-lo"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-6 text-[0.55rem] uppercase tracking-[0.42em] text-emerald"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </h2>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <MonoLabel>{label}</MonoLabel>
      <div className="border border-[oklch(22%_0.015_160)] bg-surface px-4 py-2.5">
        <span className="text-sm text-text-hi">{value || "—"}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Change Password Section
// ---------------------------------------------------------------------------

function ChangePasswordSection() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (form.newPassword !== form.confirmPassword) {
        setErrorMsg("New passwords do not match.");
        setStatus("error");
        return;
      }
      if (form.newPassword.length < 8) {
        setErrorMsg("Password must be at least 8 characters.");
        setStatus("error");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        const result = await authClient.changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });

        if (result.error) {
          setErrorMsg(result.error.message ?? "Failed to update password.");
          setStatus("error");
        } else {
          setStatus("success");
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
      } catch {
        setErrorMsg("An unexpected error occurred.");
        setStatus("error");
      }
    },
    [form],
  );

  return (
    <section className="glass p-6 md:p-8">
      <SectionHeading>Change Password</SectionHeading>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <MonoLabel>Current Password</MonoLabel>
            <input
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
              required
              className="border border-[oklch(22%_0.015_160)] bg-surface px-4 py-2.5 text-sm text-text-hi outline-none transition-colors focus:border-emerald/40 focus:bg-depth"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <MonoLabel>New Password</MonoLabel>
            <input
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              required
              minLength={8}
              className="border border-[oklch(22%_0.015_160)] bg-surface px-4 py-2.5 text-sm text-text-hi outline-none transition-colors focus:border-emerald/40 focus:bg-depth"
              placeholder="min. 8 characters"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <MonoLabel>Confirm New Password</MonoLabel>
            <input
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              className="border border-[oklch(22%_0.015_160)] bg-surface px-4 py-2.5 text-sm text-text-hi outline-none transition-colors focus:border-emerald/40 focus:bg-depth"
              placeholder="••••••••"
            />
          </div>
        </div>

        {status === "error" && (
          <p className="mt-4 text-xs text-red-400">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="mt-4 text-xs text-emerald">Password updated successfully.</p>
        )}

        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={status === "loading"} size="sm">
            Update Password
          </Button>
        </div>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Passkeys Section
// ---------------------------------------------------------------------------

function PasskeysSection() {
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const addPasskey = useCallback(async () => {
    setAdding(true);
    setFeedback(null);
    try {
      const result = await authClient.passkey.addPasskey();
      if (result?.error) {
        setFeedback("Failed to add passkey: " + (result.error.message ?? "Unknown error"));
      } else {
        setFeedback("Passkey added successfully.");
      }
    } catch {
      setFeedback("An unexpected error occurred.");
    } finally {
      setAdding(false);
    }
  }, []);

  return (
    <section className="glass p-6 md:p-8">
      <SectionHeading>Passkeys</SectionHeading>

      <p className="mb-6 text-sm text-text-mid">
        Passkeys allow you to sign in with biometrics or a hardware key, without a password.
      </p>

      <div className="mb-4 border border-[oklch(72%_0.19_160/0.07)] p-4">
        <p
          className="text-[0.5rem] uppercase tracking-[0.3em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Device passkeys are managed through your browser&apos;s credential manager.
          Click &ldquo;Add Passkey&rdquo; to register the current device.
        </p>
      </div>

      {feedback && (
        <p className={`mb-4 text-xs ${feedback.startsWith("Failed") ? "text-red-400" : "text-emerald"}`}>
          {feedback}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={adding}
          onClick={addPasskey}
        >
          + Add Passkey
        </Button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Danger Zone Section
// ---------------------------------------------------------------------------

function DangerZoneSection() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await authClient.deleteUser();
      await signOut();
      window.location.href = "/";
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }, []);

  return (
    <section className="border border-[oklch(62%_0.22_25/0.18)] bg-[oklch(62%_0.22_25/0.03)] p-6 md:p-8">
      <h2
        className="mb-4 text-[0.55rem] uppercase tracking-[0.42em] text-error"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Danger Zone
      </h2>
      <p className="mb-6 text-sm text-text-mid">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!confirming ? (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setConfirming(true)}
        >
          Delete Account
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-error">
            Are you absolutely sure? All your orders, licenses, and data will be permanently removed.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
            >
              Yes, Delete My Account
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SettingsClient() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass p-6 md:p-8">
            <div className="mb-6 h-3 w-24 animate-pulse rounded-none bg-surface" />
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-2.5 w-20 animate-pulse rounded-none bg-surface" />
                  <div className="h-10 w-full animate-pulse rounded-none bg-surface" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="flex flex-col gap-8">
      {/* Profile — read-only from Better Auth session */}
      <section className="glass p-6 md:p-8">
        <SectionHeading>Profile</SectionHeading>
        <div className="grid gap-5 md:grid-cols-2">
          <FieldRow label="Full Name"    value={user?.name ?? ""} />
          <FieldRow label="Email Address" value={user?.email ?? ""} />
        </div>
        <p
          className="mt-4 text-[0.5rem] uppercase tracking-[0.28em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Name and email are managed through your identity provider.
        </p>
      </section>

      {/* Change password */}
      <ChangePasswordSection />

      {/* Passkeys */}
      <PasskeysSection />

      {/* Danger zone */}
      <DangerZoneSection />
    </div>
  );
}

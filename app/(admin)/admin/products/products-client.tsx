"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  type: "saas" | "desktop" | "cli" | "template" | "report";
  price: number;
  currency: string;
  isActive: boolean;
  features: string[];
  createdAt: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: "saas" | "desktop" | "cli" | "template" | "report";
  price: number;
  currency: string;
  isActive: boolean;
  /** Newline-separated string for the textarea — converted to string[] on submit */
  features: string;
}

const PRODUCT_TYPES = ["saas", "desktop", "cli", "template", "report"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function MonoLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[0.52rem] uppercase tracking-[0.38em] text-text-lo" style={{ fontFamily: "var(--font-mono)" }}>
      {children}
      {required && <span className="ml-1 text-error">*</span>}
    </label>
  );
}

const INPUT_CLS = "w-full border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] px-3 py-2 text-sm text-text-hi outline-none transition-colors focus:border-[oklch(62%_0.22_25/0.4)] focus:bg-[oklch(8%_0.008_160)]";

// ---------------------------------------------------------------------------
// Product form — used for both create and edit
// ---------------------------------------------------------------------------

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  type: "saas",
  price: 0,
  currency: "usd",
  isActive: true,
  features: "",
};

function ProductFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Product | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(() => {
    if (!initial) return EMPTY_FORM;
    return {
      name: initial.name,
      slug: initial.slug,
      description: initial.description ?? "",
      shortDescription: initial.shortDescription ?? "",
      type: initial.type,
      price: initial.price,
      currency: initial.currency,
      isActive: initial.isActive,
      features: (initial.features ?? []).join("\n"),
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const set = useCallback(<K extends keyof ProductFormData>(
    key: K,
    val: ProductFormData[K],
  ) => {
    setForm((p) => ({ ...p, [key]: val }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        shortDescription: form.shortDescription || null,
        type: form.type,
        price: Number(form.price),
        currency: form.currency,
        isActive: form.isActive,
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      try {
        const url = initial
          ? `/api/admin/products/${initial.id}`
          : "/api/admin/products";
        const method = initial ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (json.success) {
          onSave();
        } else {
          setError(json.error?.message ?? "Failed to save product");
        }
      } catch {
        setError("Network error — please try again");
      } finally {
        setSaving(false);
      }
    },
    [form, initial, onSave],
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Edit product" : "Add product"}
        className="fixed inset-x-4 top-8 z-50 mx-auto max-w-2xl overflow-y-auto border border-[oklch(62%_0.22_25/0.25)] bg-[oklch(5%_0.006_160)] p-8 shadow-2xl md:inset-x-auto"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-[0.6rem] uppercase tracking-[0.4em] text-error"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {initial ? "Edit Product" : "New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-lo transition-colors hover:text-text-hi"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <MonoLabel required>Name</MonoLabel>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={INPUT_CLS}
                placeholder="Product name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <MonoLabel required>Slug</MonoLabel>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className={INPUT_CLS}
                placeholder="product-slug"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <MonoLabel>Short Description</MonoLabel>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              className={INPUT_CLS}
              placeholder="One-line summary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <MonoLabel>Full Description</MonoLabel>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={INPUT_CLS + " resize-none"}
              placeholder="Full product description..."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <MonoLabel required>Type</MonoLabel>
              <select
                required
                value={form.type}
                onChange={(e) => set("type", e.target.value as Product["type"])}
                className={INPUT_CLS}
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <MonoLabel required>Price (cents)</MonoLabel>
              <input
                type="number"
                required
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => set("price", parseInt(e.target.value, 10) || 0)}
                className={INPUT_CLS}
                placeholder="9900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <MonoLabel>Currency</MonoLabel>
              <input
                type="text"
                maxLength={3}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value.toLowerCase())}
                className={INPUT_CLS}
                placeholder="usd"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <MonoLabel>Features (one per line)</MonoLabel>
            <textarea
              rows={4}
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
              className={INPUT_CLS + " resize-none"}
              placeholder={"Feature one\nFeature two\nFeature three"}
            />
          </div>

          {/* Active toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="sr-only"
            />
            <div
              className={`relative h-5 w-9 transition-colors ${form.isActive ? "bg-emerald/30" : "bg-surface"}`}
              onClick={() => set("isActive", !form.isActive)}
              role="switch"
              aria-checked={form.isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") set("isActive", !form.isActive);
              }}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 transition-transform ${form.isActive ? "translate-x-4 bg-emerald" : "translate-x-0.5 bg-text-lo"}`}
              />
            </div>
            <span
              className="text-[0.52rem] uppercase tracking-[0.32em] text-text-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 border-t border-[oklch(22%_0.015_160)] pt-5">
            <Button type="submit" loading={saving} variant="primary" size="sm">
              {initial ? "Save Changes" : "Create Product"}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation
// ---------------------------------------------------------------------------

function DeleteConfirm({
  product,
  onCancel,
  onDeleted,
}: {
  product: Product;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        onDeleted();
      } else {
        setError(json.error?.message ?? "Delete failed");
        setDeleting(false);
      }
    } catch {
      setError("Network error");
      setDeleting(false);
    }
  }, [product.id, onDeleted]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete product confirmation"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 border border-[oklch(62%_0.22_25/0.3)] bg-[oklch(5%_0.006_160)] p-8"
      >
        <h2 className="mb-3 text-[0.6rem] uppercase tracking-[0.4em] text-error" style={{ fontFamily: "var(--font-mono)" }}>
          Confirm Delete
        </h2>
        <p className="mb-6 text-sm text-text-mid">
          Delete <span className="text-text-hi">{product.name}</span>? This action cannot be undone.
        </p>
        {error && <p className="mb-4 text-xs text-red-400">{error}</p>}
        <div className="flex gap-3">
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductsAdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products?pageSize=50");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data ?? []);
      } else {
        setError(json.error?.message ?? "Failed to load products");
      }
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSaved = useCallback(() => {
    setEditTarget(null);
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleted = useCallback(() => {
    setDeleteTarget(null);
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      {/* Header bar */}
      <div className="mb-6 flex items-center justify-between">
        <span
          className="text-[0.55rem] uppercase tracking-[0.38em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {products.length} products
        </span>
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => setEditTarget("new")}
        >
          + Add Product
        </Button>
      </div>

      {error && (
        <div className="mb-6 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] overflow-hidden">
        {/* Header */}
        <div className="hidden grid-cols-[2fr_1fr_auto_auto_auto] gap-4 border-b border-[oklch(22%_0.015_160)] bg-[oklch(4%_0.005_160)] px-6 py-3 md:grid">
          {["Name", "Type", "Price", "Status", "Actions"].map((h) => (
            <span
              key={h}
              className="text-[0.48rem] uppercase tracking-[0.38em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 border-b border-[oklch(22%_0.015_160)] px-6 py-4"
              >
                {[60, 30, 20, 16, 40].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 animate-pulse rounded-none bg-surface"
                    style={{ width: `${w}%` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p
              className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              No products yet. Add your first product.
            </p>
          </div>
        ) : (
          <div>
            {products.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-1 gap-2 border-b border-[oklch(22%_0.015_160)] px-6 py-4 last:border-0 transition-colors hover:bg-[oklch(8%_0.008_160)] md:grid-cols-[2fr_1fr_auto_auto_auto] md:items-center md:gap-4"
              >
                {/* Name + slug */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-hi">{product.name}</p>
                  <p
                    className="text-[0.48rem] text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    /{product.slug}
                  </p>
                </div>

                {/* Type */}
                <span
                  className="text-[0.5rem] uppercase tracking-[0.3em] text-text-mid"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {product.type}
                </span>

                {/* Price */}
                <span
                  className="tabular-nums text-sm text-text-hi"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCurrency(product.price, product.currency)}
                </span>

                {/* Status */}
                <span
                  className={`inline-block border px-2 py-0.5 text-[0.46rem] uppercase tracking-[0.26em] ${
                    product.isActive
                      ? "border-emerald/20 bg-emerald/5 text-emerald"
                      : "border-text-lo/20 bg-text-lo/5 text-text-lo"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTarget(product)}
                    className="border border-[oklch(22%_0.015_160)] px-3 py-1 text-[0.48rem] uppercase tracking-[0.28em] text-text-lo transition-colors hover:border-emerald/30 hover:text-emerald"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(product)}
                    className="border border-[oklch(22%_0.015_160)] px-3 py-1 text-[0.48rem] uppercase tracking-[0.28em] text-text-lo transition-colors hover:border-error/30 hover:text-error"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {editTarget !== null && (
        <ProductFormModal
          initial={editTarget === "new" ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaved}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget !== null && (
        <DeleteConfirm
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

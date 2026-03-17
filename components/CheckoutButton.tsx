/**
 * CheckoutButton — "Buy Now" button that initiates Stripe Checkout.
 *
 * Creates a checkout session via POST /api/checkout, then redirects
 * the user to Stripe's hosted checkout page.
 */
"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  /** Product ID(s) and quantities to purchase */
  items: { productId: number; quantity: number }[];
  /** Button label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function CheckoutButton({
  items,
  label = "Buy Now",
  className = "",
  disabled = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message =
          data.error?.message ?? "Failed to start checkout. Please try again.";
        setError(message);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError("No checkout URL returned. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium transition-colors
          ${
            disabled || loading
              ? "cursor-not-allowed bg-gray-400 text-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          }
          ${className}`}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </>
        ) : (
          label
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

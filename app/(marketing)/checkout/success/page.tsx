/**
 * Checkout Success Page
 *
 * Post-purchase page that polls GET /api/checkout/[sessionId]/status
 * every 2 seconds until the order is fulfilled.
 *
 * States:
 * - Loading: "Processing your order..."
 * - Success: order details, license keys, download links
 * - Error: "Something went wrong, contact support"
 */
"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  licenseKey: string | null;
}

interface OrderData {
  id: number;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  items: OrderItem[];
}

type Status = "polling" | "completed" | "failed" | "no-session";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<Status>(
    sessionId ? "polling" : "no-session",
  );
  const [order, setOrder] = useState<OrderData | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const res = await fetch(`/api/checkout/${sessionId}/status`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        // Auth error or server error — stop polling
        setStatus("failed");
        return;
      }

      if (data.data.status === "completed") {
        setStatus("completed");
        setOrder(data.data.order);
      } else if (data.data.status === "failed") {
        setStatus("failed");
      }
      // "pending" — keep polling
    } catch {
      // Network error — keep polling (transient)
      console.warn("[checkout/success] Poll failed, retrying...");
    }

    setPollCount((c) => c + 1);
  }, [sessionId]);

  useEffect(() => {
    if (status !== "polling") return;

    // Poll every 2 seconds, max 30 attempts (60 seconds)
    checkStatus();
    intervalRef.current = setInterval(() => {
      setPollCount((c) => {
        if (c >= 30) {
          setStatus("failed");
          return c;
        }
        checkStatus();
        return c;
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, checkStatus]);

  // Stop polling when we have a final state
  useEffect(() => {
    if (status !== "polling" && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [status]);

  function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  // ---------------------------------------------------------------------------
  // No session ID
  // ---------------------------------------------------------------------------
  if (status === "no-session") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">No Session Found</h1>
        <p className="mb-8 text-gray-600">
          It looks like you arrived here without a checkout session. If you just
          completed a purchase, check your email for confirmation.
        </p>
        <Link
          href="/products"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Polling / Processing
  // ---------------------------------------------------------------------------
  if (status === "polling") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <svg
            className="h-12 w-12 animate-spin text-blue-600"
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
        </div>
        <h1 className="mb-2 text-2xl font-bold">Processing Your Order</h1>
        <p className="text-gray-600">
          Please wait while we set up your purchase. This usually takes just a
          few seconds...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (status === "failed") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-6 text-5xl">!</div>
        <h1 className="mb-4 text-2xl font-bold">Something Went Wrong</h1>
        <p className="mb-8 text-gray-600">
          We received your payment but encountered an issue processing your
          order. Our team has been notified and will resolve this shortly.
        </p>
        <p className="mb-8 text-sm text-gray-500">
          Reference: {sessionId}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard/orders"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            View Orders
          </Link>
          <a
            href="mailto:support@stratosstrat.com"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Success
  // ---------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          &#10003;
        </div>
        <h1 className="mb-2 text-3xl font-bold">Order Confirmed</h1>
        <p className="text-gray-600">
          Thank you for your purchase! Your order has been processed
          successfully.
        </p>
      </div>

      {order && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Order #{order.id}
          </h2>

          <div className="divide-y">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between py-4">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                  {item.licenseKey && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500">
                        License Key
                      </p>
                      <code className="mt-1 inline-block rounded bg-gray-100 px-3 py-1 font-mono text-sm">
                        {item.licenseKey}
                      </code>
                    </div>
                  )}
                </div>
                <p className="font-medium">
                  {formatPrice(item.unitPrice * item.quantity, order.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4">
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(order.taxAmount, order.currency)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount, order.currency)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/dashboard/orders"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          View My Orders
        </Link>
        <Link
          href="/products"
          className="inline-block rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

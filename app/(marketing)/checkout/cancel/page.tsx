/**
 * Checkout Cancelled Page
 *
 * Shown when the user cancels the Stripe Checkout flow.
 * Offers a path back to products or to retry checkout.
 */
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mb-6 text-5xl text-gray-400">&#10005;</div>
      <h1 className="mb-4 text-2xl font-bold">Checkout Cancelled</h1>
      <p className="mb-8 text-gray-600">
        Your checkout was cancelled and you have not been charged. You can return
        to browse products or try again whenever you are ready.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/products"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Browse Products
        </Link>
        <Link
          href="/pricing"
          className="inline-block rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          View Pricing
        </Link>
      </div>
    </div>
  );
}

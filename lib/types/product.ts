/**
 * Stratos Site — Product Display Types
 *
 * Derived from the Drizzle schema but shaped for frontend consumption.
 * These strip internal fields and add computed properties.
 */
import type { Product, Category } from "@/lib/db/types";

/** Product as displayed in listing cards */
export interface ProductCard {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  type: Product["type"];
  /** Formatted price string (e.g., "$29.99") */
  displayPrice: string;
  /** Price in cents */
  price: number;
  currency: string;
  category: {
    name: string;
    slug: string;
  } | null;
  isActive: boolean;
}

/** Full product detail page data */
export interface ProductDetail extends ProductCard {
  description: string | null;
  features: string[];
  screenshots: string[];
  downloadUrl: string | null;
  stripePriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Product with its category for admin views */
export interface ProductWithCategory extends Product {
  category: Category | null;
}

/** Cart item (product + quantity) */
export interface CartItem {
  productId: number;
  productName: string;
  productSlug: string;
  unitPrice: number;
  currency: string;
  quantity: number;
}

/** Checkout line item for Stripe */
export interface CheckoutLineItem {
  price: string; // Stripe Price ID
  quantity: number;
}

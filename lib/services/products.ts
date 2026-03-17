/**
 * Stratos Site -- Product Data Access Layer
 *
 * All product and category queries go through this service.
 * Server components and API routes both consume these functions.
 */
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq, and, ilike, sql, count, asc, desc, type SQL } from "drizzle-orm";
import type { Product, Category, NewProduct } from "@/lib/db/types";
import type { ProductCard, ProductDetail, ProductWithCategory } from "@/lib/types/product";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductFilters {
  category?: string;       // category slug
  type?: Product["type"];
  search?: string;
  isActive?: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(priceInCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceInCents / 100);
}

function toProductCard(
  product: Product,
  category: Category | null,
): ProductCard {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    type: product.type,
    displayPrice: formatPrice(product.price, product.currency),
    price: product.price,
    currency: product.currency,
    category: category
      ? { name: category.name, slug: category.slug }
      : null,
    isActive: product.isActive,
  };
}

function toProductDetail(
  product: Product,
  category: Category | null,
): ProductDetail {
  return {
    ...toProductCard(product, category),
    description: product.description,
    features: product.features,
    screenshots: product.screenshots,
    downloadUrl: product.downloadUrl,
    stripePriceId: product.stripePriceId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Read queries
// ---------------------------------------------------------------------------

export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = {},
): Promise<PaginatedResult<ProductCard>> {
  const page = Math.max(1, pagination.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, pagination.pageSize ?? 12));
  const offset = (page - 1) * pageSize;

  // Build dynamic WHERE conditions
  const conditions: SQL[] = [];

  // Default: only active products for public queries
  if (filters.isActive !== undefined) {
    conditions.push(eq(products.isActive, filters.isActive));
  } else {
    conditions.push(eq(products.isActive, true));
  }

  if (filters.type) {
    conditions.push(eq(products.type, filters.type));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      sql`(${ilike(products.name, term)} OR ${ilike(products.shortDescription, term)})`,
    );
  }

  // Category filter requires a subquery on slug
  if (filters.category) {
    conditions.push(
      sql`${products.categoryId} IN (
        SELECT ${categories.id} FROM ${categories}
        WHERE ${eq(categories.slug, filters.category)}
      )`,
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Count total matching rows
  const [{ total: totalCount }] = await db
    .select({ total: count() })
    .from(products)
    .where(whereClause);

  const total = Number(totalCount);

  // Fetch paginated rows with category join
  const rows = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .orderBy(asc(products.name))
    .limit(pageSize)
    .offset(offset);

  return {
    data: rows.map((r) => toProductCard(r.product, r.category)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const rows = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (rows.length === 0) return null;
  return toProductDetail(rows[0].product, rows[0].category);
}

export async function getProductById(
  id: number,
): Promise<ProductWithCategory | null> {
  const rows = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return { ...rows[0].product, category: rows[0].category };
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.isActive, true));
  return rows.map((r) => r.slug);
}

// ---------------------------------------------------------------------------
// Write queries (admin)
// ---------------------------------------------------------------------------

export async function createProduct(
  data: NewProduct,
): Promise<Product> {
  const [created] = await db.insert(products).values(data).returning();
  return created;
}

export async function updateProduct(
  id: number,
  data: Partial<Omit<NewProduct, "id">>,
): Promise<Product | null> {
  const [updated] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteProduct(id: number): Promise<Product | null> {
  // Soft delete: set isActive = false
  const [deleted] = await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  return deleted ?? null;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

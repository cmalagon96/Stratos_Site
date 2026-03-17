/**
 * Stratos Site -- Product Seed Data
 *
 * Seeds categories and products for Calvin's actual product portfolio.
 * Idempotent: uses ON CONFLICT DO UPDATE (upsert) via slug uniqueness.
 *
 * Run:  npx tsx lib/db/seed-products.ts
 */
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { categories, products } from "./schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql);

// ---------------------------------------------------------------------------
// Category seed data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    name: "Billing & Invoicing",
    slug: "billing",
    description:
      "Financial management, invoicing, and billing automation software.",
    sortOrder: 1,
  },
  {
    name: "Bioinformatics",
    slug: "bioinformatics",
    description:
      "Genomic data processing, pipeline orchestration, and analysis tools.",
    sortOrder: 2,
  },
  {
    name: "Developer Tools",
    slug: "developer-tools",
    description:
      "Code generation, project scaffolding, and developer productivity tools.",
    sortOrder: 3,
  },
  {
    name: "Automation",
    slug: "automation",
    description:
      "Workflow automation templates and operational tooling.",
    sortOrder: 4,
  },
] as const;

// ---------------------------------------------------------------------------
// Product seed data
// ---------------------------------------------------------------------------

const PRODUCTS = [
  {
    name: "BillFlow",
    slug: "billflow",
    description:
      "Multi-tenant SaaS billing and invoicing platform with role-based access, PDF generation, full-text search, and Stripe integration. Built for aviation MRO and small business operations.",
    shortDescription:
      "Multi-tenant billing and invoicing SaaS for small businesses.",
    type: "saas" as const,
    price: 2999, // $29.99/month
    currency: "usd",
    categorySlug: "billing",
    features: [
      "Multi-tenant architecture with tenant isolation",
      "Role-based access control (admin, manager, viewer)",
      "Professional PDF invoice generation",
      "Full-text search across invoices and customers",
      "Stripe payment processing integration",
      "Automated backup and data export",
      "Custom branding per tenant",
      "REST API with comprehensive documentation",
    ],
    screenshots: [],
  },
  {
    name: "RosaBio Pipeline Suite",
    slug: "rosabio",
    description:
      "Bioinformatics pipeline orchestration platform that eliminates manual intervention between ROSA pipeline stages. Includes SPLASH, P2G, and downstream analysis tools with AWS Batch integration for elastic compute.",
    shortDescription:
      "Genomic pipeline orchestration and bioinformatics analysis tools.",
    type: "saas" as const,
    price: 9999, // $99.99/month
    currency: "usd",
    categorySlug: "bioinformatics",
    features: [
      "End-to-end ROSA pipeline orchestration",
      "AWS Batch integration for elastic HPC compute",
      "SPLASH to P2G automated handoff",
      "Real-time pipeline monitoring dashboard",
      "Containerized workflow execution (Docker)",
      "S3-native data management",
      "Configurable parallelism and resource allocation",
      "Audit trail and run history",
    ],
    screenshots: [],
  },
  {
    name: "GenThrust",
    slug: "genthrust",
    description:
      "Developer tools ecosystem for rapid application scaffolding, API generation, and cloud deployment. Unified platform spanning 9 interconnected projects for full-stack development acceleration.",
    shortDescription:
      "Developer tools for rapid API generation and cloud deployment.",
    type: "cli" as const,
    price: 4999, // $49.99/month
    currency: "usd",
    categorySlug: "developer-tools",
    features: [
      "Project scaffolding with best-practice templates",
      "Automatic API route generation from schema",
      "Office 365 and Exchange email integration",
      "Client portal and internal admin separation",
      "Database migration automation",
      "CI/CD pipeline generation",
      "Multi-project ecosystem management",
      "TypeScript-first architecture",
    ],
    screenshots: [],
  },
  {
    name: "Automation Toolkit",
    slug: "automation-toolkit",
    description:
      "Pre-built workflow automation templates for DevOps, data processing, and operational tasks. Includes agent-based orchestration patterns, monitoring hooks, and CI/CD integration.",
    shortDescription:
      "Workflow automation templates for DevOps and operations.",
    type: "template" as const,
    price: 1999, // $19.99 one-time
    currency: "usd",
    categorySlug: "automation",
    features: [
      "Pre-built workflow templates",
      "Agent-based orchestration patterns",
      "CI/CD pipeline integration",
      "Monitoring and alerting hooks",
      "Infrastructure-as-code templates",
      "Task scheduling and cron management",
      "Error handling and retry patterns",
      "Documentation generators",
    ],
    screenshots: [],
  },
] as const;

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seed() {
  console.log("[seed] Seeding categories...");

  // Upsert categories
  for (const cat of CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(categories)
        .set({
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(categories.slug, cat.slug));
      console.log(`  [updated] ${cat.name}`);
    } else {
      await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
      });
      console.log(`  [created] ${cat.name}`);
    }
  }

  console.log("[seed] Seeding products...");

  for (const prod of PRODUCTS) {
    // Look up category ID by slug
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, prod.categorySlug))
      .limit(1);

    const categoryId = cat?.id ?? null;

    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, prod.slug))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(products)
        .set({
          name: prod.name,
          description: prod.description,
          shortDescription: prod.shortDescription,
          type: prod.type,
          price: prod.price,
          currency: prod.currency,
          categoryId,
          features: [...prod.features],
          screenshots: [...prod.screenshots],
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(products.slug, prod.slug));
      console.log(`  [updated] ${prod.name}`);
    } else {
      await db.insert(products).values({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        type: prod.type,
        price: prod.price,
        currency: prod.currency,
        categoryId,
        features: [...prod.features],
        screenshots: [...prod.screenshots],
        isActive: true,
      });
      console.log(`  [created] ${prod.name}`);
    }
  }

  console.log("[seed] Done.");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});

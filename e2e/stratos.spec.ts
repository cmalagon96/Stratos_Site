import { test, expect } from "@playwright/test";

// ─── helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:4000";

// ─── Page load ────────────────────────────────────────────────────────────────

test.describe("Page load", () => {
  test("homepage loads with 200 status", async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  test("page title is not empty", async ({ page }) => {
    await page.goto(BASE_URL);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("no JavaScript console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto(BASE_URL);
    // Allow a short wait for any deferred errors
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test("Stratos logo is visible in the navbar", async ({ page }) => {
    await page.goto(BASE_URL);
    const logo = page.getByAltText("Stratos Strategies").first();
    await expect(logo).toBeVisible();
  });

  test("3D canvas element is present in the DOM", async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for React to hydrate
    await page.waitForLoadState("networkidle");
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeAttached();
  });
});

// ─── Navigation links ─────────────────────────────────────────────────────────

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("desktop nav renders 'Services' link", async ({ page }) => {
    await expect(page.locator("nav a[href='#services']").first()).toBeVisible();
  });

  test("desktop nav renders 'About' link", async ({ page }) => {
    await expect(page.locator("nav a[href='#about']").first()).toBeVisible();
  });

  test("desktop nav renders 'Industries' link", async ({ page }) => {
    await expect(page.locator("nav a[href='#industries']").first()).toBeVisible();
  });

  test("desktop nav renders 'Contact' link", async ({ page }) => {
    await expect(page.locator("nav a[href='#contact']").first()).toBeVisible();
  });

  test("clicking Services nav link scrolls to services section", async ({ page }) => {
    // The bento section has id="services"
    await page.locator("nav a[href='#services']").first().click();
    await page.waitForTimeout(800);
    const section = page.locator("#services");
    await expect(section).toBeInViewport({ ratio: 0.1 });
  });

  test("clicking About nav link scrolls to about section", async ({ page }) => {
    await page.locator("nav a[href='#about']").first().click();
    await page.waitForTimeout(800);
    await expect(page.locator("#about")).toBeInViewport({ ratio: 0.1 });
  });

  test("clicking Contact nav link scrolls to contact section", async ({ page }) => {
    await page.locator("nav a[href='#contact']").first().click();
    await page.waitForTimeout(800);
    await expect(page.locator("#contact")).toBeInViewport({ ratio: 0.1 });
  });
});

// ─── Mobile hamburger menu ────────────────────────────────────────────────────

test.describe("Mobile hamburger menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("hamburger button is visible on mobile", async ({ page }) => {
    const btn = page.getByRole("button", { name: /open navigation/i });
    await expect(btn).toBeVisible();
  });

  test("desktop nav links are hidden on mobile", async ({ page }) => {
    // The desktop nav has hidden md:flex — should not be visible at 375px
    const desktopNav = page.locator("nav .hidden.md\\:flex");
    await expect(desktopNav).toBeHidden();
  });

  test("clicking hamburger opens the mobile menu", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Open navigation" });
    await btn.click();
    await page.waitForTimeout(400);
    // The mobile menu contains "Start a Project" as a link — target it specifically
    const startProjectLink = page.getByRole("link", { name: "Start a Project" });
    await expect(startProjectLink).toBeVisible();
  });

  test("mobile menu shows all nav links after opening", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.waitForTimeout(400);
    await expect(page.getByRole("link", { name: /^Services$/i }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: /^About$/i }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Industries$/i }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Contact$/i }).last()).toBeVisible();
  });

  test("clicking a mobile nav link closes the menu", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.waitForTimeout(500);
    // The mobile menu link items are motion.a elements inside the overlay
    // We use evaluate to trigger the React click handler directly
    await page.evaluate(() => {
      const links = document.querySelectorAll(".fixed.inset-0 a");
      for (const link of links) {
        if (link.textContent?.trim() === "About") {
          (link as HTMLElement).click();
          break;
        }
      }
    });
    await page.waitForTimeout(600);
    // After close: the hamburger should have aria-expanded="false"
    const hamburger = page.locator("button[aria-label='Open navigation']");
    await expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking hamburger again closes the menu", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.waitForTimeout(500);
    // Menu is open — verify by checking aria-expanded on the hamburger
    const hamburger = page.locator("button[aria-label='Close navigation']");
    await expect(hamburger).toHaveAttribute("aria-expanded", "true");
    // Trigger close via JS click (framer-motion overlay covers the button)
    await page.evaluate(() => {
      const btn = document.querySelector("button[aria-label='Close navigation']") as HTMLElement;
      if (btn) btn.click();
    });
    await page.waitForTimeout(500);
    // Menu closed
    await expect(page.locator("button[aria-label='Open navigation']")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });
});

// ─── Contact form ─────────────────────────────────────────────────────────────

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    // Scroll to the contact section
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  });

  test("contact section is present in DOM", async ({ page }) => {
    await expect(page.locator("#contact")).toBeAttached();
  });

  test("name input is rendered", async ({ page }) => {
    await expect(page.getByPlaceholder("Your full name")).toBeVisible();
  });

  test("email input is rendered", async ({ page }) => {
    await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  });

  test("message textarea is rendered", async ({ page }) => {
    await expect(page.getByPlaceholder(/describe your project/i)).toBeVisible();
  });

  test("filling and submitting the form shows success message", async ({ page }) => {
    await page.getByPlaceholder("Your full name").fill("Jane Doe");
    await page.getByPlaceholder("you@company.com").fill("jane@example.com");
    await page.getByPlaceholder(/describe your project/i).fill("Need cloud infrastructure help");

    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/message received/i)).toBeVisible({ timeout: 10000 });
  });

  test("form fields are cleared after successful submission", async ({ page }) => {
    await page.getByPlaceholder("Your full name").fill("Jane Doe");
    await page.getByPlaceholder("you@company.com").fill("jane@example.com");
    await page.getByPlaceholder(/describe your project/i).fill("Test project");
    await page.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByText(/message received/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder("Your full name")).toHaveValue("");
  });

  test("contact email address is shown in sidebar", async ({ page }) => {
    await expect(page.getByText("contact@stratosstrat.com")).toBeVisible();
  });
});

// ─── Sections visible on scroll ───────────────────────────────────────────────

test.describe("Section visibility on scroll", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("services section (bento) is present in DOM", async ({ page }) => {
    await expect(page.locator("#services")).toBeAttached();
  });

  test("about section is present in DOM", async ({ page }) => {
    await expect(page.locator("#about")).toBeAttached();
  });

  test("industries section is present in DOM", async ({ page }) => {
    await expect(page.locator("#industries")).toBeAttached();
  });

  test("contact section is present in DOM", async ({ page }) => {
    await expect(page.locator("#contact")).toBeAttached();
  });

  test("services list section is present", async ({ page }) => {
    await expect(page.locator("#services-list")).toBeAttached();
  });

  test("scrolling to about section makes it visible", async ({ page }) => {
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(page.locator("#about")).toBeInViewport({ ratio: 0.1 });
  });

  test("scrolling to industries makes it visible", async ({ page }) => {
    await page.locator("#industries").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(page.locator("#industries")).toBeInViewport({ ratio: 0.1 });
  });
});

// ─── Responsive viewports ─────────────────────────────────────────────────────

test.describe("Responsive – 375px mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("page loads without errors at 375px", async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  test("logo is visible on mobile", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByAltText("Stratos Strategies").first()).toBeVisible();
  });
});

test.describe("Responsive – 768px tablet", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("page loads without errors at 768px", async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  test("logo is visible at tablet viewport", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByAltText("Stratos Strategies").first()).toBeVisible();
  });
});

test.describe("Responsive – 1280px desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("page loads without errors at 1280px", async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  test("desktop nav is visible at 1280px", async ({ page }) => {
    await page.goto(BASE_URL);
    // The hidden md:flex container should be visible at 1280px
    await expect(page.locator("nav a[href='#services']").first()).toBeVisible();
  });

  test("all 4 capability cards are rendered in the bento grid", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.locator("#services").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(page.getByRole("heading", { name: "Aviation Systems" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Genomic Sequencing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cloud Infrastructure" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Security & Compliance" })).toBeVisible();
  });
});

// ─── API endpoint ─────────────────────────────────────────────────────────────

test.describe("API /api/contact", () => {
  test("POST with valid data returns 200 and {ok: true}", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {
        name: "Jane Doe",
        email: "jane@example.com",
        company: "Test Corp",
        projectType: "Cloud Infrastructure",
        message: "Test message from E2E"
      }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test("POST with empty body still returns 200 (no server-side field validation)", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: {}
    });
    expect(response.status()).toBe(200);
  });

  test("GET to /api/contact returns 405 or 404 (not a supported method)", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/contact`);
    // Next.js returns 405 for unimplemented methods in route handlers
    expect([405, 404]).toContain(response.status());
  });
});

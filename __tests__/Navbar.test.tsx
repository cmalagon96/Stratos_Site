import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { navLinks } from "@/lib/constants";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      // Render as plain elements so we can test content
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
      a: ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => <a {...rest}>{children}</a>,
      span: ({ children, ...rest }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => <span {...rest}>{children}</span>
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

describe("Navbar", () => {
  it("renders the logo image", () => {
    render(<Navbar />);
    const logo = screen.getByAltText("Stratos Strategies");
    expect(logo).toBeInTheDocument();
  });

  it("renders all nav links from constants", () => {
    render(<Navbar />);
    navLinks.forEach((link) => {
      // Each label appears at least once (desktop + mobile menu both render same labels)
      const els = screen.getAllByText(link.label);
      expect(els.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders nav links as anchor elements with correct hrefs", () => {
    render(<Navbar />);
    const anchors = screen.getAllByRole("link");
    const hrefs = anchors.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("#services");
    expect(hrefs).toContain("#about");
    expect(hrefs).toContain("#industries");
    expect(hrefs).toContain("#contact");
  });

  it("has an accessible hamburger button", () => {
    render(<Navbar />);
    const hamburger = screen.getByRole("button", { name: /open navigation/i });
    expect(hamburger).toBeInTheDocument();
  });

  it("hamburger button toggles aria-expanded attribute", () => {
    render(<Navbar />);
    const btn = screen.getByRole("button", { name: /open navigation/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    // After opening, aria-label changes and aria-expanded becomes true
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("opens mobile menu when hamburger is clicked", () => {
    render(<Navbar />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    // The mobile menu text "Start a Project" should appear
    expect(screen.getByText("Start a Project")).toBeInTheDocument();
  });

  it("closes mobile menu when a nav link is clicked", () => {
    render(<Navbar />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    // Click the first mobile nav link
    const mobileLinks = screen.getAllByText(navLinks[0].label);
    // The mobile-menu link is usually the last one added
    fireEvent.click(mobileLinks[mobileLinks.length - 1]);
    // After closing, aria-expanded goes back to false
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("has role='navigation' on the nav element", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("logo link points to #top", () => {
    render(<Navbar />);
    const logoLink = screen.getByRole("link", { name: /stratos strategies home/i });
    expect(logoLink).toHaveAttribute("href", "#top");
  });
});

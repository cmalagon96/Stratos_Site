import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";
import { navLinks } from "@/lib/constants";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  )
}));

describe("Footer", () => {
  it("renders a footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the copyright notice with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument();
  });

  it("renders 'Stratos Strategies LLC' in copyright", () => {
    render(<Footer />);
    expect(screen.getByText(/stratos strategies llc/i)).toBeInTheDocument();
  });

  it("renders the location 'Doral, FL'", () => {
    render(<Footer />);
    // Multiple elements may have Doral FL text
    const els = screen.getAllByText(/doral, fl/i);
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Stratos logo image", () => {
    render(<Footer />);
    const logos = screen.getAllByAltText("Stratos Strategies");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all nav links in the footer navigation list", () => {
    render(<Footer />);
    navLinks.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it("footer nav links have correct href attributes", () => {
    render(<Footer />);
    navLinks.forEach((link) => {
      const anchor = screen.getByRole("link", { name: link.label });
      expect(anchor).toHaveAttribute("href", `#${link.id}`);
    });
  });

  it("renders the LinkedIn social link", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /linkedin/i })).toBeInTheDocument();
  });

  it("LinkedIn link opens in a new tab", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /linkedin/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders all 8 tech badge labels", () => {
    render(<Footer />);
    const BADGES = ["AWS", "NIST 800-171", "HIPAA", "NIH dbGaP", "Next.js", "Python", "React", "PostgreSQL"];
    BADGES.forEach((badge) => {
      expect(screen.getByText(badge)).toBeInTheDocument();
    });
  });

  it("renders 'Platforms & Standards' section heading", () => {
    render(<Footer />);
    expect(screen.getByText(/platforms & standards/i)).toBeInTheDocument();
  });

  it("renders 'Navigation' section heading", () => {
    render(<Footer />);
    expect(screen.getByText(/^navigation$/i)).toBeInTheDocument();
  });

  it("home logo link points to #top", () => {
    render(<Footer />);
    const homeLink = screen.getByRole("link", { name: /stratos strategies home/i });
    expect(homeLink).toHaveAttribute("href", "#top");
  });
});

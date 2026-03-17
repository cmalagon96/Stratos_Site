import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

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
    const els = screen.getAllByText(/doral, fl/i);
    expect(els.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Stratos logo image", () => {
    render(<Footer />);
    const logos = screen.getAllByAltText("Stratos Strategies");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Products section with product links", () => {
    render(<Footer />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("BillFlow")).toBeInTheDocument();
    expect(screen.getByText("RosaBio")).toBeInTheDocument();
    expect(screen.getByText("GenThrust")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("renders Company section with company links", () => {
    render(<Footer />);
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
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

  it("home logo link points to #top", () => {
    render(<Footer />);
    const homeLink = screen.getByRole("link", { name: /stratos strategies home/i });
    expect(homeLink).toHaveAttribute("href", "#top");
  });
});

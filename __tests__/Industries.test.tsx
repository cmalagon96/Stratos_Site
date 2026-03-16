import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Industries from "@/components/Industries";
import { industries } from "@/lib/constants";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
      li: ({ children, ...rest }: React.LiHTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }) => <li {...rest}>{children}</li>
    }
  };
});

describe("Industries", () => {
  it("renders the section with id='industries'", () => {
    render(<Industries />);
    expect(document.getElementById("industries")).toBeInTheDocument();
  });

  it("renders the 'Verticals' section label", () => {
    render(<Industries />);
    expect(screen.getByText("Verticals")).toBeInTheDocument();
  });

  it("renders both industry titles from constants", () => {
    render(<Industries />);
    industries.forEach((ind) => {
      expect(screen.getByText(ind.title)).toBeInTheDocument();
    });
  });

  it("renders both industry descriptions", () => {
    render(<Industries />);
    industries.forEach((ind) => {
      expect(screen.getByText(ind.description)).toBeInTheDocument();
    });
  });

  it("renders Biotechnology & Research Computing card", () => {
    render(<Industries />);
    expect(screen.getByText("Biotechnology & Research Computing")).toBeInTheDocument();
  });

  it("renders Aviation & Aerospace card", () => {
    render(<Industries />);
    expect(screen.getByText("Aviation & Aerospace")).toBeInTheDocument();
  });

  it("renders biotech bullet points", () => {
    render(<Industries />);
    expect(screen.getByText("NIH dbGaP security frameworks")).toBeInTheDocument();
    expect(screen.getByText("NIST 800-171 compliance engineering")).toBeInTheDocument();
  });

  it("renders aviation bullet points", () => {
    render(<Industries />);
    expect(screen.getByText("MRO coordination platforms")).toBeInTheDocument();
    expect(screen.getByText("Repair order management systems")).toBeInTheDocument();
  });

  it("renders stat values for both industries", () => {
    render(<Industries />);
    expect(screen.getByText("TB+")).toBeInTheDocument();
    expect(screen.getByText("17+")).toBeInTheDocument();
  });

  it("renders 'Discuss Your Project' CTA links", () => {
    render(<Industries />);
    const ctaLinks = screen.getAllByText("Discuss Your Project");
    expect(ctaLinks).toHaveLength(2);
  });

  it("CTA links point to #contact", () => {
    render(<Industries />);
    const ctaLinks = screen.getAllByRole("link", { name: /discuss your project/i });
    ctaLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "#contact");
    });
  });

  it("renders vertical index labels 01 and 02", () => {
    render(<Industries />);
    expect(screen.getByText("Vertical / 01")).toBeInTheDocument();
    expect(screen.getByText("Vertical / 02")).toBeInTheDocument();
  });
});

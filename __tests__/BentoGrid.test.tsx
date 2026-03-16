import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BentoGrid from "@/components/BentoGrid";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>
    }
  };
});

describe("BentoGrid", () => {
  it("renders the section with id='services'", () => {
    render(<BentoGrid />);
    expect(document.getElementById("services")).toBeInTheDocument();
  });

  it("renders 'Capabilities' section label", () => {
    render(<BentoGrid />);
    expect(screen.getByText("Capabilities")).toBeInTheDocument();
  });

  it("renders all 4 capability card titles", () => {
    render(<BentoGrid />);
    expect(screen.getByText("Aviation Systems")).toBeInTheDocument();
    expect(screen.getByText("Genomic Sequencing")).toBeInTheDocument();
    expect(screen.getByText("Cloud Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Security & Compliance")).toBeInTheDocument();
  });

  it("renders all 4 capability card taglines", () => {
    render(<BentoGrid />);
    expect(screen.getByText("MRO & Operations")).toBeInTheDocument();
    expect(screen.getByText("Research Computing")).toBeInTheDocument();
    expect(screen.getByText("AWS Multi-Region")).toBeInTheDocument();
    expect(screen.getByText("NIST / HIPAA / dbGaP")).toBeInTheDocument();
  });

  it("renders index labels 01 through 04", () => {
    render(<BentoGrid />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });

  it("each card has an aria-label matching the capability title", () => {
    render(<BentoGrid />);
    expect(screen.getByLabelText("Aviation Systems")).toBeInTheDocument();
    expect(screen.getByLabelText("Genomic Sequencing")).toBeInTheDocument();
    expect(screen.getByLabelText("Cloud Infrastructure")).toBeInTheDocument();
    expect(screen.getByLabelText("Security & Compliance")).toBeInTheDocument();
  });

  it("renders the section heading containing 'Engineering the'", () => {
    render(<BentoGrid />);
    expect(screen.getByText(/engineering the/i)).toBeInTheDocument();
  });

  it("renders card descriptions", () => {
    render(<BentoGrid />);
    expect(screen.getByText(/MRO coordination platforms/i)).toBeInTheDocument();
    expect(screen.getByText(/NIH dbGaP compliant/i)).toBeInTheDocument();
  });
});

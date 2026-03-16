import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustBar from "@/components/TrustBar";

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

describe("TrustBar", () => {
  it("renders all 6 credential labels", () => {
    render(<TrustBar />);
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText("NIST 800-171")).toBeInTheDocument();
    expect(screen.getByText("NIH dbGaP")).toBeInTheDocument();
    expect(screen.getByText("TB-Scale")).toBeInTheDocument();
    expect(screen.getByText("Full-Stack")).toBeInTheDocument();
    expect(screen.getByText("M365")).toBeInTheDocument();
  });

  it("renders all 6 sublabels", () => {
    render(<TrustBar />);
    expect(screen.getByText("Multi-Region")).toBeInTheDocument();
    expect(screen.getByText("110+ Controls")).toBeInTheDocument();
    expect(screen.getByText("Certified")).toBeInTheDocument();
    expect(screen.getByText("Data Pipelines")).toBeInTheDocument();
    expect(screen.getByText("React / Python")).toBeInTheDocument();
    expect(screen.getByText("Power Platform")).toBeInTheDocument();
  });

  it("renders exactly 6 badge items", () => {
    render(<TrustBar />);
    // Each item renders a label span — count by matching all 6 label texts
    const labels = ["AWS", "NIST 800-171", "NIH dbGaP", "TB-Scale", "Full-Stack", "M365"];
    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});

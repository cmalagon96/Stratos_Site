import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "@/components/About";
import { stats } from "@/lib/constants";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: () => true,
    motion: {
      ...actual.motion,
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>
    }
  };
});

// AnimatedCounter uses framer-motion useInView — already mocked above
vi.mock("@/components/AnimatedCounter", () => ({
  default: ({
    value,
    prefix = "",
    suffix = "",
    hideNumber
  }: {
    value: number;
    prefix?: string;
    suffix?: string;
    hideNumber?: boolean;
  }) => {
    const display = hideNumber ? `${prefix}${suffix}` : `${prefix}${value}${suffix}`;
    return <div data-testid="animated-counter">{display}</div>;
  }
}));

describe("About", () => {
  it("renders the section with id='about'", () => {
    render(<About />);
    expect(document.getElementById("about")).toBeInTheDocument();
  });

  it("renders the 'Our Approach' section label", () => {
    render(<About />);
    expect(screen.getByText("Our Approach")).toBeInTheDocument();
  });

  it("renders the primary heading", () => {
    render(<About />);
    expect(screen.getByText(/we do not advise/i)).toBeInTheDocument();
  });

  it("renders 3 approach points (A, B, C)", () => {
    render(<About />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("renders approach point headings", () => {
    render(<About />);
    expect(screen.getByText("We embed, not advise")).toBeInTheDocument();
    expect(screen.getByText("From design to operation")).toBeInTheDocument();
    expect(screen.getByText("Precision domains")).toBeInTheDocument();
  });

  it("renders the 'By the Numbers' divider label", () => {
    render(<About />);
    expect(screen.getByText("By the Numbers")).toBeInTheDocument();
  });

  it("renders one AnimatedCounter per stat", () => {
    render(<About />);
    const counters = screen.getAllByTestId("animated-counter");
    expect(counters).toHaveLength(stats.length);
  });

  it("renders each stat label", () => {
    render(<About />);
    stats.forEach((s) => {
      expect(screen.getByText(s.label)).toBeInTheDocument();
    });
  });

  it("renders the TB-Scale counter with hideNumber output", () => {
    render(<About />);
    // The pipelines stat has hideNumber=true, prefix="TB-", suffix="Scale"
    expect(screen.getByText("TB-Scale")).toBeInTheDocument();
  });

  it("renders the '17+' counter for regions", () => {
    render(<About />);
    expect(screen.getByText("17+")).toBeInTheDocument();
  });

  it("renders the '110' counter for NIST controls", () => {
    render(<About />);
    expect(screen.getByText("110")).toBeInTheDocument();
  });
});

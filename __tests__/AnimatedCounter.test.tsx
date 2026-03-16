import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import AnimatedCounter from "@/components/AnimatedCounter";

// framer-motion's useInView — stub it to return true so the counter animates
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: () => true
  };
});

describe("AnimatedCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders a div container", () => {
    const { container } = render(<AnimatedCounter value={42} />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders prefix and suffix when hideNumber is true", () => {
    render(<AnimatedCounter value={1} prefix="TB-" suffix="Scale" hideNumber />);
    expect(screen.getByText("TB-Scale")).toBeInTheDocument();
  });

  it("does not show the numeric value when hideNumber is true", () => {
    render(<AnimatedCounter value={100} prefix="TB-" suffix="Scale" hideNumber />);
    // Should NOT render "1" or "100" as a visible number
    expect(screen.queryByText(/100/)).not.toBeInTheDocument();
  });

  it("starts at 0 before the animation progresses", () => {
    const { container } = render(<AnimatedCounter value={100} suffix="+" />);
    // Immediately after mount the display value is 0
    expect(container.firstChild?.textContent).toMatch(/^0\+$/);
  });

  it("renders with a className prop applied to the wrapper div", () => {
    const { container } = render(
      <AnimatedCounter value={17} className="stat-wrapper" />
    );
    expect(container.firstChild).toHaveClass("stat-wrapper");
  });

  it("accepts and applies an inline style", () => {
    const { container } = render(
      <AnimatedCounter value={17} style={{ color: "red" }} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.color).toBe("red");
  });

  it("shows prefix without number when hideNumber=true and only prefix is set", () => {
    render(<AnimatedCounter value={1} prefix="PRE-" hideNumber />);
    expect(screen.getByText("PRE-")).toBeInTheDocument();
  });

  it("reaches the target value after the full animation duration", async () => {
    const { container } = render(
      <AnimatedCounter value={17} suffix="+" duration={100} />
    );
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(container.firstChild?.textContent).toBe("17+");
  });

  it("renders with no prefix or suffix by default", () => {
    const { container } = render(<AnimatedCounter value={0} duration={0} />);
    // At t=0 or hideNumber=false and value=0, output is "0"
    expect(container.firstChild?.textContent).toBe("0");
  });
});

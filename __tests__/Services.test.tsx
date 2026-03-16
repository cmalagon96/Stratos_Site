import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Services from "@/components/Services";
import { services } from "@/lib/constants";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

describe("Services", () => {
  it("renders the section with id='services-list'", () => {
    render(<Services />);
    expect(document.getElementById("services-list")).toBeInTheDocument();
  });

  it("renders all 5 service titles", () => {
    render(<Services />);
    services.forEach((s) => {
      expect(screen.getByText(s.title)).toBeInTheDocument();
    });
  });

  it("renders numbered indexes 01 through 05", () => {
    render(<Services />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i).padStart(2, "0"))).toBeInTheDocument();
    }
  });

  it("each service row has an aria-expanded button defaulting to false", () => {
    render(<Services />);
    const buttons = screen.getAllByRole("button");
    // Filter buttons that have aria-expanded (the accordion toggles)
    const toggles = buttons.filter((b) => b.hasAttribute("aria-expanded"));
    expect(toggles).toHaveLength(5);
    toggles.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("clicking a service row expands it and shows the description", () => {
    render(<Services />);
    const buttons = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    // The description for the first service should now be visible
    expect(screen.getByText(services[0].description)).toBeInTheDocument();
  });

  it("clicking an expanded service row collapses it", () => {
    render(<Services />);
    const buttons = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("opening one service closes the previously open one", () => {
    render(<Services />);
    const buttons = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("descriptions are NOT shown when accordion is collapsed", () => {
    render(<Services />);
    // By default no description should be in the DOM
    services.forEach((s) => {
      expect(screen.queryByText(s.description)).not.toBeInTheDocument();
    });
  });

  it("renders 'What We Do' section label", () => {
    render(<Services />);
    expect(screen.getByText("What We Do")).toBeInTheDocument();
  });

  it("expanded service shows 'Enquire about this service' link", () => {
    render(<Services />);
    const buttons = screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
    fireEvent.click(buttons[0]);
    expect(screen.getByText(/enquire about this service/i)).toBeInTheDocument();
  });
});

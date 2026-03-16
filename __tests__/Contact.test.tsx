import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "@/components/Contact";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
      form: ({ children, ...rest }: React.FormHTMLAttributes<HTMLFormElement> & { children?: React.ReactNode }) => <form {...rest}>{children}</form>
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

describe("Contact", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the contact section with id='contact'", () => {
    render(<Contact />);
    const section = document.getElementById("contact");
    expect(section).toBeInTheDocument();
  });

  it("renders the Name input field", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText("Your full name")).toBeInTheDocument();
  });

  it("renders the Email input field", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
  });

  it("renders the Company optional input", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText("Your company")).toBeInTheDocument();
  });

  it("renders the Project Type select", () => {
    render(<Contact />);
    const select = screen.getByDisplayValue("Cloud Infrastructure");
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders the Message textarea", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText(/describe your project/i)).toBeInTheDocument();
  });

  it("renders the Send Message submit button", () => {
    render(<Contact />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("name input is required", () => {
    render(<Contact />);
    const input = screen.getByPlaceholderText("Your full name");
    expect(input).toHaveAttribute("required");
  });

  it("email input is required and has type email", () => {
    render(<Contact />);
    const input = screen.getByPlaceholderText("you@company.com");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("type", "email");
  });

  it("message textarea is required", () => {
    render(<Contact />);
    const textarea = screen.getByPlaceholderText(/describe your project/i);
    expect(textarea).toHaveAttribute("required");
  });

  it("company input is NOT required", () => {
    render(<Contact />);
    const input = screen.getByPlaceholderText("Your company");
    expect(input).not.toHaveAttribute("required");
  });

  it("updates name input value when user types", async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const input = screen.getByPlaceholderText("Your full name");
    await user.type(input, "Jane Doe");
    expect(input).toHaveValue("Jane Doe");
  });

  it("updates email input value when user types", async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const input = screen.getByPlaceholderText("you@company.com");
    await user.type(input, "jane@example.com");
    expect(input).toHaveValue("jane@example.com");
  });

  it("changes project type via select", async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const select = screen.getByDisplayValue("Cloud Infrastructure");
    await user.selectOptions(select, "Aviation Technology");
    expect(select).toHaveValue("Aviation Technology");
  });

  it("shows 'Transmitting...' while form is submitting", async () => {
    // Mock fetch to never resolve during test
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test");
    await user.type(screen.getByPlaceholderText("you@company.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText(/describe your project/i), "Test message");

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/transmitting/i)).toBeInTheDocument();
    });
  });

  it("shows success message after successful submission", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ ok: true }) })
    ) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test");
    await user.type(screen.getByPlaceholderText("you@company.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText(/describe your project/i), "Test message");

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/message received/i)).toBeInTheDocument();
    });
  });

  it("shows error message after failed submission", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false })
    ) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test");
    await user.type(screen.getByPlaceholderText("you@company.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText(/describe your project/i), "Test message");

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/transmission failed/i)).toBeInTheDocument();
    });
  });

  it("resets form fields after successful submission", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ ok: true }) })
    ) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<Contact />);

    const nameInput = screen.getByPlaceholderText("Your full name");
    await user.type(nameInput, "Jane Doe");
    await user.type(screen.getByPlaceholderText("you@company.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText(/describe your project/i), "Need help with cloud setup");

    fireEvent.submit(screen.getByRole("button", { name: /send message/i }).closest("form")!);

    await waitFor(() => {
      expect(nameInput).toHaveValue("");
    });
  });

  it("disables the submit button while submitting", async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByPlaceholderText("Your full name"), "Test");
    await user.type(screen.getByPlaceholderText("you@company.com"), "test@test.com");
    await user.type(screen.getByPlaceholderText(/describe your project/i), "Test message");

    const form = screen.getByRole("button", { name: /send message/i }).closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
    });
  });

  it("renders contact details sidebar with email address", () => {
    render(<Contact />);
    expect(screen.getByText("contact@stratosstrat.com")).toBeInTheDocument();
  });

  it("renders location 'Doral, FL' in sidebar", () => {
    render(<Contact />);
    expect(screen.getByText("Doral, FL")).toBeInTheDocument();
  });

  it("renders all 6 project type options in the select", () => {
    render(<Contact />);
    const select = screen.getByDisplayValue("Cloud Infrastructure") as HTMLSelectElement;
    expect(select.options).toHaveLength(6);
  });
});

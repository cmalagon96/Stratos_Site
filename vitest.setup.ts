import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/image globally
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return Object.assign(
      document.createElement("img"),
      { src, alt, ...props }
    );
  }
}));

// Stub window.requestAnimationFrame / cancelAnimationFrame
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(() => cb(performance.now()), 16) as unknown as number;
};
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Stub IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver
});

// Stub ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver
});

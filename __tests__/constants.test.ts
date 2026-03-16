import { describe, it, expect } from "vitest";
import { services, industries, stats, navLinks } from "@/lib/constants";

// ─── services ─────────────────────────────────────────────────────────────────

describe("constants – services", () => {
  it("exports exactly 5 services", () => {
    expect(services).toHaveLength(5);
  });

  it("every service has a non-empty id", () => {
    services.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(typeof s.id).toBe("string");
    });
  });

  it("every service has a non-empty title", () => {
    services.forEach((s) => {
      expect(s.title).toBeTruthy();
    });
  });

  it("every service has a non-empty description", () => {
    services.forEach((s) => {
      expect(s.description).toBeTruthy();
      expect(s.description.length).toBeGreaterThan(20);
    });
  });

  it("service ids are unique", () => {
    const ids = services.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains expected service ids", () => {
    const ids = services.map((s) => s.id);
    expect(ids).toContain("cloud");
    expect(ids).toContain("compliance");
    expect(ids).toContain("fullstack");
    expect(ids).toContain("automation");
    expect(ids).toContain("aviation");
  });
});

// ─── industries ───────────────────────────────────────────────────────────────

describe("constants – industries", () => {
  it("exports exactly 2 industries", () => {
    expect(industries).toHaveLength(2);
  });

  it("every industry has required fields", () => {
    industries.forEach((ind) => {
      expect(ind.id).toBeTruthy();
      expect(ind.title).toBeTruthy();
      expect(ind.description).toBeTruthy();
    });
  });

  it("industry ids are unique", () => {
    const ids = industries.map((ind) => ind.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains biotech and aviation industries", () => {
    const ids = industries.map((ind) => ind.id);
    expect(ids).toContain("biotech");
    expect(ids).toContain("aviation");
  });
});

// ─── stats ────────────────────────────────────────────────────────────────────

describe("constants – stats", () => {
  it("exports exactly 3 stats", () => {
    expect(stats).toHaveLength(3);
  });

  it("every stat has an id, value, and label", () => {
    stats.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(typeof s.value).toBe("number");
      expect(s.label).toBeTruthy();
    });
  });

  it("stat ids are unique", () => {
    const ids = stats.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("pipelines stat has hideNumber set to true", () => {
    const pipelines = stats.find((s) => s.id === "pipelines");
    expect(pipelines).toBeDefined();
    expect(pipelines?.hideNumber).toBe(true);
  });

  it("regions stat has suffix '+'", () => {
    const regions = stats.find((s) => s.id === "regions");
    expect(regions?.suffix).toBe("+");
  });

  it("controls stat has value 110", () => {
    const controls = stats.find((s) => s.id === "controls");
    expect(controls?.value).toBe(110);
  });

  it("pipelines stat has prefix 'TB-' and suffix 'Scale'", () => {
    const pipelines = stats.find((s) => s.id === "pipelines");
    expect(pipelines?.prefix).toBe("TB-");
    expect(pipelines?.suffix).toBe("Scale");
  });
});

// ─── navLinks ─────────────────────────────────────────────────────────────────

describe("constants – navLinks", () => {
  it("exports exactly 4 nav links", () => {
    expect(navLinks).toHaveLength(4);
  });

  it("every nav link has an id and label", () => {
    navLinks.forEach((link) => {
      expect(link.id).toBeTruthy();
      expect(link.label).toBeTruthy();
    });
  });

  it("contains expected nav link ids", () => {
    const ids = navLinks.map((l) => l.id);
    expect(ids).toContain("services");
    expect(ids).toContain("about");
    expect(ids).toContain("industries");
    expect(ids).toContain("contact");
  });

  it("nav link ids are unique", () => {
    const ids = navLinks.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/contact/route";
import * as rateLimitModule from "@/lib/rate-limit";

// Mock the rate limiter so it never blocks between tests
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({ allowed: true, remaining: 4 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

// Mock NextResponse since we're running outside Next.js context
vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      return {
        _data: data,
        status: init?.status ?? 200,
        json: async () => data
      };
    }
  }
}));

function makeRequest(body: unknown): Request {
  return {
    json: async () => body,
    headers: new Headers()
  } as unknown as Request;
}

function makeBrokenRequest(): Request {
  return {
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
    headers: new Headers()
  } as unknown as Request;
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default allowed behaviour after each test
    vi.mocked(rateLimitModule.rateLimit).mockReturnValue({ allowed: true, remaining: 4 });
    vi.mocked(rateLimitModule.getClientIp).mockReturnValue("127.0.0.1");
  });

  it("returns 200 with {ok: true} for a valid payload", async () => {
    const req = makeRequest({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "ACME Corp",
      projectType: "Cloud Infrastructure",
      message: "Need help with AWS setup"
    });
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(200);
    expect(res._data.ok).toBe(true);
  });

  it("returns 200 even when optional company field is absent", async () => {
    const req = makeRequest({
      name: "Jane",
      email: "jane@example.com",
      projectType: "Other",
      message: "Hello world!"
    });
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(200);
    expect(res._data.ok).toBe(true);
  });

  it("returns 400 with {ok: false} for an empty payload (Zod rejects missing required fields)", async () => {
    const req = makeRequest({});
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(400);
    expect(res._data.ok).toBe(false);
  });

  it("returns 500 with {ok: false} when request body is malformed JSON", async () => {
    const req = makeBrokenRequest();
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(500);
    expect(res._data.ok).toBe(false);
  });

  it("response includes 'ok' key in payload", async () => {
    const req = makeRequest({
      name: "Test",
      email: "t@t.com",
      projectType: "Other",
      message: "This is a test message"
    });
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(Object.prototype.hasOwnProperty.call(res._data, "ok")).toBe(true);
  });

  it("handles special characters in message field without throwing", async () => {
    const req = makeRequest({
      name: "O'Neil & Sons",
      email: "test@test.com",
      projectType: "Other",
      message: "<script>alert('xss')</script> & \"quotes\" — valid length"
    });
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(200);
  });

  it("returns 400 for empty string values (Zod rejects empty name, invalid email, short message)", async () => {
    const req = makeRequest({ name: "", email: "", message: "" });
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(400);
    expect(res._data.ok).toBe(false);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(rateLimitModule.rateLimit).mockReturnValue({ allowed: false, remaining: 0, retryAfterSeconds: 900 });

    const req = makeRequest({
      name: "Jane",
      email: "jane@example.com",
      projectType: "Other",
      message: "Hello world!"
    });
    const res = await POST(req) as unknown as { _data: { ok: boolean }; status: number };
    expect(res.status).toBe(429);
    expect(res._data.ok).toBe(false);
  });
});

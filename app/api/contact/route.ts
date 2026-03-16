import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { contactSchema } from "@/lib/schemas/contact";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const ses = new SESClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const CONTACT_EMAIL_FROM = process.env.CONTACT_EMAIL_FROM ?? "";
const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO ?? "";

export async function POST(request: Request) {
  try {
    // --- Rate limiting ---
    const ip = getClientIp(request);
    const limit = rateLimit(ip);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    // --- Parse & validate ---
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Invalid form data.",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { name, email, company, projectType, message } = result.data;

    // --- Send email via SES (with fallback logging) ---
    if (CONTACT_EMAIL_FROM && CONTACT_EMAIL_TO) {
      try {
        await ses.send(
          new SendEmailCommand({
            Source: CONTACT_EMAIL_FROM,
            Destination: { ToAddresses: [CONTACT_EMAIL_TO] },
            Message: {
              Subject: {
                Data: `[Stratos Contact] ${projectType} inquiry from ${name}`,
                Charset: "UTF-8",
              },
              Body: {
                Text: {
                  Data: [
                    `Name: ${name}`,
                    `Email: ${email}`,
                    `Company: ${company || "N/A"}`,
                    `Project Type: ${projectType}`,
                    ``,
                    `Message:`,
                    message,
                  ].join("\n"),
                  Charset: "UTF-8",
                },
              },
            },
          }),
        );
      } catch (sesError) {
        // SES failed — log the validated submission so it is not lost,
        // then return a 500 to the client
        console.error("[contact] SES send failed:", sesError);
        console.log("[contact] Validated submission (SES fallback):", {
          name,
          email,
          company,
          projectType,
          message,
          timestamp: new Date().toISOString(),
          ip,
        });

        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "EMAIL_SEND_FAILED",
              message:
                "Your message was received but we could not send the notification email. We will follow up shortly.",
            },
          },
          { status: 500 },
        );
      }
    } else {
      // SES not configured — development fallback: log the validated submission
      console.log("[contact] SES not configured — logging submission:", {
        name,
        email,
        company,
        projectType,
        message,
        timestamp: new Date().toISOString(),
        ip,
      });
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    // Catch malformed JSON or unexpected errors
    console.error("[contact] Unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

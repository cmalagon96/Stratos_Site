import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "oklch(7% 0.008 160)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Dark background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#0a0f0b",
            display: "flex"
          }}
        />

        {/* Emerald radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(62,207,142,0.08) 0%, transparent 70%)",
            display: "flex"
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 4,
            height: "100%",
            background:
              "linear-gradient(to bottom, transparent, #3ecf8e, transparent)",
            opacity: 0.7,
            display: "flex"
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 0
          }}
        >
          {/* Tagline badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 28,
              border: "1px solid rgba(62,207,142,0.22)",
              background: "rgba(62,207,142,0.05)",
              padding: "8px 18px"
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3ecf8e",
                boxShadow: "0 0 8px rgba(62,207,142,0.8)"
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(62,207,142,0.7)"
              }}
            >
              Systems Online
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 0.9,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              color: "#ffffff",
              marginBottom: 8
            }}
          >
            Stratos Strategies
          </div>

          {/* Emerald accent line */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "#3ecf8e",
              marginBottom: 28
            }}
          >
            Infrastructure for the Frontiers of Life &amp; Flight
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.06em",
              textTransform: "uppercase"
            }}
          >
            Aviation &nbsp;·&nbsp; Genomics &nbsp;·&nbsp; Cloud &nbsp;·&nbsp; Compliance
          </div>
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 80,
            fontSize: 16,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(62,207,142,0.4)"
          }}
        >
          stratosstrat.com
        </div>
      </div>
    ),
    { ...size }
  );
}

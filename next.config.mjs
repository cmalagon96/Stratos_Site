/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Silence the lockfile warning
  turbopack: {
    root: process.cwd()
  },

  // Transpile Three.js packages for SSR compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

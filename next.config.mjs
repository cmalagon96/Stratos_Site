/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Silence the lockfile warning
  turbopack: {
    root: process.cwd()
  },

  // Transpile Three.js packages for SSR compatibility
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"]
};

export default nextConfig;

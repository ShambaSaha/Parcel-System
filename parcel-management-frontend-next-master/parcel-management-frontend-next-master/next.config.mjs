/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export
  output: "export",
  distDir: "out",

  // 🔥 REQUIRED for react-three
  transpilePackages: [
    "@react-three/drei",
    "@react-three/fiber",
    "three"
  ],

  // Prevent image export errors
  images: {
    unoptimized: true
  }
};

export default nextConfig;

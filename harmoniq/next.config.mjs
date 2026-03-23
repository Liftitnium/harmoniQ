/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // The scaffold used ESLint v9-era config; during rapid prototyping we only
    // care about runtime/TS correctness for the UI.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;


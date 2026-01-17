import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix for Windows case-sensitivity issues with multiple lockfiles
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@supabase/supabase-js'],
    // Disable Turbopack for better CSS compatibility
    turbo: undefined,
  },
};

export default nextConfig;

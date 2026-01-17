import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};

export default nextConfig;

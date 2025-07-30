import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Node.js runtime for middleware
  // This allows NextAuth to work properly in middleware without separating auth.config.ts
  serverExternalPackages: ["@auth/supabase-adapter", "@supabase/supabase-js"],
};

export default nextConfig;

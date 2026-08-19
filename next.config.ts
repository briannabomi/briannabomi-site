import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      // The Intimacy Audit is a single self-contained HTML document, not a
      // React route. It lives in public/ and is served at the clean path.
      { source: "/intimacyaudit", destination: "/intimacyaudit/index.html" },
    ];
  },
};

export default nextConfig;

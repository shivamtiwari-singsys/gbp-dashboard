import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This app is an authenticated dashboard where every page depends on the
  // user's session cookie — there's nothing to statically prerender, so we
  // skip Next's Cache Components model rather than add "use cache" /
  // Suspense boundaries everywhere for no benefit.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

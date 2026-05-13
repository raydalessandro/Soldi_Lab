import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: SPEC §1.5 — "filesystem-as-truth + IndexedDB locale.
  // Zero backend. Deploy Vercel statico. PWA installabile."
  output: "export",

  // Image optimization requires a runtime server; static export disables it.
  images: { unoptimized: true },

  // Trailing slashes simplify routing on static hosts that serve directories.
  trailingSlash: true,

  reactStrictMode: true,
};

export default nextConfig;

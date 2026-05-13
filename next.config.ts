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

  // Disabilita la floating "N" del dev overlay che in `next dev` può
  // intercettare i click di Playwright sui link in fondo allo schermo
  // (BottomNav). Non ha effetto in produzione: serve solo al run di test.
  devIndicators: false,
};

export default nextConfig;

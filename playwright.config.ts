import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

// PLAYWRIGHT_BROWSERS_PATH lets us point at a system-installed bundle
// (e.g. /opt/pw-browsers in CI sandboxes that ship browsers pre-baked).
// Leaving it unset uses Playwright's default cache directory.

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    locale: "it-IT",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: `pnpm exec next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
  },
});

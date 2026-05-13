import { expect, test } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("smoke", () => {
  test("dashboard loads after onboarding, header and bottom nav are visible", async ({
    page,
  }) => {
    await completeOnboarding(page);
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Soldi_Lab").first()).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Navigazione principale" }),
    ).toBeVisible();
  });

  test("parent app link is reachable even from the welcome screen", async ({
    page,
  }) => {
    // L'AppHeader vive in layout, fuori dall'AppBootstrap, quindi il link
    // è sempre presente sia in onboarding che dopo.
    await page.goto("/");
    const link = page.getByRole("link", { name: /La Famiglia/i });
    await expect(link).toHaveAttribute(
      "href",
      "https://la-famiglia-alpha.vercel.app",
    );
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("bottom nav reaches every section after onboarding", async ({
    page,
  }) => {
    await completeOnboarding(page);
    for (const [label, expectedTitle] of [
      ["Floor", "Floor"],
      ["Entrate", "Entrate"],
      ["Patrimonio", "Patrimonio"],
      ["Ciclo", "Ciclo economico"],
      ["Advisor", "Advisor"],
    ] as const) {
      await page.getByRole("link", { name: label, exact: true }).click();
      await expect(
        page.getByRole("heading", { name: expectedTitle, level: 1 }),
      ).toBeVisible();
    }
  });

  test("manifest is reachable and references icons", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBe(true);
    const manifest = await res.json();
    expect(manifest.name).toBe("Soldi_Lab");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });
});

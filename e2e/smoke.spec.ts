import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("dashboard loads, header and bottom nav are visible", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Soldi_Lab").first()).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Navigazione principale" }),
    ).toBeVisible();
  });

  test("parent app link points to la-famiglia-alpha", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /La Famiglia/i });
    await expect(link).toHaveAttribute(
      "href",
      "https://la-famiglia-alpha.vercel.app",
    );
    await expect(link).toHaveAttribute("target", "_blank");
  });

  test("bottom nav reaches every section", async ({ page }) => {
    await page.goto("/");
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

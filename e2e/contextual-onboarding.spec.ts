import { expect, test } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("contextual onboarding banners", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test("floor shows the rule banner the first time", async ({ page }) => {
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    await expect(page.getByText("Cosa entra nel Floor")).toBeVisible();
  });

  test("floor banner stays dismissed after closing", async ({ page }) => {
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    await page.getByRole("button", { name: "Chiudi banner" }).click();
    await expect(page.getByText("Cosa entra nel Floor")).toHaveCount(0);

    // Naviga via e torna
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    await expect(page.getByText("Cosa entra nel Floor")).toHaveCount(0);
  });

  test("patrimony shows its own banner", async ({ page }) => {
    await page.getByRole("link", { name: "Patrimonio", exact: true }).click();
    await expect(page.getByText("Ogni asset ha una funzione")).toBeVisible();
  });

  test("advisor shows its intro banner", async ({ page }) => {
    await page.getByRole("link", { name: "Advisor", exact: true }).click();
    await expect(page.getByText("Insight + export")).toBeVisible();
  });
});

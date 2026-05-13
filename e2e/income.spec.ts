import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("income module", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole("link", { name: "Entrate", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Entrate", level: 1 }),
    ).toBeVisible();
  });

  test("empty state guides the user", async ({ page }) => {
    await expect(page.getByText("Nessuna entrata registrata")).toBeVisible();
  });

  test("add monthly income shows up in total", async ({ page }) => {
    await addIncome(page, "Stipendio", "2400", "Mensile");
    await expect(page.getByText("Stipendio")).toBeVisible();
    // Total visible
    await expect(page.locator("text=/2400|2\\.400/").first()).toBeVisible();
  });

  test("annual income normalises to per-month hint", async ({ page }) => {
    await addIncome(page, "Tredicesima", "2400", "Annuale");
    await expect(page.getByText(/≈ .*200.*\/mese/)).toBeVisible();
  });

  test("inline edit recalculates the total", async ({ page }) => {
    await addIncome(page, "Stipendio", "2400", "Mensile");
    await page
      .getByRole("button", { name: /Modifica importo Stipendio/ })
      .click();
    const inlineInput = page.getByRole("spinbutton", {
      name: /Importo Stipendio/,
    });
    await inlineInput.fill("2600");
    await inlineInput.press("Enter");
    await expect(page.locator("text=/2600|2\\.600/").first()).toBeVisible();
  });

  test("archive moves the row out of the active list", async ({ page }) => {
    await addIncome(page, "Vecchio affitto", "300", "Mensile");
    await page.getByRole("button", { name: /^Modifica$/ }).click();
    const form = page.getByRole("dialog", { name: "Modifica entrata" });
    await form.getByRole("button", { name: /Archivia entrata/ }).click();
    await expect(page.getByText("Vecchio affitto")).toHaveCount(0);
  });
});

async function addIncome(
  page: Page,
  name: string,
  amount: string,
  freqLabel: string,
) {
  await page.getByRole("button", { name: "Aggiungi entrata" }).click();
  const form = page.getByRole("dialog", { name: "Nuova entrata" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  await form.getByRole("button", { name: freqLabel, exact: true }).click();
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

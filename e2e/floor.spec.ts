import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("floor module", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Floor", level: 1 }),
    ).toBeVisible();
  });

  test("empty state guides the user to add the first item", async ({
    page,
  }) => {
    await expect(
      page.getByText("Nessuna voce in questa categoria"),
    ).toBeVisible();
    await expect(page.getByText(/Tocca \+ per aggiungere/)).toBeVisible();
  });

  test("can add a monthly essential item and see it in the total", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Aggiungi voce" }).click();
    const form = page.getByRole("dialog", { name: "Nuova voce" });
    await form.getByLabel("Nome").fill("Mutuo");
    await form.getByLabel("Importo (€)").fill("720");
    // Default necessity_level = essential, frequency = monthly: nessuna modifica.
    await form.getByRole("button", { name: "Aggiungi", exact: true }).click();

    await expect(page.getByText("Mutuo")).toBeVisible();
    // Totale visibile nell'header come "720 €" (con possibili spazi/non-break)
    await expect(page.locator("text=/720/").first()).toBeVisible();
  });

  test("annual amount gets normalised in the per-month hint", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Aggiungi voce" }).click();
    const form = page.getByRole("dialog", { name: "Nuova voce" });
    await form.getByLabel("Nome").fill("TARI");
    await form.getByLabel("Importo (€)").fill("300");
    await form.getByRole("button", { name: "Annuale", exact: true }).click();
    await form.getByRole("button", { name: "Aggiungi", exact: true }).click();

    // Sulla card vediamo "≈ 25 €/mese"
    await expect(page.getByText(/≈ .*25.*\/mese/)).toBeVisible();
  });

  test("inline edit on amount updates the floor total", async ({ page }) => {
    await addItem(page, "Bolletta luce", "75", "essential");

    await page.getByRole("button", { name: /Modifica importo/ }).click();
    const inlineInput = page.getByRole("spinbutton", {
      name: /Importo Bolletta luce/i,
    });
    await inlineInput.fill("85");
    await inlineInput.press("Enter");

    await expect(page.locator("text=/85/").first()).toBeVisible();
  });

  test("filter chips narrow the visible list", async ({ page }) => {
    // Add two rows of different levels
    await addItem(page, "Mutuo", "720", "essential");
    await addItem(page, "Netflix", "13", "baseline");

    await page.getByRole("button", { name: "Standard" }).click();
    await expect(page.getByText("Netflix")).toBeVisible();
    await expect(page.getByText("Mutuo")).toHaveCount(0);

    await page.getByRole("button", { name: "Essenziale" }).click();
    await expect(page.getByText("Mutuo")).toBeVisible();
    await expect(page.getByText("Netflix")).toHaveCount(0);
  });

  test("archive moves a row out of the active list", async ({ page }) => {
    await addItem(page, "Vecchio abbonamento", "10", "baseline");
    await page.getByRole("button", { name: /^Modifica$/ }).click();
    const editForm = page.getByRole("dialog", { name: "Modifica voce" });
    await editForm.getByRole("button", { name: /Archivia voce/ }).click();

    // Sparisce dalla lista active
    await expect(page.getByText("Vecchio abbonamento")).toHaveCount(0);
  });
});

async function addItem(
  page: Page,
  name: string,
  amount: string,
  level: "essential" | "baseline" | "lifestyle",
) {
  await page.getByRole("button", { name: "Aggiungi voce" }).click();
  const form = page.getByRole("dialog", { name: "Nuova voce" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  if (level === "baseline") {
    await form.getByRole("button", { name: "Standard", exact: true }).click();
  } else if (level === "lifestyle") {
    await form.getByRole("button", { name: "Lifestyle", exact: true }).click();
  }
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("patrimony module", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole("link", { name: "Patrimonio", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Patrimonio", level: 1 }),
    ).toBeVisible();
  });

  test("empty state guides the user", async ({ page }) => {
    await expect(
      page.getByText("Nessun asset in questa categoria"),
    ).toBeVisible();
    await expect(page.getByText(/Tocca \+ per aggiungere/)).toBeVisible();
  });

  test("can add a reserve asset and see it in the total", async ({ page }) => {
    await addAsset(page, "Conto corrente", "4500", "Reserve");
    await expect(page.getByText("Conto corrente")).toBeVisible();
    await expect(page.locator("text=/4500|4\\.500/").first()).toBeVisible();
  });

  test("inline value edit updates the total", async ({ page }) => {
    await addAsset(page, "PAC ETF", "18500", "Productive");
    await page.getByRole("button", { name: /Modifica valore PAC ETF/ }).click();
    const inlineInput = page.getByRole("spinbutton", {
      name: /Valore PAC ETF/,
    });
    await inlineInput.fill("19000");
    await inlineInput.press("Enter");
    await expect(page.locator("text=/19000|19\\.000/").first()).toBeVisible();
  });

  test("filter chips narrow the visible list", async ({ page }) => {
    await addAsset(page, "Conto corrente", "4500", "Reserve");
    await addAsset(page, "BTP 2032", "12000", "Productive");

    const filters = page.getByRole("button", {
      name: "Productive",
      exact: true,
    });
    // Il filtro chip è quello in cima alla pagina; ce n'è solo uno fuori dal dialog
    await filters.first().click();
    await expect(page.getByText("BTP 2032")).toBeVisible();
    await expect(page.getByText("Conto corrente")).toHaveCount(0);
  });

  test("archive moves the asset out of the active list", async ({ page }) => {
    await addAsset(page, "Vecchio deposito", "1000", "Parked");
    await page.getByRole("button", { name: /^Modifica$/ }).click();
    const form = page.getByRole("dialog", { name: "Modifica asset" });
    await form.getByRole("button", { name: /Archivia asset/ }).click();
    await expect(page.getByText("Vecchio deposito")).toHaveCount(0);
  });
});

async function addAsset(
  page: Page,
  name: string,
  value: string,
  patrimonyLabel: "Reserve" | "Productive" | "Parked",
) {
  await page.getByRole("button", { name: "Aggiungi asset" }).click();
  const form = page.getByRole("dialog", { name: "Nuovo asset" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Valore corrente (€)").fill(value);
  // Il default è Reserve: clicchiamo solo se serve cambiare
  if (patrimonyLabel !== "Reserve") {
    await form
      .getByRole("button", { name: patrimonyLabel, exact: true })
      .click();
  }
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("advisor + AI export", () => {
  test.beforeEach(async ({ page, context }) => {
    // Concedi i permessi clipboard a tutti i test del file: serve a
    // navigator.clipboard.writeText nella copia del contesto.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await completeOnboarding(page);
    await page.getByRole("link", { name: "Advisor", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Advisor", level: 1 }),
    ).toBeVisible();
  });

  test("renders default insight cards even with empty data", async ({
    page,
  }) => {
    // Anche senza dati abbiamo almeno Floor health + Reserve adequacy.
    await expect(page.getByText("Health check del Floor")).toBeVisible();
    await expect(page.getByText("Adeguatezza Reserve")).toBeVisible();
  });

  test("export copies the AI markdown to the clipboard", async ({ page }) => {
    await addIncome(page, "Stipendio", "2400", "Mensile");
    await addFloor(page, "Mutuo", "720", "Essenziale", "Mensile");

    await page.getByRole("link", { name: "Advisor", exact: true }).click();
    await page.getByRole("button", { name: "Copia contesto" }).click();
    await expect(page.getByText("Copiato negli appunti")).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("# Contesto finanziario — Soldi_Lab");
    expect(clip).toContain("## Floor (spese permanenti)");
    expect(clip).toContain("Mutuo");
    expect(clip).toContain("Stipendio");
    expect(clip).toContain("## Domanda");
  });

  test("deficit triggers the explicit deficit insight card", async ({
    page,
  }) => {
    await addIncome(page, "Stipendio", "500", "Mensile");
    await addFloor(page, "Mutuo", "1500", "Essenziale", "Mensile");

    await page.getByRole("link", { name: "Advisor", exact: true }).click();
    await expect(
      page.getByText("Deficit strutturale", { exact: true }),
    ).toBeVisible();
  });
});

async function addIncome(
  page: Page,
  name: string,
  amount: string,
  freqLabel: string,
) {
  await page.getByRole("link", { name: "Entrate", exact: true }).click();
  await page.getByRole("button", { name: "Aggiungi entrata" }).click();
  const form = page.getByRole("dialog", { name: "Nuova entrata" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  await form.getByRole("button", { name: freqLabel, exact: true }).click();
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

async function addFloor(
  page: Page,
  name: string,
  amount: string,
  levelLabel: "Essenziale" | "Standard" | "Lifestyle",
  freqLabel: string,
) {
  await page.getByRole("link", { name: "Floor", exact: true }).click();
  await page.getByRole("button", { name: "Aggiungi voce" }).click();
  const form = page.getByRole("dialog", { name: "Nuova voce" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  if (levelLabel !== "Essenziale") {
    await form.getByRole("button", { name: levelLabel, exact: true }).click();
  }
  if (freqLabel !== "Mensile") {
    await form.getByRole("button", { name: freqLabel, exact: true }).click();
  }
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

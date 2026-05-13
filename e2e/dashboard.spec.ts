import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("dashboard insights", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test("empty space shows zero totals and deficit warning is hidden", async ({
    page,
  }) => {
    // Senza dati il margine reale è 0, non negativo: no warning.
    await expect(page.getByText("Floor mensile")).toBeVisible();
    await expect(page.getByText("Margine reale")).toBeVisible();
    await expect(page.getByText("Patrimonio totale")).toBeVisible();
    await expect(page.getByText(/Deficit strutturale/)).toHaveCount(0);
  });

  test("after adding income and floor, dashboard updates totals and triangle", async ({
    page,
  }) => {
    await addIncome(page, "Stipendio", "2400", "Mensile");
    await addFloor(page, "Mutuo", "720", "Essenziale", "Mensile");

    await page.getByRole("link", { name: "Home", exact: true }).click();

    // Floor mensile 720
    await expect(page.locator("text=/720/").first()).toBeVisible();
    // Composizione Floor card mostra il segmento Essenziale
    await expect(page.getByText("Composizione Floor")).toBeVisible();
    // Triangolo accumulo
    await expect(page.getByText("Triangolo accumulo")).toBeVisible();
    // Margine reale = 2400 - 720 = 1680
    await expect(page.locator("text=/1680|1\\.680/").first()).toBeVisible();
  });

  test("deficit warning surfaces when floor exceeds income", async ({
    page,
  }) => {
    await addIncome(page, "Stipendio", "1000", "Mensile");
    await addFloor(page, "Mutuo", "1500", "Essenziale", "Mensile");

    await page.getByRole("link", { name: "Home", exact: true }).click();

    // Il banner ha la versione capitalizzata; il BigNumber hint quella minuscola.
    await expect(
      page.getByText("Deficit strutturale", { exact: true }),
    ).toBeVisible();
  });

  test("clicking the Composizione Floor card jumps to /floor", async ({
    page,
  }) => {
    await addFloor(page, "Mutuo", "720", "Essenziale", "Mensile");
    await page.getByRole("link", { name: "Home", exact: true }).click();

    await page.getByText("Composizione Floor").click();
    await expect(
      page.getByRole("heading", { name: "Floor", level: 1 }),
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
  // Default is Essenziale; click only when changing.
  if (levelLabel !== "Essenziale") {
    await form.getByRole("button", { name: levelLabel, exact: true }).click();
  }
  if (freqLabel !== "Mensile") {
    await form.getByRole("button", { name: freqLabel, exact: true }).click();
  }
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

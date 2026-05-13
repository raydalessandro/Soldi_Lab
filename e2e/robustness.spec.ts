import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

// Test di robustezza: l'utente in produzione segnalava che alla terza
// voce floor il form sembrava "bloccarsi" e che dopo refresh i dati
// sparivano. La causa più probabile era un errore silenziato dal
// try/finally senza catch nei form, sommato a un service worker che
// poteva servire HTML obsoleto dopo un deploy.
//
// Questi test esercitano scenari sequenziali (5 add consecutivi) e
// verificano che i dati persistano dopo reload.

test.describe("robustness — sequential adds", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test("Floor: aggiungere 5 voci di seguito e ritrovarle tutte dopo reload", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    const names = ["Mutuo", "Luce", "Gas", "Internet", "TARI"];
    for (let i = 0; i < names.length; i++) {
      await addFloor(page, names[i], String(100 + i));
    }
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible();
    }

    // Reload: tutti i dati persistono in IndexedDB
    await page.reload();
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });

  test("Entrate: aggiungere 5 entrate di seguito e ritrovarle dopo reload", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Entrate", exact: true }).click();
    const names = [
      "Stipendio",
      "Affitto attivo",
      "Consulenza",
      "Rendita",
      "Pensione",
    ];
    for (let i = 0; i < names.length; i++) {
      await addIncome(page, names[i], String(500 + i * 100));
    }
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible();
    }
    await page.reload();
    await page.getByRole("link", { name: "Entrate", exact: true }).click();
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });

  test("Patrimonio: aggiungere 5 asset di seguito e ritrovarli dopo reload", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Patrimonio", exact: true }).click();
    const names = [
      "C/C",
      "Deposito",
      "ETF World",
      "BTP 2032",
      "Fondo pensione",
    ];
    for (let i = 0; i < names.length; i++) {
      await addAsset(page, names[i], String(1000 + i * 500));
    }
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible();
    }
    await page.reload();
    await page.getByRole("link", { name: "Patrimonio", exact: true }).click();
    for (const name of names) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });

  test("Floor: il dialog si chiude completamente prima del successivo open", async ({
    page,
  }) => {
    // Verifica esplicita che dopo ogni Aggiungi il dialog è gone prima
    // che ne riapriamo uno nuovo. Era il sintomo originale: il form
    // "non si chiudeva" alla terza voce.
    await page.getByRole("link", { name: "Floor", exact: true }).click();
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Aggiungi voce" }).click();
      const form = page.getByRole("dialog", { name: "Nuova voce" });
      await expect(form).toBeVisible();
      await form.getByLabel("Nome").fill(`Voce ${i}`);
      await form.getByLabel("Importo (€)").fill("100");
      await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
      await expect(form).toBeHidden();
    }
  });
});

async function addFloor(page: Page, name: string, amount: string) {
  await page.getByRole("button", { name: "Aggiungi voce" }).click();
  const form = page.getByRole("dialog", { name: "Nuova voce" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

async function addIncome(page: Page, name: string, amount: string) {
  await page.getByRole("button", { name: "Aggiungi entrata" }).click();
  const form = page.getByRole("dialog", { name: "Nuova entrata" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

async function addAsset(page: Page, name: string, value: string) {
  await page.getByRole("button", { name: "Aggiungi asset" }).click();
  const form = page.getByRole("dialog", { name: "Nuovo asset" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Valore corrente (€)").fill(value);
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

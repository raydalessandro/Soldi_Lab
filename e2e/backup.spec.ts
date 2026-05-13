import { expect, test, type Page } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.describe("backup export/import", () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test("export triggers a JSON download with the expected name pattern", async ({
    page,
  }) => {
    // Aggiungiamo dati così il backup non è banalmente vuoto
    await addFloor(page, "Mutuo", "720");
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await page.getByRole("link", { name: "Apri impostazioni" }).click();
    await expect(
      page.getByRole("heading", { name: "Impostazioni" }),
    ).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Esporta backup" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^soldi-lab-backup-\d{4}-\d{2}-\d{2}\.json$/,
    );
  });

  test("import preview shows counts, confirm applies the backup", async ({
    page,
  }) => {
    // Costruiamo un JSON valido in-memory
    const backupJson = await page.evaluate(() => {
      const now = new Date().toISOString();
      const space = {
        id: "10000000-0000-4000-8000-000000000001",
        name: "Importato",
        icon: "🧪",
        created_at: now,
        updated_at: now,
        archived_at: null,
      };
      const floor = {
        id: "10000000-0000-4000-8000-000000000002",
        space_id: space.id,
        name: "Bolletta importata",
        amount: 60,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
        active: true,
        is_variable_life: false,
        created_at: now,
        updated_at: now,
        archived_at: null,
      };
      return JSON.stringify({
        schema_version: 1,
        exported_at: now,
        app_version: "0.1.0",
        spaces: [space],
        floor_items: [floor],
        income_items: [],
        assets: [],
        space_settings: [],
      });
    });

    await page.getByRole("link", { name: "Apri impostazioni" }).click();
    const fileInput = page.getByLabel("File backup");
    await fileInput.setInputFiles({
      name: "test-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(backupJson),
    });

    // Preview modal
    await expect(page.getByText("Conferma import")).toBeVisible();
    await expect(page.getByText("Spazi").first()).toBeVisible();

    await page.getByRole("button", { name: "Importa", exact: true }).click();

    // Applied modal
    await expect(page.getByText("Import completato")).toBeVisible();
    await expect(page.getByText("Nuovi record")).toBeVisible();
    await page.getByRole("button", { name: "OK" }).click();

    // Il nuovo spazio è disponibile nello switcher
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await page.getByRole("button", { name: "Cambia spazio" }).click();
    const switcher = page.getByRole("dialog", { name: "Cambia spazio" });
    await expect(switcher.getByText("Importato")).toBeVisible();
  });

  test("invalid file surfaces an explicit error", async ({ page }) => {
    await page.getByRole("link", { name: "Apri impostazioni" }).click();
    const fileInput = page.getByLabel("File backup");
    await fileInput.setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("non un json valido"),
    });
    await expect(page.getByText("Import fallito")).toBeVisible();
  });
});

async function addFloor(page: Page, name: string, amount: string) {
  await page.getByRole("link", { name: "Floor", exact: true }).click();
  await page.getByRole("button", { name: "Aggiungi voce" }).click();
  const form = page.getByRole("dialog", { name: "Nuova voce" });
  await form.getByLabel("Nome").fill(name);
  await form.getByLabel("Importo (€)").fill(amount);
  await form.getByRole("button", { name: "Aggiungi", exact: true }).click();
  await expect(form).toBeHidden();
}

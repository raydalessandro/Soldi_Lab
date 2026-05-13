import { expect, test } from "@playwright/test";

test.describe("onboarding & spaces", () => {
  // Ogni test parte da un browser context vuoto: IndexedDB è fresco,
  // quindi la WelcomeFlow è sempre la prima cosa che vediamo.

  test("first launch shows the welcome flow and lets the user create a space", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Solo ciò che pesa davvero" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Avanti" }).click();
    await expect(
      page.getByRole("heading", { name: "I dati restano con te" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Avanti" }).click();
    await expect(
      page.getByRole("heading", { name: "Aggiorna poco, capisci molto" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Avanti" }).click();
    await expect(
      page.getByRole("heading", { name: "Crea il tuo primo spazio" }),
    ).toBeVisible();

    const nameInput = page.getByLabel("Nome dello spazio");
    await expect(nameInput).toHaveValue("Casa Mia");
    await nameInput.fill("Casa Test");
    await page.getByRole("button", { name: "Inizia" }).click();

    // Atterra in Dashboard con SpaceContextBar che mostra il nome scelto.
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Casa Test").first()).toBeVisible();
  });

  test("can skip the intro slides and go straight to space creation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Salta" }).click();
    await expect(
      page.getByRole("heading", { name: "Crea il tuo primo spazio" }),
    ).toBeVisible();
  });

  test("space switcher lists existing spaces and creates new ones", async ({
    page,
  }) => {
    await page.goto("/");
    // Bypass intro
    await page.getByRole("button", { name: "Salta" }).click();
    await page.getByLabel("Nome dello spazio").fill("Primo");
    await page.getByRole("button", { name: "Inizia" }).click();

    // Apri switcher
    await page.getByRole("button", { name: "Cambia spazio" }).click();
    // Lo switcher è un dialog con la lista degli spazi; il nome appare anche
    // nel SpaceContextBar sotto, quindi limitiamo la ricerca al dialog.
    const switcher = page.getByRole("dialog", { name: "Cambia spazio" });
    await expect(switcher.getByText("Primo")).toBeVisible();

    await switcher.getByRole("button", { name: "Nuovo spazio" }).click();
    await page.getByLabel("Nome nuovo spazio").fill("Secondo");
    await page.getByRole("button", { name: "Crea", exact: true }).click();

    // Lo switcher si chiude e il contesto bar mostra il nuovo spazio.
    await expect(page.getByText("Secondo").first()).toBeVisible();
  });

  test("settings page deletes a non-active space with ELIMINA confirmation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Salta" }).click();
    await page.getByLabel("Nome dello spazio").fill("Casa Mia");
    await page.getByRole("button", { name: "Inizia" }).click();

    // Crea un secondo spazio così potremo cancellarlo.
    await page.getByRole("button", { name: "Cambia spazio" }).click();
    const switcher = page.getByRole("dialog", { name: "Cambia spazio" });
    await switcher.getByRole("button", { name: "Nuovo spazio" }).click();
    await page.getByLabel("Nome nuovo spazio").fill("Da cancellare");
    await page.getByRole("button", { name: "Crea", exact: true }).click();

    // Torna a Casa Mia per rendere "Da cancellare" non-attivo.
    await page.getByRole("button", { name: "Cambia spazio" }).click();
    await switcher.getByText("Casa Mia").click();

    // Vai in impostazioni
    await page.getByRole("link", { name: "Apri impostazioni" }).click();
    await expect(
      page.getByRole("heading", { name: "Impostazioni" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Elimina Da cancellare" }).click();
    await expect(
      page.getByRole("heading", { name: "Elimina Da cancellare" }),
    ).toBeVisible();

    const deleteBtn = page.getByRole("button", {
      name: "Elimina",
      exact: true,
    });
    await expect(deleteBtn).toBeDisabled();
    await page.getByLabel("Conferma eliminazione").fill("ELIMINA");
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();

    // Lo spazio sparisce
    await expect(page.getByText("Da cancellare")).toHaveCount(0);
  });
});

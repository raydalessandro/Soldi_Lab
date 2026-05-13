import type { Page } from "@playwright/test";

// Bypassa la WelcomeFlow creando lo spazio default e atterrando in Dashboard.
// Usalo nei test che non testano l'onboarding stesso ma uno stato già inizializzato.
export async function completeOnboarding(
  page: Page,
  spaceName = "Casa Mia",
): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Salta" }).click();
  await page.getByLabel("Nome dello spazio").fill(spaceName);
  await page.getByRole("button", { name: "Inizia" }).click();
  // La Dashboard finita non ha più un h1: aspettiamo un elemento stabile,
  // l'etichetta "Floor mensile" del primo BigNumber.
  await page.getByText("Floor mensile").waitFor();
}

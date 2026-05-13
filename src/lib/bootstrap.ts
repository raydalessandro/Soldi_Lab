// Bootstrap del primo avvio.
//
// L'app è considerata "inizializzata" quando esiste una riga di AppSettings
// con un active_space_id valido. La WelcomeFlow chiama
// completeFirstSpaceSetup() come ultimo step.
//
// Tutta la logica vive qui per essere unit-testabile senza React.

import { putAppSettings } from "./repo/settings";
import { createSpace } from "./repo/spaces";
import { getDB, type SoldiLabDB } from "./db/schema";

export const DEFAULT_SPACE_NAME = "Casa Mia";
export const DEFAULT_SPACE_ICON = "🏠";

export interface FirstSpaceSetup {
  name: string;
  icon?: string;
}

// Crea il primo spazio e l'AppSettings singleton. Idempotente solo
// nel senso che chiamarla due volte crea due spazi: i caller devono
// verificare lo stato di inizializzazione prima.
export async function completeFirstSpaceSetup(
  setup: FirstSpaceSetup,
  db: SoldiLabDB = getDB(),
) {
  const space = await createSpace(
    {
      name: setup.name.trim() || DEFAULT_SPACE_NAME,
      icon: setup.icon ?? DEFAULT_SPACE_ICON,
    },
    db,
  );
  const settings = await putAppSettings(
    {
      active_space_id: space.id,
      theme: "auto",
      onboarding_completed: true,
    },
    db,
  );
  return { space, settings };
}

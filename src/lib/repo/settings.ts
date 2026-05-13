// Repository per AppSettings (singleton globale) e SpaceSettings (per spazio).
//
// AppSettings traccia lo spazio attivo e lo stato dell'onboarding.
// Una sola riga, sempre con id "singleton" (vedi SPEC §4.2).

import { getDB, type SoldiLabDB } from "../db/schema";
import type { AppSettings, SpaceSettings } from "../types";

export async function getAppSettings(
  db: SoldiLabDB = getDB(),
): Promise<AppSettings | undefined> {
  return db.app_settings.get("singleton");
}

export async function putAppSettings(
  settings: Omit<AppSettings, "id">,
  db: SoldiLabDB = getDB(),
): Promise<AppSettings> {
  const next: AppSettings = { id: "singleton", ...settings };
  await db.app_settings.put(next);
  return next;
}

export async function updateAppSettings(
  patch: Partial<Omit<AppSettings, "id">>,
  db: SoldiLabDB = getDB(),
): Promise<AppSettings> {
  const existing = await db.app_settings.get("singleton");
  if (!existing) throw new Error("AppSettings not initialised yet");
  const next: AppSettings = { ...existing, ...patch };
  await db.app_settings.put(next);
  return next;
}

export async function getSpaceSettings(
  space_id: string,
  db: SoldiLabDB = getDB(),
): Promise<SpaceSettings | undefined> {
  return db.space_settings.get(space_id);
}

export async function putSpaceSettings(
  settings: SpaceSettings,
  db: SoldiLabDB = getDB(),
): Promise<SpaceSettings> {
  await db.space_settings.put(settings);
  return settings;
}

export async function updateSpaceSettings(
  space_id: string,
  patch: Partial<Omit<SpaceSettings, "space_id">>,
  db: SoldiLabDB = getDB(),
): Promise<SpaceSettings> {
  const existing = await db.space_settings.get(space_id);
  const next: SpaceSettings = {
    space_id,
    ai_advisor_enabled: existing?.ai_advisor_enabled ?? false,
    deepseek_api_key: existing?.deepseek_api_key,
    ...patch,
  };
  await db.space_settings.put(next);
  return next;
}

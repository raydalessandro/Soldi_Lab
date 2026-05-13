// Esporta lo stato completo del DB locale in un file JSON
// (SPEC §8.2). Esclude esplicitamente AppSettings: la preferenza
// active_space_id e theme sono device-specific.

import { backupFileSchema, type BackupFile } from "../zod-schemas";
import { getDB, type SoldiLabDB } from "../db/schema";

export const BACKUP_SCHEMA_VERSION = 1;

export async function buildBackup(
  appVersion: string,
  db: SoldiLabDB = getDB(),
): Promise<BackupFile> {
  const [spaces, floor_items, income_items, assets, space_settings] =
    await Promise.all([
      db.spaces.toArray(),
      db.floor_items.toArray(),
      db.income_items.toArray(),
      db.assets.toArray(),
      db.space_settings.toArray(),
    ]);

  const backup: BackupFile = {
    schema_version: BACKUP_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    exported_by_device: getDeviceLabel(),
    app_version: appVersion,
    spaces,
    floor_items,
    income_items,
    assets,
    space_settings,
  };

  // La validazione protegge dall'esportare uno stato "corrotto" — è una
  // safety net, in pratica i tipi TS lo prevengono già.
  const parsed = backupFileSchema.parse(backup);
  return parsed;
}

export async function buildBackupJson(
  appVersion: string,
  db: SoldiLabDB = getDB(),
): Promise<string> {
  const backup = await buildBackup(appVersion, db);
  return JSON.stringify(backup, null, 2);
}

// Ricava un'etichetta di dispositivo non-PII (es. "Chrome (macOS)").
// Solo informativa per l'utente, non viene mai trasmessa altrove.
function getDeviceLabel(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const ua = navigator.userAgent ?? "";
  const browser = /Firefox/.test(ua)
    ? "Firefox"
    : /Edg\//.test(ua)
      ? "Edge"
      : /Chrome/.test(ua)
        ? "Chrome"
        : /Safari/.test(ua)
          ? "Safari"
          : "Browser";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Mac/.test(ua)
        ? "macOS"
        : /Linux/.test(ua)
          ? "Linux"
          : /Windows/.test(ua)
            ? "Windows"
            : "Unknown";
  return `${browser} (${os})`;
}

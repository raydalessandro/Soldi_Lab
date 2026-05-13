// Import di un backup JSON con merge last-write-wins per ID (SPEC §8.2).
//
// Workflow:
//   1. Parsiamo + validiamo il JSON via Zod (schema in src/lib/zod-schemas.ts).
//   2. Per ogni record presente nel backup verifichiamo se esiste già nel
//      DB locale:
//        - se non esiste: inseriamo
//        - se esiste e l'updated_at del backup è > di quello locale:
//          aggiorniamo
//        - altrimenti: ignoriamo (locale "vince")
//   3. AppSettings non viene importato — è preferenza del dispositivo.
//
// `previewBackup` ritorna i conteggi senza scrivere nulla, così la UI può
// chiedere conferma all'utente prima di applicare le modifiche.

import { backupFileSchema, type BackupFile } from "../zod-schemas";
import { getDB, type SoldiLabDB } from "../db/schema";
import type { Asset, FloorItem, IncomeItem, Space } from "../types";

export interface BackupPreview {
  schema_version: number;
  exported_at: string;
  exported_by_device?: string;
  app_version: string;
  counts: {
    spaces: number;
    floor_items: number;
    income_items: number;
    assets: number;
    space_settings: number;
  };
}

export interface BackupImportResult {
  inserted: {
    spaces: number;
    floor_items: number;
    income_items: number;
    assets: number;
    space_settings: number;
  };
  updated: {
    spaces: number;
    floor_items: number;
    income_items: number;
    assets: number;
    space_settings: number;
  };
  ignored: {
    spaces: number;
    floor_items: number;
    income_items: number;
    assets: number;
    space_settings: number;
  };
}

export class BackupParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackupParseError";
  }
}

// Lancia BackupParseError se il JSON non è valido o non rispetta lo schema.
export function parseBackup(raw: string): BackupFile {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new BackupParseError(
      `Il file non è un JSON valido: ${(err as Error).message}`,
    );
  }
  const parsed = backupFileSchema.safeParse(json);
  if (!parsed.success) {
    throw new BackupParseError(
      `Il file non rispetta lo schema backup: ${parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")} ${i.message}`)
        .join("; ")}`,
    );
  }
  return parsed.data;
}

export function previewBackup(backup: BackupFile): BackupPreview {
  return {
    schema_version: backup.schema_version,
    exported_at: backup.exported_at,
    exported_by_device: backup.exported_by_device,
    app_version: backup.app_version,
    counts: {
      spaces: backup.spaces.length,
      floor_items: backup.floor_items.length,
      income_items: backup.income_items.length,
      assets: backup.assets.length,
      space_settings: backup.space_settings.length,
    },
  };
}

interface Mergeable {
  id?: string;
  space_id?: string;
  updated_at?: string;
}

async function mergeArray<T extends Mergeable>(
  incoming: T[],
  table: {
    get: (k: string) => Promise<T | undefined>;
    put: (v: T) => Promise<unknown>;
  },
  keyOf: (item: T) => string,
): Promise<{ inserted: number; updated: number; ignored: number }> {
  let inserted = 0;
  let updated = 0;
  let ignored = 0;
  for (const item of incoming) {
    const key = keyOf(item);
    const existing = await table.get(key);
    if (!existing) {
      await table.put(item);
      inserted += 1;
      continue;
    }
    const incomingTs = item.updated_at ?? "";
    const existingTs = existing.updated_at ?? "";
    if (incomingTs > existingTs) {
      await table.put(item);
      updated += 1;
    } else {
      ignored += 1;
    }
  }
  return { inserted, updated, ignored };
}

export async function applyBackup(
  backup: BackupFile,
  db: SoldiLabDB = getDB(),
): Promise<BackupImportResult> {
  // Singola transazione: se qualcosa va storto, rollback.
  // L'ordine importa per i FK logici (spazi prima dei figli) ma Dexie non
  // li applica, quindi è solo per leggibilità.
  let result: BackupImportResult = emptyResult();
  await db.transaction(
    "rw",
    [db.spaces, db.floor_items, db.income_items, db.assets, db.space_settings],
    async () => {
      const spaceR = await mergeArray<Space>(
        backup.spaces,
        db.spaces,
        (s) => s.id,
      );
      const floorR = await mergeArray<FloorItem>(
        backup.floor_items,
        db.floor_items,
        (i) => i.id,
      );
      const incomeR = await mergeArray<IncomeItem>(
        backup.income_items,
        db.income_items,
        (i) => i.id,
      );
      const assetR = await mergeArray<Asset>(
        backup.assets,
        db.assets,
        (a) => a.id,
      );
      // SpaceSettings non hanno updated_at, usano space_id come chiave.
      // Strategy: last write wins indiscriminato — i settings sono leggeri.
      let settingsInserted = 0;
      let settingsUpdated = 0;
      for (const s of backup.space_settings) {
        const existing = await db.space_settings.get(s.space_id);
        await db.space_settings.put(s);
        if (existing) settingsUpdated += 1;
        else settingsInserted += 1;
      }
      result = {
        inserted: {
          spaces: spaceR.inserted,
          floor_items: floorR.inserted,
          income_items: incomeR.inserted,
          assets: assetR.inserted,
          space_settings: settingsInserted,
        },
        updated: {
          spaces: spaceR.updated,
          floor_items: floorR.updated,
          income_items: incomeR.updated,
          assets: assetR.updated,
          space_settings: settingsUpdated,
        },
        ignored: {
          spaces: spaceR.ignored,
          floor_items: floorR.ignored,
          income_items: incomeR.ignored,
          assets: assetR.ignored,
          space_settings: 0,
        },
      };
    },
  );
  return result;
}

function emptyResult(): BackupImportResult {
  return {
    inserted: {
      spaces: 0,
      floor_items: 0,
      income_items: 0,
      assets: 0,
      space_settings: 0,
    },
    updated: {
      spaces: 0,
      floor_items: 0,
      income_items: 0,
      assets: 0,
      space_settings: 0,
    },
    ignored: {
      spaces: 0,
      floor_items: 0,
      income_items: 0,
      assets: 0,
      space_settings: 0,
    },
  };
}

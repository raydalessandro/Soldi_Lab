// Dexie schema. Riflette SPEC §4.3 esattamente.
//
// Il pattern è "filesystem-as-truth + IndexedDB locale" (SPEC §1.5):
// Dexie è la sorgente di verità, l'UI legge via useLiveQuery, le mutazioni
// passano sempre dalle funzioni in src/lib/repo/*. Lo store Zustand
// gestisce solo stato transitorio dell'interfaccia.

import Dexie, { type Table } from "dexie";
import type {
  AppSettings,
  Asset,
  FloorItem,
  IncomeItem,
  Space,
  SpaceSettings,
} from "../types";

export class SoldiLabDB extends Dexie {
  spaces!: Table<Space, string>;
  floor_items!: Table<FloorItem, string>;
  income_items!: Table<IncomeItem, string>;
  assets!: Table<Asset, string>;
  space_settings!: Table<SpaceSettings, string>;
  app_settings!: Table<AppSettings, string>;

  constructor(name = "soldi_lab") {
    super(name);

    // Versione 1 = schema iniziale v1 MVP.
    // Aggiungere migrazioni con .version(2).upgrade(...) per future modifiche
    // mantenendo la backward compatibility sui DB già installati.
    this.version(1).stores({
      spaces: "id, archived_at",
      floor_items:
        "id, space_id, necessity_level, active, frequency, [space_id+active]",
      income_items: "id, space_id, active, [space_id+active]",
      assets: "id, space_id, type, patrimony_type, [space_id+patrimony_type]",
      space_settings: "space_id",
      app_settings: "id",
    });
  }
}

// Istanza singleton condivisa da tutta l'app.
// I test creano istanze isolate via `new SoldiLabDB("test-<random>")`
// per evitare interferenze tra suite (vedi repo/*.test.ts).
let _db: SoldiLabDB | null = null;

export function getDB(): SoldiLabDB {
  if (!_db) _db = new SoldiLabDB();
  return _db;
}

// Permette ai test di iniettare un'istanza isolata.
export function _setDBForTesting(db: SoldiLabDB | null): void {
  _db = db;
}

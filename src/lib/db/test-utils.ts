// Helper per creare istanze isolate di Dexie nei test.
// Ogni test ottiene un DB con nome univoco per evitare interferenze
// tra test paralleli — fake-indexeddb è in-memory ma globale.

import { SoldiLabDB } from "./schema";

let counter = 0;

export function makeTestDB(): SoldiLabDB {
  counter += 1;
  return new SoldiLabDB(`soldi_lab_test_${Date.now()}_${counter}`);
}

export async function closeAndDelete(db: SoldiLabDB): Promise<void> {
  db.close();
  await db.delete();
}

// Repository per gli Space (famiglie).
// Tutte le mutazioni passano da qui: garantiscono id, timestamps e
// soft-delete coerenti, e sono l'unico punto da cui i componenti scrivono
// su Dexie. La lettura va via useLiveQuery / list*.

import { getDB, type SoldiLabDB } from "../db/schema";
import { newId, nowIso } from "../id";
import type { Space } from "../types";

export interface CreateSpaceInput {
  name: string;
  icon?: string;
}

export interface UpdateSpaceInput {
  name?: string;
  icon?: string;
}

export async function createSpace(
  input: CreateSpaceInput,
  db: SoldiLabDB = getDB(),
): Promise<Space> {
  const now = nowIso();
  const space: Space = {
    id: newId(),
    name: input.name,
    icon: input.icon,
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  await db.spaces.add(space);
  return space;
}

export async function updateSpace(
  id: string,
  patch: UpdateSpaceInput,
  db: SoldiLabDB = getDB(),
): Promise<Space> {
  const existing = await db.spaces.get(id);
  if (!existing) throw new Error(`Space ${id} not found`);
  const updated: Space = {
    ...existing,
    ...patch,
    updated_at: nowIso(),
  };
  await db.spaces.put(updated);
  return updated;
}

export async function archiveSpace(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.spaces.get(id);
  if (!existing) throw new Error(`Space ${id} not found`);
  await db.spaces.put({
    ...existing,
    archived_at: nowIso(),
    updated_at: nowIso(),
  });
}

// Hard-delete è l'eccezione SPEC §10.4: eliminazione spazio dopo conferma
// digitazione "ELIMINA". Cancella anche i record figli per evitare orfani.
export async function hardDeleteSpace(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  await db.transaction(
    "rw",
    [db.spaces, db.floor_items, db.income_items, db.assets, db.space_settings],
    async () => {
      await db.floor_items.where("space_id").equals(id).delete();
      await db.income_items.where("space_id").equals(id).delete();
      await db.assets.where("space_id").equals(id).delete();
      await db.space_settings.where("space_id").equals(id).delete();
      await db.spaces.delete(id);
    },
  );
}

export async function getSpace(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<Space | undefined> {
  return db.spaces.get(id);
}

export async function listSpaces(
  options: { includeArchived?: boolean } = {},
  db: SoldiLabDB = getDB(),
): Promise<Space[]> {
  const all = await db.spaces.toArray();
  const visible = options.includeArchived
    ? all
    : all.filter((s) => s.archived_at === null);
  return visible.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

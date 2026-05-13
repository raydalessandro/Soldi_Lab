// Repository delle voci di Floor (spese permanenti).
// Tutte le query sono scoped per space_id (SPEC §13).

import { getDB, type SoldiLabDB } from "../db/schema";
import { newId, nowIso } from "../id";
import type { FloorItem, NecessityLevel } from "../types";

export interface CreateFloorItemInput {
  space_id: string;
  name: string;
  amount: number;
  frequency: FloorItem["frequency"];
  type: FloorItem["type"];
  necessity_level: NecessityLevel;
  active?: boolean;
  note?: string;
  is_variable_life?: boolean;
}

export type UpdateFloorItemInput = Partial<
  Omit<
    FloorItem,
    "id" | "space_id" | "created_at" | "updated_at" | "archived_at"
  >
>;

export async function createFloorItem(
  input: CreateFloorItemInput,
  db: SoldiLabDB = getDB(),
): Promise<FloorItem> {
  const now = nowIso();
  const item: FloorItem = {
    id: newId(),
    space_id: input.space_id,
    name: input.name,
    amount: input.amount,
    frequency: input.frequency,
    type: input.type,
    necessity_level: input.necessity_level,
    active: input.active ?? true,
    note: input.note,
    is_variable_life: input.is_variable_life ?? false,
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  await db.floor_items.add(item);
  return item;
}

export async function updateFloorItem(
  id: string,
  patch: UpdateFloorItemInput,
  db: SoldiLabDB = getDB(),
): Promise<FloorItem> {
  const existing = await db.floor_items.get(id);
  if (!existing) throw new Error(`FloorItem ${id} not found`);
  const updated: FloorItem = {
    ...existing,
    ...patch,
    updated_at: nowIso(),
  };
  await db.floor_items.put(updated);
  return updated;
}

export async function archiveFloorItem(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.floor_items.get(id);
  if (!existing) throw new Error(`FloorItem ${id} not found`);
  await db.floor_items.put({
    ...existing,
    archived_at: nowIso(),
    updated_at: nowIso(),
  });
}

export async function unarchiveFloorItem(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.floor_items.get(id);
  if (!existing) throw new Error(`FloorItem ${id} not found`);
  await db.floor_items.put({
    ...existing,
    archived_at: null,
    updated_at: nowIso(),
  });
}

export async function getFloorItem(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<FloorItem | undefined> {
  return db.floor_items.get(id);
}

export interface ListFloorItemsOptions {
  space_id: string;
  includeArchived?: boolean;
  necessity_level?: NecessityLevel;
  onlyActive?: boolean;
}

export async function listFloorItems(
  options: ListFloorItemsOptions,
  db: SoldiLabDB = getDB(),
): Promise<FloorItem[]> {
  let items = await db.floor_items
    .where("space_id")
    .equals(options.space_id)
    .toArray();
  if (!options.includeArchived) {
    items = items.filter((i) => i.archived_at === null);
  }
  if (options.necessity_level) {
    items = items.filter((i) => i.necessity_level === options.necessity_level);
  }
  if (options.onlyActive) {
    items = items.filter((i) => i.active);
  }
  return items;
}

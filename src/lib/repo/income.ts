// Repository delle Entrate (stipendi, pensioni, affitti attivi, rendite).

import { getDB, type SoldiLabDB } from "../db/schema";
import { newId, nowIso } from "../id";
import type { Frequency, IncomeItem } from "../types";

export interface CreateIncomeItemInput {
  space_id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  active?: boolean;
  note?: string;
}

export type UpdateIncomeItemInput = Partial<
  Omit<
    IncomeItem,
    "id" | "space_id" | "created_at" | "updated_at" | "archived_at"
  >
>;

export async function createIncomeItem(
  input: CreateIncomeItemInput,
  db: SoldiLabDB = getDB(),
): Promise<IncomeItem> {
  const now = nowIso();
  const item: IncomeItem = {
    id: newId(),
    space_id: input.space_id,
    name: input.name,
    amount: input.amount,
    frequency: input.frequency,
    active: input.active ?? true,
    note: input.note,
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  await db.income_items.add(item);
  return item;
}

export async function updateIncomeItem(
  id: string,
  patch: UpdateIncomeItemInput,
  db: SoldiLabDB = getDB(),
): Promise<IncomeItem> {
  const existing = await db.income_items.get(id);
  if (!existing) throw new Error(`IncomeItem ${id} not found`);
  const updated: IncomeItem = {
    ...existing,
    ...patch,
    updated_at: nowIso(),
  };
  await db.income_items.put(updated);
  return updated;
}

export async function archiveIncomeItem(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.income_items.get(id);
  if (!existing) throw new Error(`IncomeItem ${id} not found`);
  await db.income_items.put({
    ...existing,
    archived_at: nowIso(),
    updated_at: nowIso(),
  });
}

export async function unarchiveIncomeItem(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.income_items.get(id);
  if (!existing) throw new Error(`IncomeItem ${id} not found`);
  await db.income_items.put({
    ...existing,
    archived_at: null,
    updated_at: nowIso(),
  });
}

export async function getIncomeItem(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<IncomeItem | undefined> {
  return db.income_items.get(id);
}

export interface ListIncomeItemsOptions {
  space_id: string;
  includeArchived?: boolean;
  onlyActive?: boolean;
}

export async function listIncomeItems(
  options: ListIncomeItemsOptions,
  db: SoldiLabDB = getDB(),
): Promise<IncomeItem[]> {
  let items = await db.income_items
    .where("space_id")
    .equals(options.space_id)
    .toArray();
  if (!options.includeArchived) {
    items = items.filter((i) => i.archived_at === null);
  }
  if (options.onlyActive) {
    items = items.filter((i) => i.active);
  }
  return items;
}

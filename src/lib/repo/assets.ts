// Repository del Patrimonio (asset reserve / productive / parked).
// I campi per la quotazione automatica (quote_symbol, quote_source, ...)
// vengono popolati a partire da v2; in v1 sono sempre undefined.

import { getDB, type SoldiLabDB } from "../db/schema";
import { newId, nowIso } from "../id";
import type { Asset, AssetType, PatrimonyType } from "../types";

export interface CreateAssetInput {
  space_id: string;
  name: string;
  type: AssetType;
  patrimony_type: PatrimonyType;
  current_value: number;
  expected_return_pct?: number;
  monthly_contribution?: number;
  maturity_date?: string;
  note?: string;
  quote_symbol?: string;
  quote_source?: Asset["quote_source"];
  quantity?: number;
  last_quote?: number;
  last_quote_at?: string;
}

export type UpdateAssetInput = Partial<
  Omit<Asset, "id" | "space_id" | "created_at" | "updated_at" | "archived_at">
>;

export async function createAsset(
  input: CreateAssetInput,
  db: SoldiLabDB = getDB(),
): Promise<Asset> {
  const now = nowIso();
  const asset: Asset = {
    id: newId(),
    space_id: input.space_id,
    name: input.name,
    type: input.type,
    patrimony_type: input.patrimony_type,
    current_value: input.current_value,
    expected_return_pct: input.expected_return_pct,
    monthly_contribution: input.monthly_contribution,
    maturity_date: input.maturity_date,
    note: input.note,
    quote_symbol: input.quote_symbol,
    quote_source: input.quote_source,
    quantity: input.quantity,
    last_quote: input.last_quote,
    last_quote_at: input.last_quote_at,
    created_at: now,
    updated_at: now,
    archived_at: null,
  };
  await db.assets.add(asset);
  return asset;
}

export async function updateAsset(
  id: string,
  patch: UpdateAssetInput,
  db: SoldiLabDB = getDB(),
): Promise<Asset> {
  const existing = await db.assets.get(id);
  if (!existing) throw new Error(`Asset ${id} not found`);
  const updated: Asset = {
    ...existing,
    ...patch,
    updated_at: nowIso(),
  };
  await db.assets.put(updated);
  return updated;
}

export async function archiveAsset(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.assets.get(id);
  if (!existing) throw new Error(`Asset ${id} not found`);
  await db.assets.put({
    ...existing,
    archived_at: nowIso(),
    updated_at: nowIso(),
  });
}

export async function unarchiveAsset(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<void> {
  const existing = await db.assets.get(id);
  if (!existing) throw new Error(`Asset ${id} not found`);
  await db.assets.put({
    ...existing,
    archived_at: null,
    updated_at: nowIso(),
  });
}

export async function getAsset(
  id: string,
  db: SoldiLabDB = getDB(),
): Promise<Asset | undefined> {
  return db.assets.get(id);
}

export interface ListAssetsOptions {
  space_id: string;
  includeArchived?: boolean;
  patrimony_type?: PatrimonyType;
  type?: AssetType;
}

export async function listAssets(
  options: ListAssetsOptions,
  db: SoldiLabDB = getDB(),
): Promise<Asset[]> {
  let items = await db.assets
    .where("space_id")
    .equals(options.space_id)
    .toArray();
  if (!options.includeArchived) {
    items = items.filter((a) => a.archived_at === null);
  }
  if (options.patrimony_type) {
    items = items.filter((a) => a.patrimony_type === options.patrimony_type);
  }
  if (options.type) {
    items = items.filter((a) => a.type === options.type);
  }
  return items;
}

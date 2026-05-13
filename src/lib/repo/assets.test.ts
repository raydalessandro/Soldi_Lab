import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  archiveAsset,
  createAsset,
  listAssets,
  unarchiveAsset,
  updateAsset,
} from "./assets";
import { createSpace } from "./spaces";
import { closeAndDelete, makeTestDB } from "../db/test-utils";
import type { SoldiLabDB } from "../db/schema";
import type { Space } from "../types";

describe("assets repository", () => {
  let db: SoldiLabDB;
  let space: Space;

  beforeEach(async () => {
    db = makeTestDB();
    space = await createSpace({ name: "Casa Mia" }, db);
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("creates an asset with optional quote fields left undefined", async () => {
    const asset = await createAsset(
      {
        space_id: space.id,
        name: "Conto corrente",
        type: "liquid",
        patrimony_type: "reserve",
        current_value: 4500,
      },
      db,
    );
    expect(asset.current_value).toBe(4500);
    expect(asset.quote_symbol).toBeUndefined();
    expect(asset.expected_return_pct).toBeUndefined();
    expect(asset.archived_at).toBeNull();
  });

  it("preserves all optional fields when set", async () => {
    const asset = await createAsset(
      {
        space_id: space.id,
        name: "PAC ETF",
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 18500,
        expected_return_pct: 7,
        monthly_contribution: 300,
        quote_symbol: "SWDA.MI",
        quote_source: "yahoo",
        quantity: 200,
      },
      db,
    );
    expect(asset.expected_return_pct).toBe(7);
    expect(asset.monthly_contribution).toBe(300);
    expect(asset.quote_symbol).toBe("SWDA.MI");
    expect(asset.quantity).toBe(200);
  });

  it("update and archive cycle works", async () => {
    const asset = await createAsset(
      {
        space_id: space.id,
        name: "BTP",
        type: "bonds",
        patrimony_type: "productive",
        current_value: 12000,
      },
      db,
    );
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateAsset(asset.id, { current_value: 12500 }, db);
    expect(updated.current_value).toBe(12500);
    expect(updated.updated_at > asset.updated_at).toBe(true);

    await archiveAsset(asset.id, db);
    expect((await db.assets.get(asset.id))?.archived_at).not.toBeNull();
    await unarchiveAsset(asset.id, db);
    expect((await db.assets.get(asset.id))?.archived_at).toBeNull();
  });

  it("listAssets filters by patrimony_type and type", async () => {
    await createAsset(
      {
        space_id: space.id,
        name: "C/C",
        type: "liquid",
        patrimony_type: "reserve",
        current_value: 4500,
      },
      db,
    );
    await createAsset(
      {
        space_id: space.id,
        name: "ETF",
        type: "etf_stocks",
        patrimony_type: "productive",
        current_value: 18500,
      },
      db,
    );
    await createAsset(
      {
        space_id: space.id,
        name: "Liquidità in eccesso",
        type: "liquid",
        patrimony_type: "parked",
        current_value: 3000,
      },
      db,
    );

    const reserve = await listAssets(
      { space_id: space.id, patrimony_type: "reserve" },
      db,
    );
    expect(reserve.map((a) => a.name)).toEqual(["C/C"]);

    const liquid = await listAssets({ space_id: space.id, type: "liquid" }, db);
    expect(liquid.map((a) => a.name).sort()).toEqual([
      "C/C",
      "Liquidità in eccesso",
    ]);
  });
});

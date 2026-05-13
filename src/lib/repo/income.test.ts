import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  archiveIncomeItem,
  createIncomeItem,
  listIncomeItems,
  unarchiveIncomeItem,
  updateIncomeItem,
} from "./income";
import { createSpace } from "./spaces";
import { closeAndDelete, makeTestDB } from "../db/test-utils";
import type { SoldiLabDB } from "../db/schema";
import type { Space } from "../types";

describe("income repository", () => {
  let db: SoldiLabDB;
  let space: Space;

  beforeEach(async () => {
    db = makeTestDB();
    space = await createSpace({ name: "Casa Mia" }, db);
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("creates an income item active by default", async () => {
    const item = await createIncomeItem(
      {
        space_id: space.id,
        name: "Stipendio",
        amount: 2400,
        frequency: "monthly",
      },
      db,
    );
    expect(item.active).toBe(true);
    expect(item.archived_at).toBeNull();
  });

  it("updates and archives correctly", async () => {
    const item = await createIncomeItem(
      {
        space_id: space.id,
        name: "Stipendio",
        amount: 2400,
        frequency: "monthly",
      },
      db,
    );
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateIncomeItem(item.id, { amount: 2500 }, db);
    expect(updated.amount).toBe(2500);
    expect(updated.updated_at > item.updated_at).toBe(true);

    await archiveIncomeItem(item.id, db);
    const archived = await db.income_items.get(item.id);
    expect(archived?.archived_at).not.toBeNull();

    await unarchiveIncomeItem(item.id, db);
    const restored = await db.income_items.get(item.id);
    expect(restored?.archived_at).toBeNull();
  });

  it("listIncomeItems honours space_id, onlyActive and includeArchived", async () => {
    const a = await createIncomeItem(
      {
        space_id: space.id,
        name: "Stipendio",
        amount: 2400,
        frequency: "monthly",
      },
      db,
    );
    const inactive = await createIncomeItem(
      {
        space_id: space.id,
        name: "Vecchio affitto",
        amount: 500,
        frequency: "monthly",
        active: false,
      },
      db,
    );
    const archived = await createIncomeItem(
      {
        space_id: space.id,
        name: "Tredicesima",
        amount: 2100,
        frequency: "annual",
      },
      db,
    );
    await archiveIncomeItem(archived.id, db);

    const visible = await listIncomeItems({ space_id: space.id }, db);
    expect(visible.map((i) => i.id).sort()).toEqual([a.id, inactive.id].sort());

    const active = await listIncomeItems(
      { space_id: space.id, onlyActive: true },
      db,
    );
    expect(active.map((i) => i.id)).toEqual([a.id]);

    const all = await listIncomeItems(
      { space_id: space.id, includeArchived: true },
      db,
    );
    expect(all.length).toBe(3);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  archiveFloorItem,
  createFloorItem,
  listFloorItems,
  unarchiveFloorItem,
  updateFloorItem,
} from "./floor";
import { createSpace } from "./spaces";
import { closeAndDelete, makeTestDB } from "../db/test-utils";
import type { SoldiLabDB } from "../db/schema";
import type { Space } from "../types";

describe("floor repository", () => {
  let db: SoldiLabDB;
  let space: Space;
  let otherSpace: Space;

  beforeEach(async () => {
    db = makeTestDB();
    space = await createSpace({ name: "Casa Mia" }, db);
    otherSpace = await createSpace({ name: "Casa Genitori" }, db);
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("creates a floor item with sensible defaults", async () => {
    const item = await createFloorItem(
      {
        space_id: space.id,
        name: "Mutuo",
        amount: 720,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );
    expect(item.active).toBe(true);
    expect(item.is_variable_life).toBe(false);
    expect(item.archived_at).toBeNull();
    expect(item.space_id).toBe(space.id);
  });

  it("create accepts is_variable_life flag for the special row", async () => {
    const item = await createFloorItem(
      {
        space_id: space.id,
        name: "Vita variabile mensile",
        amount: 550,
        frequency: "monthly",
        type: "variable",
        necessity_level: "essential",
        is_variable_life: true,
      },
      db,
    );
    expect(item.is_variable_life).toBe(true);
  });

  it("updates a floor item and bumps updated_at", async () => {
    const item = await createFloorItem(
      {
        space_id: space.id,
        name: "Mutuo",
        amount: 720,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateFloorItem(item.id, { amount: 800 }, db);
    expect(updated.amount).toBe(800);
    expect(updated.updated_at > item.updated_at).toBe(true);
    expect(updated.created_at).toBe(item.created_at);
  });

  it("archive sets archived_at; unarchive clears it", async () => {
    const item = await createFloorItem(
      {
        space_id: space.id,
        name: "DAZN",
        amount: 30,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "baseline",
      },
      db,
    );
    await archiveFloorItem(item.id, db);
    const archived = await db.floor_items.get(item.id);
    expect(archived?.archived_at).not.toBeNull();

    await unarchiveFloorItem(item.id, db);
    const restored = await db.floor_items.get(item.id);
    expect(restored?.archived_at).toBeNull();
  });

  it("listFloorItems is scoped to space_id", async () => {
    await createFloorItem(
      {
        space_id: space.id,
        name: "A",
        amount: 100,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );
    await createFloorItem(
      {
        space_id: otherSpace.id,
        name: "B",
        amount: 100,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );

    const mine = await listFloorItems({ space_id: space.id }, db);
    expect(mine.map((i) => i.name)).toEqual(["A"]);
  });

  it("listFloorItems excludes archived by default", async () => {
    const a = await createFloorItem(
      {
        space_id: space.id,
        name: "A",
        amount: 100,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );
    const b = await createFloorItem(
      {
        space_id: space.id,
        name: "B",
        amount: 100,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );
    await archiveFloorItem(b.id, db);

    const visible = await listFloorItems({ space_id: space.id }, db);
    expect(visible.map((i) => i.id)).toEqual([a.id]);

    const all = await listFloorItems(
      { space_id: space.id, includeArchived: true },
      db,
    );
    expect(all.length).toBe(2);
  });

  it("listFloorItems filters by necessity_level and onlyActive", async () => {
    await createFloorItem(
      {
        space_id: space.id,
        name: "ess",
        amount: 100,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "essential",
      },
      db,
    );
    const baseline = await createFloorItem(
      {
        space_id: space.id,
        name: "bas",
        amount: 30,
        frequency: "monthly",
        type: "fixed",
        necessity_level: "baseline",
      },
      db,
    );
    await updateFloorItem(baseline.id, { active: false }, db);

    const essential = await listFloorItems(
      { space_id: space.id, necessity_level: "essential" },
      db,
    );
    expect(essential.map((i) => i.name)).toEqual(["ess"]);

    const active = await listFloorItems(
      { space_id: space.id, onlyActive: true },
      db,
    );
    expect(active.map((i) => i.name)).toEqual(["ess"]);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  archiveSpace,
  createSpace,
  getSpace,
  hardDeleteSpace,
  listSpaces,
  updateSpace,
} from "./spaces";
import { createFloorItem } from "./floor";
import { createIncomeItem } from "./income";
import { createAsset } from "./assets";
import { closeAndDelete, makeTestDB } from "../db/test-utils";
import type { SoldiLabDB } from "../db/schema";

describe("spaces repository", () => {
  let db: SoldiLabDB;

  beforeEach(() => {
    db = makeTestDB();
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("creates a space with id, timestamps and null archived_at", async () => {
    const space = await createSpace({ name: "Casa Mia", icon: "🏠" }, db);
    expect(space.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(space.name).toBe("Casa Mia");
    expect(space.icon).toBe("🏠");
    expect(space.created_at).toBe(space.updated_at);
    expect(space.archived_at).toBeNull();
  });

  it("updates a space and bumps updated_at", async () => {
    const created = await createSpace({ name: "Casa" }, db);
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateSpace(
      created.id,
      { name: "Casa Mia", icon: "🏠" },
      db,
    );
    expect(updated.name).toBe("Casa Mia");
    expect(updated.icon).toBe("🏠");
    expect(updated.created_at).toBe(created.created_at);
    expect(updated.updated_at > created.updated_at).toBe(true);
  });

  it("throws when updating a non-existent space", async () => {
    await expect(
      updateSpace("00000000-0000-0000-0000-000000000000", { name: "X" }, db),
    ).rejects.toThrow(/not found/);
  });

  it("archives a space (soft delete) without removing it", async () => {
    const created = await createSpace({ name: "Old" }, db);
    await archiveSpace(created.id, db);
    const fetched = await getSpace(created.id, db);
    expect(fetched).toBeDefined();
    expect(fetched?.archived_at).not.toBeNull();
  });

  it("listSpaces excludes archived by default and includes them on demand", async () => {
    const a = await createSpace({ name: "A" }, db);
    const b = await createSpace({ name: "B" }, db);
    await archiveSpace(b.id, db);

    const visible = await listSpaces({}, db);
    expect(visible.map((s) => s.id)).toEqual([a.id]);

    const all = await listSpaces({ includeArchived: true }, db);
    expect(all.map((s) => s.id).sort()).toEqual([a.id, b.id].sort());
  });

  it("hardDeleteSpace also removes children to avoid orphans", async () => {
    const space = await createSpace({ name: "Doomed" }, db);
    await createFloorItem(
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
    await createIncomeItem(
      {
        space_id: space.id,
        name: "Stipendio",
        amount: 2400,
        frequency: "monthly",
      },
      db,
    );
    await createAsset(
      {
        space_id: space.id,
        name: "C/C",
        type: "liquid",
        patrimony_type: "reserve",
        current_value: 5000,
      },
      db,
    );

    await hardDeleteSpace(space.id, db);

    expect(await getSpace(space.id, db)).toBeUndefined();
    expect(
      await db.floor_items.where("space_id").equals(space.id).count(),
    ).toBe(0);
    expect(
      await db.income_items.where("space_id").equals(space.id).count(),
    ).toBe(0);
    expect(await db.assets.where("space_id").equals(space.id).count()).toBe(0);
  });
});

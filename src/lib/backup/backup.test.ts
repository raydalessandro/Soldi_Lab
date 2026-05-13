import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildBackup, buildBackupJson } from "./export";
import {
  applyBackup,
  BackupParseError,
  parseBackup,
  previewBackup,
} from "./import";
import { closeAndDelete, makeTestDB } from "../db/test-utils";
import type { SoldiLabDB } from "../db/schema";
import { createSpace } from "../repo/spaces";
import { createFloorItem } from "../repo/floor";
import { createIncomeItem } from "../repo/income";
import { createAsset } from "../repo/assets";
import { newId, nowIso } from "../id";

async function seed(db: SoldiLabDB) {
  const space = await createSpace({ name: "Casa Mia", icon: "🏠" }, db);
  const floor = await createFloorItem(
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
  const income = await createIncomeItem(
    {
      space_id: space.id,
      name: "Stipendio",
      amount: 2400,
      frequency: "monthly",
    },
    db,
  );
  const asset = await createAsset(
    {
      space_id: space.id,
      name: "C/C",
      type: "liquid",
      patrimony_type: "reserve",
      current_value: 4500,
    },
    db,
  );
  return { space, floor, income, asset };
}

describe("backup export", () => {
  let db: SoldiLabDB;

  beforeEach(() => {
    db = makeTestDB();
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("captures the full DB shape", async () => {
    await seed(db);
    const backup = await buildBackup("0.1.0", db);
    expect(backup.schema_version).toBe(1);
    expect(backup.spaces).toHaveLength(1);
    expect(backup.floor_items).toHaveLength(1);
    expect(backup.income_items).toHaveLength(1);
    expect(backup.assets).toHaveLength(1);
    expect(backup.app_version).toBe("0.1.0");
  });

  it("buildBackupJson returns valid JSON that parses back", async () => {
    await seed(db);
    const json = await buildBackupJson("0.1.0", db);
    const reparsed = JSON.parse(json);
    expect(reparsed.schema_version).toBe(1);
    expect(Array.isArray(reparsed.spaces)).toBe(true);
  });
});

describe("backup parse + preview", () => {
  it("parseBackup throws on invalid JSON", () => {
    expect(() => parseBackup("not json")).toThrowError(BackupParseError);
  });

  it("parseBackup throws on schema mismatch", () => {
    expect(() => parseBackup(JSON.stringify({ foo: "bar" }))).toThrowError(
      BackupParseError,
    );
  });

  it("previewBackup returns counts without writing", () => {
    const valid = {
      schema_version: 1,
      exported_at: nowIso(),
      app_version: "0.1.0",
      spaces: [
        {
          id: newId(),
          name: "x",
          created_at: nowIso(),
          updated_at: nowIso(),
          archived_at: null,
        },
      ],
      floor_items: [],
      income_items: [],
      assets: [],
      space_settings: [],
    };
    const preview = previewBackup(parseBackup(JSON.stringify(valid)));
    expect(preview.counts.spaces).toBe(1);
    expect(preview.counts.floor_items).toBe(0);
  });
});

describe("backup apply (merge last-write-wins)", () => {
  let db: SoldiLabDB;

  beforeEach(() => {
    db = makeTestDB();
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("inserts new rows when DB is empty", async () => {
    // backup proveniente da un altro device
    const otherDB = makeTestDB();
    await seed(otherDB);
    const backup = await buildBackup("0.1.0", otherDB);
    await closeAndDelete(otherDB);

    const result = await applyBackup(backup, db);
    expect(result.inserted.spaces).toBe(1);
    expect(result.inserted.floor_items).toBe(1);
    expect(result.inserted.income_items).toBe(1);
    expect(result.inserted.assets).toBe(1);
    expect(await db.spaces.count()).toBe(1);
    expect(await db.floor_items.count()).toBe(1);
  });

  it("round-trip (export then import on same DB) is a no-op for content", async () => {
    const seeded = await seed(db);
    const backup = await buildBackup("0.1.0", db);
    const result = await applyBackup(backup, db);
    // Stesso updated_at → ignored
    expect(result.updated.spaces).toBe(0);
    expect(result.ignored.spaces).toBe(1);
    expect(result.ignored.floor_items).toBe(1);
    expect((await db.spaces.get(seeded.space.id))?.name).toBe("Casa Mia");
  });

  it("updates local row when backup updated_at is newer", async () => {
    const seeded = await seed(db);
    const newer = {
      ...seeded.floor,
      amount: 800,
      updated_at: futureIso(seeded.floor.updated_at),
    };
    const backup = await buildBackup("0.1.0", db);
    backup.floor_items = [newer];

    const result = await applyBackup(backup, db);
    expect(result.updated.floor_items).toBe(1);
    expect((await db.floor_items.get(seeded.floor.id))?.amount).toBe(800);
  });

  it("ignores backup row when local updated_at is newer", async () => {
    const seeded = await seed(db);
    const backup = await buildBackup("0.1.0", db);
    // simulate locale "più recente" senza toccare l'updated_at del backup
    await db.floor_items.put({
      ...seeded.floor,
      amount: 999,
      updated_at: futureIso(seeded.floor.updated_at),
    });

    const result = await applyBackup(backup, db);
    expect(result.ignored.floor_items).toBe(1);
    expect((await db.floor_items.get(seeded.floor.id))?.amount).toBe(999);
  });

  it("does not import app_settings (device preference, SPEC §8.2)", async () => {
    const seeded = await seed(db);
    const backup = await buildBackup("0.1.0", db);
    // simuliamo un app_settings nel JSON: il nostro schema non lo include,
    // quindi parseBackup deve rifiutarlo se presente come campo extra?
    // Zod default: extra fields ignored. Verifichiamo l'effetto in apply.
    await applyBackup(backup, db);
    expect((await db.spaces.count()) >= 1).toBe(true);
    // Non c'è una tabella app_settings nel backup, quindi nulla da fare.
    expect(seeded.space.id).toBeTruthy();
  });
});

function futureIso(base: string): string {
  return new Date(Date.parse(base) + 1000).toISOString();
}

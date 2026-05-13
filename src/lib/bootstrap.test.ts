import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_SPACE_ICON,
  DEFAULT_SPACE_NAME,
  completeFirstSpaceSetup,
} from "./bootstrap";
import { getAppSettings } from "./repo/settings";
import { listSpaces } from "./repo/spaces";
import { closeAndDelete, makeTestDB } from "./db/test-utils";
import type { SoldiLabDB } from "./db/schema";

describe("bootstrap.completeFirstSpaceSetup", () => {
  let db: SoldiLabDB;

  beforeEach(() => {
    db = makeTestDB();
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("creates the first space and persists AppSettings", async () => {
    const { space, settings } = await completeFirstSpaceSetup(
      { name: "Casa Mia" },
      db,
    );
    expect(space.name).toBe("Casa Mia");
    expect(settings.active_space_id).toBe(space.id);
    expect(settings.onboarding_completed).toBe(true);

    const stored = await getAppSettings(db);
    expect(stored?.active_space_id).toBe(space.id);
    const spaces = await listSpaces({}, db);
    expect(spaces.length).toBe(1);
  });

  it("falls back to default name when input is empty/whitespace", async () => {
    const { space } = await completeFirstSpaceSetup({ name: "   " }, db);
    expect(space.name).toBe(DEFAULT_SPACE_NAME);
    expect(space.icon).toBe(DEFAULT_SPACE_ICON);
  });

  it("respects a custom icon", async () => {
    const { space } = await completeFirstSpaceSetup(
      { name: "Casa Genitori", icon: "👨‍👩‍👧" },
      db,
    );
    expect(space.icon).toBe("👨‍👩‍👧");
  });
});

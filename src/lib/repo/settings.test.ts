import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getAppSettings,
  getSpaceSettings,
  putAppSettings,
  updateAppSettings,
  updateSpaceSettings,
} from "./settings";
import { closeAndDelete, makeTestDB } from "../db/test-utils";
import type { SoldiLabDB } from "../db/schema";
import { newId } from "../id";

describe("settings repository", () => {
  let db: SoldiLabDB;

  beforeEach(() => {
    db = makeTestDB();
  });

  afterEach(async () => {
    await closeAndDelete(db);
  });

  it("getAppSettings returns undefined before initialisation", async () => {
    expect(await getAppSettings(db)).toBeUndefined();
  });

  it("putAppSettings persists the singleton with id 'singleton'", async () => {
    const spaceId = newId();
    const saved = await putAppSettings(
      {
        active_space_id: spaceId,
        theme: "auto",
        onboarding_completed: false,
      },
      db,
    );
    expect(saved.id).toBe("singleton");
    const fetched = await getAppSettings(db);
    expect(fetched).toEqual(saved);
  });

  it("updateAppSettings throws when not initialised", async () => {
    await expect(updateAppSettings({ theme: "dark" }, db)).rejects.toThrow();
  });

  it("updateAppSettings patches existing settings", async () => {
    const spaceId = newId();
    await putAppSettings(
      {
        active_space_id: spaceId,
        theme: "auto",
        onboarding_completed: false,
      },
      db,
    );
    const updated = await updateAppSettings({ onboarding_completed: true }, db);
    expect(updated.onboarding_completed).toBe(true);
    expect(updated.active_space_id).toBe(spaceId);
    expect(updated.theme).toBe("auto");
  });

  it("updateSpaceSettings upserts with sane defaults", async () => {
    const spaceId = newId();
    const settings = await updateSpaceSettings(
      spaceId,
      { ai_advisor_enabled: true },
      db,
    );
    expect(settings.space_id).toBe(spaceId);
    expect(settings.ai_advisor_enabled).toBe(true);

    const fetched = await getSpaceSettings(spaceId, db);
    expect(fetched).toEqual(settings);

    const patched = await updateSpaceSettings(
      spaceId,
      { deepseek_api_key: "sk-test" },
      db,
    );
    expect(patched.ai_advisor_enabled).toBe(true);
    expect(patched.deepseek_api_key).toBe("sk-test");
  });
});

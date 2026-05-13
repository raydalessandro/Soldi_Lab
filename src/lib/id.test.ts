import { describe, expect, it } from "vitest";
import { newId, nowIso } from "./id";

describe("id helpers", () => {
  it("newId returns a valid v4 UUID", () => {
    const id = newId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("newId returns a different value each call", () => {
    const ids = new Set([newId(), newId(), newId(), newId(), newId()]);
    expect(ids.size).toBe(5);
  });

  it("nowIso returns an ISO 8601 string with Z timezone", () => {
    const ts = nowIso();
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(Number.isNaN(Date.parse(ts))).toBe(false);
  });
});

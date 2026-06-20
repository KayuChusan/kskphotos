import { describe, it, expect } from "vitest";
import {
  generateToken,
  hashToken,
  signUnlockValue,
  parseUnlockValue,
  addEntry,
  UNLOCK_MAX_AGE,
} from "./unlock";

describe("token", () => {
  it("generates url-safe, unique tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(24);
  });

  it("hashes deterministically and differs per token", () => {
    const t = generateToken();
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken("a")).not.toBe(hashToken("b"));
    expect(hashToken("a")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("unlock cookie value", () => {
  it("round-trips collection/token entries", () => {
    const value = signUnlockValue([
      { c: "col1", k: "tok1" },
      { c: "col2", k: "tok2" },
    ]);
    expect(parseUnlockValue(value)).toEqual([
      { c: "col1", k: "tok1" },
      { c: "col2", k: "tok2" },
    ]);
  });

  it("deduplicates identical entries", () => {
    const value = signUnlockValue([
      { c: "a", k: "t" },
      { c: "a", k: "t" },
      { c: "b", k: "t" },
    ]);
    expect(parseUnlockValue(value)).toEqual([
      { c: "a", k: "t" },
      { c: "b", k: "t" },
    ]);
  });

  it("rejects a tampered body or signature", () => {
    const value = signUnlockValue([{ c: "col1", k: "tok1" }]);
    const [body, mac] = value.split(".");
    const forged = `${Buffer.from(
      JSON.stringify({ e: [{ c: "evil", k: "x" }], exp: Date.now() + 1000 })
    ).toString("base64url")}.${mac}`;
    expect(parseUnlockValue(forged)).toEqual([]);
    expect(parseUnlockValue(`${body}x.${mac}`)).toEqual([]);
  });

  it("rejects an expired value", () => {
    const past = Date.now() - UNLOCK_MAX_AGE * 1000 - 10_000;
    const value = signUnlockValue([{ c: "col1", k: "tok1" }], past);
    expect(parseUnlockValue(value)).toEqual([]);
  });

  it("returns empty for missing/garbage input", () => {
    expect(parseUnlockValue(undefined)).toEqual([]);
    expect(parseUnlockValue("")).toEqual([]);
    expect(parseUnlockValue("nodot")).toEqual([]);
  });
});

describe("addEntry", () => {
  it("adds a new collection entry", () => {
    expect(addEntry([], "col1", "tok1")).toEqual([{ c: "col1", k: "tok1" }]);
  });

  it("replaces the token for the same collection (latest wins)", () => {
    const start = [{ c: "col1", k: "old" }];
    expect(addEntry(start, "col1", "new")).toEqual([{ c: "col1", k: "new" }]);
  });

  it("keeps entries for other collections", () => {
    const start = [{ c: "col1", k: "t1" }];
    expect(addEntry(start, "col2", "t2")).toEqual([
      { c: "col1", k: "t1" },
      { c: "col2", k: "t2" },
    ]);
  });
});

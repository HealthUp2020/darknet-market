// NIGHT MARKET — save/resume persistence tests.
import { test, expect, describe } from "bun:test";
import { SAVE_KEY, isResumable, parseSave } from "../public/persistence.js";
import { newGame } from "../public/engine.js";

describe("SAVE_KEY", () => {
  test("is the expected constant", () => {
    expect(SAVE_KEY).toBe("nm-save-v1");
  });
});

describe("isResumable", () => {
  test("true for a fresh newGame() state", () => {
    const s = newGame();
    expect(isResumable(s)).toBe(true);
  });

  test("false for null / undefined", () => {
    expect(isResumable(null)).toBe(false);
    expect(isResumable(undefined)).toBe(false);
  });

  test("false for an empty object", () => {
    expect(isResumable({})).toBe(false);
  });

  test("false when match.matchOver is true", () => {
    const s = newGame();
    s.match = { ...(s.match ?? {}), matchOver: true };
    expect(isResumable(s)).toBe(false);
  });

  test("false with only 3 players", () => {
    const s = newGame();
    s.players = s.players.slice(0, 3);
    expect(isResumable(s)).toBe(false);
  });

  test("false when market is missing", () => {
    const s: any = newGame();
    delete s.market;
    expect(isResumable(s)).toBe(false);
  });

  test("false when deck is missing", () => {
    const s: any = newGame();
    delete s.deck;
    expect(isResumable(s)).toBe(false);
  });

  test("false when tokens is missing", () => {
    const s: any = newGame();
    delete s.tokens;
    expect(isResumable(s)).toBe(false);
  });

  test("false when turnIndex is not a number", () => {
    const s: any = newGame();
    s.turnIndex = "0";
    expect(isResumable(s)).toBe(false);
  });

  test("false when match is missing entirely", () => {
    const s: any = newGame();
    delete s.match;
    expect(isResumable(s)).toBe(false);
  });
});

describe("parseSave", () => {
  test("returns null for null / undefined / empty string", () => {
    expect(parseSave(null as any)).toBeNull();
    expect(parseSave(undefined as any)).toBeNull();
    expect(parseSave("")).toBeNull();
  });

  test("returns null for malformed JSON", () => {
    expect(parseSave("{")).toBeNull();
  });

  test("returns null for valid JSON that isn't resumable", () => {
    expect(parseSave("{}")).toBeNull();
  });

  test("parses a real match and preserves key fields", () => {
    const s = newGame();
    const parsed = parseSave(JSON.stringify(s));
    expect(parsed).not.toBeNull();
    expect(parsed.players.length).toBe(4);
    expect(parsed.match.matchOver).toBe(false);
  });

  test("round-trip is lossless for a newGame() state", () => {
    const s = newGame();
    const parsed = parseSave(JSON.stringify(s));
    expect(parsed).toEqual(JSON.parse(JSON.stringify(s)));
  });
});

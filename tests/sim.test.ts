// NIGHT MARKET — headless simulation harness tests (public/sim.js, ROC-192 / ROC-204).
// Run: `bun test`.
import { test, expect, describe } from "bun:test";
import { makeRng, playGame, simulate, defaultStrategy } from "../public/sim.js";
import { PLAYER_COUNT } from "../public/engine.js";

describe("makeRng", () => {
  test("same seed produces identical sequences", () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const seqA = Array.from({ length: 50 }, () => a());
    const seqB = Array.from({ length: 50 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  test("different seeds produce different sequences", () => {
    const a = makeRng(1);
    const b = makeRng(2);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  test("outputs are always in [0, 1)", () => {
    const rng = makeRng(7);
    for (let i = 0; i < 2000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test("outputs are numbers, not NaN", () => {
    const rng = makeRng(0);
    for (let i = 0; i < 100; i++) {
      expect(Number.isFinite(rng())).toBe(true);
    }
  });
});

describe("playGame", () => {
  const fourDefaults = () => [defaultStrategy, defaultStrategy, defaultStrategy, defaultStrategy];

  test("reaches gameOver:true within the guard using 4 default bots", () => {
    const result = playGame(fourDefaults(), makeRng(1));
    expect(result.gameOver).toBe(true);
  });

  test("returns 4 scores and at least one winner", () => {
    const result = playGame(fourDefaults(), makeRng(2));
    expect(result.scores).toHaveLength(PLAYER_COUNT);
    expect(result.scores.length).toBe(4);
    expect(result.winners.length).toBeGreaterThanOrEqual(1);
  });

  test("winners are exactly the argmax indices of scores", () => {
    const result = playGame(fourDefaults(), makeRng(3));
    const max = Math.max(...result.scores);
    const expectedWinners = result.scores
      .map((s: number, i: number) => (s === max ? i : -1))
      .filter((i: number) => i >= 0);
    expect(result.winners).toEqual(expectedWinners);
    // Every winner index must actually hold the max score.
    for (const w of result.winners) {
      expect(result.scores[w]).toBe(max);
    }
    // No non-winner should have a score >= max.
    for (let i = 0; i < result.scores.length; i++) {
      if (!result.winners.includes(i)) {
        expect(result.scores[i]).toBeLessThan(max);
      }
    }
  });

  test("restores Math.random after the game finishes", () => {
    const before = Math.random;
    playGame(fourDefaults(), makeRng(4));
    const after = Math.random;
    expect(after).toBe(before);
  });

  test("restores Math.random even conceptually mid-run (identity check across multiple games)", () => {
    const original = Math.random;
    for (let i = 0; i < 5; i++) {
      playGame(fourDefaults(), makeRng(100 + i));
      expect(Math.random).toBe(original);
    }
  });

  test("throws if given fewer than 4 strategies", () => {
    expect(() => playGame([defaultStrategy, defaultStrategy, defaultStrategy], makeRng(1))).toThrow();
  });

  test("throws if given more than 4 strategies", () => {
    expect(() =>
      playGame([defaultStrategy, defaultStrategy, defaultStrategy, defaultStrategy, defaultStrategy], makeRng(1))
    ).toThrow();
  });

  test("is deterministic for a fixed rng seed (identical scores across repeated runs)", () => {
    const r1 = playGame(fourDefaults(), makeRng(999));
    const r2 = playGame(fourDefaults(), makeRng(999));
    expect(r1.scores).toEqual(r2.scores);
    expect(r1.winners).toEqual(r2.winners);
    expect(r1.rounds).toBe(r2.rounds);
    expect(r1.gameOver).toBe(r2.gameOver);
  });
});

describe("simulate", () => {
  const fourDefaults = () => [defaultStrategy, defaultStrategy, defaultStrategy, defaultStrategy];

  test("returns arrays of length 4 for winRate, winRateInclTies, avgScore", () => {
    const result = simulate(fourDefaults(), 10, 1);
    expect(result.winRate).toHaveLength(4);
    expect(result.winRateInclTies).toHaveLength(4);
    expect(result.avgScore).toHaveLength(4);
  });

  test("winRate sums plus tie-rate is approximately 1", () => {
    const games = 30;
    const result = simulate(fourDefaults(), games, 5);
    const winRateSum = result.winRate.reduce((a: number, b: number) => a + b, 0);
    const tieRate = result.ties / games;
    expect(winRateSum + tieRate).toBeCloseTo(1, 5);
  });

  test("winRateInclTies is elementwise >= winRate", () => {
    const result = simulate(fourDefaults(), 30, 6);
    for (let i = 0; i < 4; i++) {
      expect(result.winRateInclTies[i]).toBeGreaterThanOrEqual(result.winRate[i]);
    }
  });

  test("is deterministic for a fixed seed", () => {
    const r1 = simulate(fourDefaults(), 15, 42);
    const r2 = simulate(fourDefaults(), 15, 42);
    expect(r1).toEqual(r2);
  });

  test("different seeds can produce different aggregate results", () => {
    // Not a hard guarantee for tiny N, but with defaultStrategy vs defaultStrategy over
    // 15 games the score distribution should not be pathologically identical across seeds.
    const r1 = simulate(fourDefaults(), 15, 1);
    const r2 = simulate(fourDefaults(), 15, 2);
    expect(r1.avgScore).not.toEqual(r2.avgScore);
  });

  test("echoes back games and seed in the result", () => {
    const result = simulate(fourDefaults(), 12, 77);
    expect(result.games).toBe(12);
    expect(result.seed).toBe(77);
  });

  test("a strategy that always no-ops on its own seat still terminates via the forced-advance guard", () => {
    const noop = () => {};
    const strategies = [noop, noop, noop, noop];
    const start = Date.now();
    const result = simulate(strategies, 3, 1);
    const elapsed = Date.now() - start;
    // Should return promptly (guard caps each game at 100000 iterations); generous bound
    // to avoid flakiness on slow CI while still catching a real hang.
    expect(elapsed).toBeLessThan(15000);
    expect(result.avgScore).toHaveLength(4);
    expect(result.winRate).toHaveLength(4);
  });

  test("mixed no-op seats (some real bots, some no-ops) still terminates", () => {
    const noop = () => {};
    const strategies = [defaultStrategy, noop, defaultStrategy, noop];
    const result = simulate(strategies, 5, 1);
    expect(result.avgScore).toHaveLength(4);
  });
});

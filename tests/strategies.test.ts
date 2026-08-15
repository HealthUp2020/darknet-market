// NIGHT MARKET — humanProxy strategy tests (public/strategies.js, ROC-192 / ROC-205).
// humanProxy(state, seat) takes exactly ONE legal turn for state.players[seat], like botPlay.
// Run: `bun test`.
import { test, expect, describe } from "bun:test";
import { humanProxy, evalPosition, smartBot, easyBot, DIFFICULTY, DIFFICULTY_ORDER } from "../public/strategies.js";
import { simulate } from "../public/sim.js";
import { botPlay } from "../public/engine.js";
import {
  TOKEN_TEMPLATE, HAND_LIMIT, PLAYER_COUNT, PLAYER_NAMES,
} from "../public/engine.js";

// Same makeState pattern as tests/engine.test.ts — fully-controlled deterministic state,
// deck stocked so refills don't trigger deck-exhaustion game-end.
function makeState(overrides: any = {}) {
  const s: any = {
    deck: Array(30).fill("leather"),
    market: [],
    players: PLAYER_NAMES.map((name, i) => ({ id: i, name, isHuman: i === 0, hand: [], camels: 0, score: 0 })),
    tokens: JSON.parse(JSON.stringify(TOKEN_TEMPLATE)),
    bonus: { 3: [1, 1, 1], 4: [4, 4, 4], 5: [8, 8, 9] },
    turnIndex: 0, round: 1, gameOver: false, log: [],
  };
  return { ...s, ...overrides };
}

describe("humanProxy — turn ownership", () => {
  test("makes no change when it's not this seat's turn", () => {
    const s = makeState({
      turnIndex: 1,
      market: ["cloth", "spice", "gold", "camel"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth", "cloth"] : [], camels: 0, score: 0,
      })),
    });
    const before = JSON.parse(JSON.stringify(s));
    humanProxy(s, 0);
    expect(s).toEqual(before);
  });

  test("always progresses: turnIndex advances (or game ends) after acting on its own turn", () => {
    const s = makeState({ market: ["cloth", "spice", "gold", "leather", "silver"] });
    humanProxy(s, 0);
    expect(s.gameOver || s.turnIndex !== 0).toBe(true);
  });
});

describe("humanProxy — selling", () => {
  test("sells a 3+ combo of a common good when available", () => {
    const s = makeState({
      market: ["silver", "silver", "gold", "leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth", "cloth", "cloth", "spice"] : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    humanProxy(s, 0);
    // All 3 cloth left the hand, sold as a lot; score increased.
    expect(s.players[0].hand.filter((c: string) => c === "cloth")).toHaveLength(0);
    expect(s.players[0].score).toBeGreaterThan(scoreBefore);
    expect(s.turnIndex).toBe(1);
  });

  test("sells a rare pair (>=2) even without hand pressure", () => {
    const s = makeState({
      market: ["leather", "leather", "cloth", "spice"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["gold", "gold", "leather"] : [], // hand length 3, well under pressure
        camels: 0, score: 0,
      })),
    });
    expect(s.players[0].hand.length).toBeLessThan(HAND_LIMIT - 1);
    const scoreBefore = s.players[0].score;
    humanProxy(s, 0);
    expect(s.players[0].hand.filter((c: string) => c === "gold")).toHaveLength(0);
    expect(s.players[0].score).toBeGreaterThan(scoreBefore);
    expect(s.turnIndex).toBe(1);
  });

  test("does NOT sell a common pair when hand is not under pressure (holds for 3+)", () => {
    const s = makeState({
      market: ["leather", "cloth", "spice", "gold"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth", "cloth", "leather"] : [], // exactly 2 of a common, len 3 < HAND_LIMIT-1=6
        camels: 0, score: 0,
      })),
    });
    const handBefore = [...s.players[0].hand];
    const scoreBefore = s.players[0].score;
    humanProxy(s, 0);
    // No sale: cloth pair still present (a sale would strip both), score unchanged.
    expect(s.players[0].hand.filter((c: string) => c === "cloth")).toHaveLength(2);
    expect(s.players[0].score).toBe(scoreBefore);
    expect(s.turnIndex).toBe(1);
  });

  test("under hand pressure (len >= HAND_LIMIT-1) sells the best legal lot even if small", () => {
    // HAND_LIMIT = 7, so pressure threshold is 6. Build a 6-card hand with a single sellable
    // common good (count 1) and nothing else sellable/rare to force the pressure-sell branch.
    const hand = ["cloth", "leather", "leather", "leather", "leather", "leather"]; // 1 cloth + 5 leather singles (not pairs really — leather all same good = 5 count)
    // To force a *small* lot (count 1) under pressure, use 6 distinct-ish goods where only
    // one type has a token pile so bigger combos aren't possible — simplify with 1 of each
    // of 6 different commons/rare (no group has 2+), leaving only a size-1 sell as "best".
    const s = makeState({
      market: ["camel", "camel", "camel"], // no rares available to buy, forces sell/skip branches
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth", "spice", "leather", "diamond", "gold", "silver"] : [],
        // diamond/gold/silver are rare and only 1 each -> can't sell (need >=2).
        // cloth/spice/leather are commons, 1 each -> sellable lot of size 1 under pressure.
        camels: 0, score: 0,
      })),
    });
    expect(s.players[0].hand.length).toBe(HAND_LIMIT - 1);
    const scoreBefore = s.players[0].score;
    humanProxy(s, 0);
    expect(s.players[0].score).toBeGreaterThan(scoreBefore);
    expect(s.turnIndex).toBe(1);
  });
});

describe("humanProxy — acquiring", () => {
  test("prefers taking a rare from market when no sell is warranted and there's room", () => {
    const s = makeState({
      market: ["gold", "leather", "spice", "camel"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth"] : [], // nothing sellable (single common, len 1 < pressure)
        camels: 0, score: 0,
      })),
    });
    humanProxy(s, 0);
    expect(s.players[0].hand).toContain("gold");
    expect(s.players[0].hand).toHaveLength(2);
    expect(s.turnIndex).toBe(1);
  });

  test("sweeps drones when >=2 available and no rares to take / no sell warranted", () => {
    const s = makeState({
      market: ["camel", "camel", "leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth"] : [],
        camels: 0, score: 0,
      })),
    });
    humanProxy(s, 0);
    expect(s.players[0].camels).toBe(2);
    expect(s.market.filter((c: string) => c === "camel")).toHaveLength(0);
    expect(s.turnIndex).toBe(1);
  });

  test("falls back to exchange when no sell/rare/drone-sweep/single-take is preferable and hand is full", () => {
    // Force hand to HAND_LIMIT so it can't take a single card, no rares/drones on market,
    // and no sellable lot (hand full of singles across many goods but under a size that's
    // sellable would trigger sale instead — pressure here means it WOULD sell if something
    // is legal). To reach exchange we need pressure-sell to also fail: use goods whose
    // token piles are empty so nothing is legally sellable.
    const s = makeState({
      market: ["cloth", "spice", "leather", "cloth", "spice", "leather", "cloth"],
      // Only empty the cloth pile (the good filling the hand) so selling it is illegal;
      // keep the other two piles above the game-end threshold (< 3 empty piles overall)
      // so this move doesn't accidentally trigger deck/pile-exhaustion game-end.
      tokens: { ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)), cloth: [] },
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? Array(HAND_LIMIT).fill("cloth") : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    humanProxy(s, 0);
    // Can't sell (cloth pile empty and it's the only good held), can't take (hand full),
    // no rares/drones on market -> exchange.
    expect(s.players[0].score).toBe(scoreBefore);
    expect(s.players[0].hand).toHaveLength(HAND_LIMIT); // exchange keeps hand size constant
    expect(s.turnIndex).toBe(1);
  });
});

describe("humanProxy — legality / state integrity", () => {
  test("never leaves negative camels or an oversized hand across a series of forced turns", () => {
    const s = makeState({
      market: ["camel", "cloth", "spice", "leather", "gold", "silver", "diamond"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: ["cloth", "spice"], camels: 0, score: 0,
      })),
    });
    for (let i = 0; i < 20 && !s.gameOver; i++) {
      const seat = s.turnIndex;
      humanProxy(s, seat);
      for (const p of s.players) {
        expect(p.camels).toBeGreaterThanOrEqual(0);
        expect(p.hand.length).toBeLessThanOrEqual(HAND_LIMIT);
      }
    }
  });

  test("a sold good actually leaves the seller's hand (count matches what engine reports sold)", () => {
    const s = makeState({
      market: ["diamond", "leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["diamond", "diamond", "diamond"] : [],
        camels: 0, score: 0,
      })),
    });
    const handLenBefore = s.players[0].hand.length;
    humanProxy(s, 0);
    // All 3 diamonds sold as a 3+ combo -> hand should have lost exactly 3 diamonds.
    expect(s.players[0].hand.filter((c: string) => c === "diamond")).toHaveLength(0);
    expect(s.players[0].hand.length).toBe(handLenBefore - 3);
  });
});

describe("humanProxy — terminates inside a full simulated game", () => {
  test("a game with humanProxy in one seat and botPlay elsewhere finishes for a small N", () => {
    const strategies = [humanProxy, botPlay, botPlay, botPlay];
    const start = Date.now();
    const result = simulate(strategies, 15, 1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15000);
    expect(result.avgScore).toHaveLength(PLAYER_COUNT);
    expect(result.winRate).toHaveLength(PLAYER_COUNT);
  });

  test("humanProxy in every seat also finishes without hanging", () => {
    const strategies = [humanProxy, humanProxy, humanProxy, humanProxy];
    const result = simulate(strategies, 5, 2);
    expect(result.avgScore).toHaveLength(PLAYER_COUNT);
  });
});

// ---- evalPosition (ROC-192 / ROC-206) --------------------------------------------------
describe("evalPosition — banked score", () => {
  test("banked score is counted 1:1 — two states differing only in player.score differ by exactly that", () => {
    const base = makeState({
      market: ["leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: [], camels: 0, score: 10,
      })),
    });
    const raised = JSON.parse(JSON.stringify(base));
    raised.players[0].score = 15;
    expect(evalPosition(raised, 0) - evalPosition(base, 0)).toBeCloseTo(5, 6);
  });

  test("monotonic in banked score: adding CR never lowers the value", () => {
    const s = makeState({
      market: [],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: ["diamond", "cloth", "cloth"], camels: 3, score: 7,
      })),
    });
    const before = evalPosition(s, 0);
    s.players[0].score += 1;
    const after = evalPosition(s, 0);
    expect(after).toBeGreaterThan(before);
  });
});

describe("evalPosition — held goods add discounted potential", () => {
  test("a hand with a good whose pile has value beats an otherwise-identical empty hand", () => {
    const withGood = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth"] : [], camels: 0, score: 0,
      })),
    });
    const empty = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: [], camels: 0, score: 0,
      })),
    });
    expect(evalPosition(withGood, 0)).toBeGreaterThan(evalPosition(empty, 0));
    // cloth pile top is 5 -> discounted contribution should be exactly 5 * 0.55 (no pair bonus at n=1).
    expect(evalPosition(withGood, 0) - evalPosition(empty, 0)).toBeCloseTo(5 * 0.55, 6);
  });

  test("a 3+ combo in hand adds the combo bonus on top of the discounted sale value", () => {
    const twoCloth = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth", "cloth"] : [], camels: 0, score: 0,
      })),
    });
    const threeCloth = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth", "cloth", "cloth"] : [], camels: 0, score: 0,
      })),
    });
    // pile = [5,5,3,...]; two -> sellNow=10, +1 (pair, non-rare); three -> sellNow=13, +4 (combo).
    expect(evalPosition(threeCloth, 0)).toBeGreaterThan(evalPosition(twoCloth, 0));
  });

  test("a rare pair scores its own bonus bracket distinct from a common pair", () => {
    const commonPair = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth", "cloth"] : [], camels: 0, score: 0,
      })),
    });
    const rarePair = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["gold", "gold"] : [], camels: 0, score: 0,
      })),
    });
    // cloth pair: sellNow=10*0.55=5.5, +1 pair bonus => 6.5
    // gold pair: sellNow=12*0.55=6.6, +2.5 rare-pair bonus => 9.1
    expect(evalPosition(commonPair, 0)).toBeCloseTo(6.5, 6);
    expect(evalPosition(rarePair, 0)).toBeCloseTo(9.1, 6);
    expect(evalPosition(rarePair, 0)).toBeGreaterThan(evalPosition(commonPair, 0));
  });
});

describe("evalPosition — fleet value", () => {
  test("strictly leading the fleet adds more than being tied", () => {
    const leading = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: [], camels: i === 0 ? 4 : 2, score: 0,
      })),
    });
    const tied = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: [], camels: 2, score: 0,
      })),
    });
    // leading: 0.6*4 + 3 = 5.4 ; tied: 0.6*2 + 1 = 2.2
    expect(evalPosition(leading, 0)).toBeCloseTo(5.4, 6);
    expect(evalPosition(tied, 0)).toBeCloseTo(2.2, 6);
    expect(evalPosition(leading, 0)).toBeGreaterThan(evalPosition(tied, 0));
  });

  test("being behind the fleet leader gets no fleet-lead bonus", () => {
    const behind = makeState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: [], camels: i === 0 ? 1 : 5, score: 0,
      })),
    });
    // 0.6*1 + 0 (no lead, no tie) = 0.6
    expect(evalPosition(behind, 0)).toBeCloseTo(0.6, 6);
  });
});

// ---- smartBot (ROC-192 / ROC-206) ------------------------------------------------------
describe("smartBot — turn ownership", () => {
  test("makes no change when it's not this seat's turn", () => {
    const s = makeState({
      turnIndex: 1,
      market: ["cloth", "spice", "gold", "camel"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth", "cloth"] : [], camels: 0, score: 0,
      })),
    });
    const before = JSON.parse(JSON.stringify(s));
    smartBot(s, 0);
    expect(s).toEqual(before);
  });

  test("always progresses: turnIndex advances (or game ends) after acting on its own turn", () => {
    const s = makeState({ market: ["cloth", "spice", "gold", "leather", "silver"] });
    smartBot(s, 0);
    expect(s.gameOver || s.turnIndex !== 0).toBe(true);
  });
});

describe("smartBot — legality / state integrity", () => {
  test("never leaves negative camels or an oversized hand across a series of forced turns", () => {
    const s = makeState({
      market: ["camel", "cloth", "spice", "leather", "gold", "silver", "diamond"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: ["cloth", "spice"], camels: 0, score: 0,
      })),
    });
    for (let i = 0; i < 20 && !s.gameOver; i++) {
      const seat = s.turnIndex;
      smartBot(s, seat);
      for (const p of s.players) {
        expect(p.camels).toBeGreaterThanOrEqual(0);
        expect(p.hand.length).toBeLessThanOrEqual(HAND_LIMIT);
      }
    }
  });

  test("a sold good actually leaves the seller's hand when smartBot chooses to sell", () => {
    const s = makeState({
      market: ["leather"], // dull; nothing worth taking over selling
      tokens: { ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)), diamond: [7, 7, 7, 7, 7, 7, 7] },
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["diamond", "diamond", "diamond"] : [],
        camels: 0, score: 0,
      })),
    });
    const handLenBefore = s.players[0].hand.length;
    smartBot(s, 0);
    // All 3 diamonds sold as a combo -> hand should have lost exactly 3 diamonds.
    expect(s.players[0].hand.filter((c: string) => c === "diamond")).toHaveLength(0);
    expect(s.players[0].hand.length).toBe(handLenBefore - 3);
    expect(s.players[0].score).toBeGreaterThan(0);
  });
});

describe("smartBot — 1-ply lookahead picks the best legal move", () => {
  test("sells a richly-stocked common combo instead of taking a low-value card", () => {
    const s = makeState({
      market: ["leather"], // the only take available is dull
      tokens: {
        ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)),
        cloth: [5, 5, 5, 5, 5, 5, 5, 5], // richly stocked, top-3 worth 15 + combo bonus
        leather: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // dull, low value
      },
      bonus: { 3: [1, 1, 1], 4: [4, 4, 4], 5: [8, 8, 9] },
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth", "cloth", "cloth", "leather"] : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    smartBot(s, 0);
    expect(s.players[0].hand.filter((c: string) => c === "cloth")).toHaveLength(0);
    expect(s.players[0].score).toBe(scoreBefore + 15 + 1); // sale value + 3-combo bonus token
    expect(s.turnIndex).toBe(1);
  });

  test("prefers selling a huge combo over a marginal take when both are legal", () => {
    // No rares on the market (a rare take's rarity+discount weighting can outweigh a modest
    // sale) — keep the take option dull so selling the combo is unambiguously best.
    const s = makeState({
      market: ["leather"],
      tokens: {
        ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)),
        spice: [5, 5, 5, 5, 5, 5, 5, 5],
      },
      bonus: { 3: [1, 1, 1], 4: [4, 4, 4], 5: [8, 8, 9] },
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["spice", "spice", "spice"] : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    const handLenBefore = s.players[0].hand.length;
    smartBot(s, 0);
    // Selling the combo (score jumps) beats taking a single card into hand (score unchanged).
    expect(s.players[0].score).toBeGreaterThan(scoreBefore);
    expect(s.players[0].hand.length).toBeLessThan(handLenBefore);
  });
});

describe("smartBot — terminates inside a full simulated game", () => {
  test("a small run with smartBot in one seat and botPlay elsewhere finishes quickly", () => {
    const strategies = [smartBot, botPlay, botPlay, botPlay];
    const start = Date.now();
    const result = simulate(strategies, 3, 1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(30000);
    expect(result.avgScore).toHaveLength(PLAYER_COUNT);
    expect(result.winRate).toHaveLength(PLAYER_COUNT);
  });

  test("smartBot in every seat also finishes without hanging (tiny N — lookahead is slower)", () => {
    const strategies = [smartBot, smartBot, smartBot, smartBot];
    const result = simulate(strategies, 2, 2);
    expect(result.avgScore).toHaveLength(PLAYER_COUNT);
  });
});

// ---- easyBot + DIFFICULTY tier registry (ROC-192 / ROC-208) ---------------------------
describe("easyBot — turn ownership", () => {
  test("makes no change when it's not this seat's turn", () => {
    const s = makeState({
      turnIndex: 1,
      market: ["cloth", "spice", "gold", "camel"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: i === 0 ? ["cloth", "cloth", "cloth"] : [], camels: 0, score: 0,
      })),
    });
    const before = JSON.parse(JSON.stringify(s));
    easyBot(s, 0);
    expect(s).toEqual(before);
  });

  test("always progresses: turnIndex advances (or game ends) after acting on its own turn", () => {
    const s = makeState({ market: ["cloth", "spice", "gold", "leather", "silver"] });
    easyBot(s, 0);
    expect(s.gameOver || s.turnIndex !== 0).toBe(true);
  });
});

describe("easyBot — legality / state integrity", () => {
  test("never leaves negative camels or an oversized hand across a series of forced turns", () => {
    const s = makeState({
      market: ["camel", "cloth", "spice", "leather", "gold", "silver", "diamond"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: ["cloth", "spice"], camels: 0, score: 0,
      })),
    });
    for (let i = 0; i < 20 && !s.gameOver; i++) {
      const seat = s.turnIndex;
      easyBot(s, seat);
      for (const p of s.players) {
        expect(p.camels).toBeGreaterThanOrEqual(0);
        expect(p.hand.length).toBeLessThanOrEqual(HAND_LIMIT);
      }
    }
  });

  test("a sold good actually leaves the seller's hand (count matches the minimum sold)", () => {
    const s = makeState({
      market: ["leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["diamond", "diamond", "diamond"] : [],
        camels: 0, score: 0,
      })),
    });
    const handLenBefore = s.players[0].hand.length;
    easyBot(s, 0);
    // diamond is rare -> min sell count is 2, NOT the full 3 held (reckless minimum-sell).
    expect(s.players[0].hand.filter((c: string) => c === "diamond")).toHaveLength(1);
    expect(s.players[0].hand.length).toBe(handLenBefore - 2);
    expect(s.players[0].score).toBeGreaterThan(0);
  });
});

describe("easyBot — reckless minimum-count selling (does NOT hold for a combo)", () => {
  test("sells a common at its minimum (1), leaving the rest in hand, when it's the first sellable good", () => {
    // cloth (index 3 in GOODS) has 3 in hand and a stocked pile; nothing earlier in GOODS
    // order (diamond, gold, silver) is present/sellable.
    const s = makeState({
      market: ["leather", "spice"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth", "cloth", "cloth"] : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    easyBot(s, 0);
    // Only 1 cloth sold (the common minimum) — 2 remain, unlike humanProxy which would hold
    // for the full 3-combo bonus.
    expect(s.players[0].hand.filter((c: string) => c === "cloth")).toHaveLength(2);
    expect(s.players[0].score).toBeGreaterThan(scoreBefore);
    expect(s.turnIndex).toBe(1);
  });

  test("sells a rare pair at its minimum (2) when it's the first sellable good", () => {
    // gold (index 1 in GOODS) has 2 in hand and a stocked pile; diamond (earlier in order)
    // is absent from the hand entirely, so gold is the first sellable good.
    const s = makeState({
      market: ["leather", "spice"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["gold", "gold"] : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    easyBot(s, 0);
    expect(s.players[0].hand.filter((c: string) => c === "gold")).toHaveLength(0);
    expect(s.players[0].score).toBeGreaterThan(scoreBefore);
    expect(s.turnIndex).toBe(1);
  });

  test("skips an earlier-in-order good whose pile is empty and sells the next sellable good instead", () => {
    // diamond (index 0) is present but its pile is empty -> illegal to sell; cloth (index 3)
    // is present, stocked, and should be chosen as the first *sellable* good.
    const s = makeState({
      market: ["leather"],
      tokens: { ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)), diamond: [] },
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["diamond", "diamond", "cloth", "cloth"] : [],
        camels: 0, score: 0,
      })),
    });
    easyBot(s, 0);
    expect(s.players[0].hand.filter((c: string) => c === "diamond")).toHaveLength(2); // untouched
    expect(s.players[0].hand.filter((c: string) => c === "cloth")).toHaveLength(1); // 1 of 2 sold
  });
});

describe("easyBot — acquiring / fallback branches", () => {
  test("takes the first non-drone market card when nothing is sellable and hand has room", () => {
    const s = makeState({
      market: ["camel", "gold", "leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? ["cloth"] : [], // 1 cloth, not enough to sell (min 1... but pile check)
        camels: 0, score: 0,
      })),
      tokens: { ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)), cloth: [] }, // force cloth unsellable
    });
    easyBot(s, 0);
    // Takes market[1] = "gold" (first non-camel card), not the drone at index 0.
    expect(s.players[0].hand).toContain("gold");
    expect(s.players[0].hand).toHaveLength(2);
    expect(s.turnIndex).toBe(1);
  });

  test("sweeps drones when nothing sellable and hand is full", () => {
    const s = makeState({
      market: ["camel", "camel", "leather"],
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? Array(HAND_LIMIT).fill("leather") : [],
        camels: 0, score: 0,
      })),
      tokens: { ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)), leather: [] }, // unsellable
    });
    easyBot(s, 0);
    expect(s.players[0].camels).toBe(2);
    expect(s.turnIndex).toBe(1);
  });

  test("falls back to a 2-for-2 exchange when nothing else is legal", () => {
    const s = makeState({
      market: ["cloth", "spice", "cloth", "spice", "cloth", "spice", "cloth"],
      tokens: { ...JSON.parse(JSON.stringify(TOKEN_TEMPLATE)), cloth: [] },
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0,
        hand: i === 0 ? Array(HAND_LIMIT).fill("cloth") : [],
        camels: 0, score: 0,
      })),
    });
    const scoreBefore = s.players[0].score;
    easyBot(s, 0);
    expect(s.players[0].score).toBe(scoreBefore);
    expect(s.players[0].hand).toHaveLength(HAND_LIMIT); // exchange preserves hand size
    expect(s.turnIndex).toBe(1);
  });
});

describe("easyBot — terminates inside a full simulated game", () => {
  test("a small run with easyBot in one seat and botPlay elsewhere finishes quickly", () => {
    const strategies = [easyBot, botPlay, botPlay, botPlay];
    const result = simulate(strategies, 15, 1);
    expect(result.avgScore).toHaveLength(PLAYER_COUNT);
    expect(result.winRate).toHaveLength(PLAYER_COUNT);
  });

  test("easyBot in every seat also finishes without hanging", () => {
    const strategies = [easyBot, easyBot, easyBot, easyBot];
    const result = simulate(strategies, 5, 2);
    expect(result.avgScore).toHaveLength(PLAYER_COUNT);
  });
});

describe("DIFFICULTY tier registry", () => {
  test("has exactly the keys easy/normal/hard, each mapped to a function", () => {
    expect(Object.keys(DIFFICULTY).sort()).toEqual(["easy", "hard", "normal"]);
    expect(typeof DIFFICULTY.easy).toBe("function");
    expect(typeof DIFFICULTY.normal).toBe("function");
    expect(typeof DIFFICULTY.hard).toBe("function");
  });

  test("normal is exactly the engine's botPlay; easy is easyBot; hard is smartBot", () => {
    expect(DIFFICULTY.normal).toBe(botPlay);
    expect(DIFFICULTY.easy).toBe(easyBot);
    expect(DIFFICULTY.hard).toBe(smartBot);
  });

  test("DIFFICULTY_ORDER is exactly [easy, normal, hard]", () => {
    expect(DIFFICULTY_ORDER).toEqual(["easy", "normal", "hard"]);
  });

  test("each tier runs a tiny simulated match without hanging", () => {
    for (const key of DIFFICULTY_ORDER) {
      const bot = (DIFFICULTY as any)[key];
      const strategies = [bot, bot, bot, bot];
      const n = key === "hard" ? 3 : 5;
      const result = simulate(strategies, n, 7);
      expect(result.avgScore).toHaveLength(PLAYER_COUNT);
    }
  });
});

describe("DIFFICULTY ladder sanity — hard beats easy more than the reverse", () => {
  test("hard challenger vs 3 easy opponents wins clearly more than easy challenger vs 3 hard opponents", () => {
    const N = 60; // smartBot's lookahead is slow; keep this modest but decisive enough
    const hardVsEasy = simulate([smartBot, easyBot, easyBot, easyBot], N, 100);
    const easyVsHard = simulate([easyBot, smartBot, smartBot, smartBot], N, 200);
    // seat 0 win rate in each run is the challenger's win rate.
    expect(hardVsEasy.winRate[0] - easyVsHard.winRate[0]).toBeGreaterThan(0.1);
  });
});

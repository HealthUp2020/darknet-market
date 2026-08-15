// NIGHT MARKET — additional independent coverage for the rules engine.
// Focus: exchange w/ camels, hand-limit boundaries, sell-vs-pile-size edges,
// bonus-tier selection, turn rotation/round wrap, bot "no legal move" skip,
// and checkGameEnd threshold (2 vs 3 empty piles).
import { test, expect, describe } from "bun:test";
import {
  takeCard, sellCards, exchangeCards, botPlay, checkGameEnd,
  TOKEN_TEMPLATE, HAND_LIMIT, PLAYER_COUNT, PLAYER_NAMES,
} from "../public/engine.js";

// Same deterministic-state pattern as tests/engine.test.ts.
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

describe("exchangeCards — camels", () => {
  test("giving camels returns them to the market and decrements the fleet", () => {
    const s = makeState({ market: ["gold", "silver"] });
    s.players[0].hand = ["cloth"];
    s.players[0].camels = 1;
    // give 1 hand card + 1 camel for 2 market cards
    const r = exchangeCards(s, 0, { handIdxs: [0], camels: 1 }, [0, 1]);
    expect(r.ok).toBe(true);
    expect(s.players[0].camels).toBe(0);
    expect(s.players[0].hand.sort()).toEqual(["gold", "silver"]);
    expect(s.market).toContain("camel");
    expect(s.market).toContain("cloth");
    expect(s.market).toHaveLength(2); // the two given cards replace the two taken
  });

  test("giving only camels (no hand cards) is legal if total >= 2", () => {
    const s = makeState({ market: ["gold", "silver"] });
    s.players[0].hand = [];
    s.players[0].camels = 2;
    const r = exchangeCards(s, 0, { handIdxs: [], camels: 2 }, [0, 1]);
    expect(r.ok).toBe(true);
    expect(s.players[0].camels).toBe(0);
    expect(s.market.filter((c: string) => c === "camel")).toHaveLength(2);
    expect(s.players[0].hand.sort()).toEqual(["gold", "silver"]);
  });

  test("cannot give more camels than the player owns (rejected — fleet never goes negative)", () => {
    // Guard added after the independent tester flagged that the engine would
    // otherwise let the fleet count go negative.
    const s = makeState({ market: ["gold", "silver"] });
    s.players[0].hand = [];
    s.players[0].camels = 0;
    const r = exchangeCards(s, 0, { handIdxs: [], camels: 2 }, [0, 1]);
    expect(r.ok).toBe(false);
    expect(s.players[0].camels).toBe(0);   // untouched
    expect(s.turnIndex).toBe(0);           // illegal move doesn't consume the turn
  });
});

describe("exchangeCards — hand-limit boundary", () => {
  test("giving 0 hand cards for 2 market cards is rejected on the give/take count mismatch", () => {
    const s = makeState({ market: ["gold", "silver"] });
    s.players[0].hand = Array(HAND_LIMIT - 2).fill("leather"); // 5 cards
    const r = exchangeCards(s, 0, { handIdxs: [], camels: 0 }, [0, 1]);
    expect(r.ok).toBe(false); // totalGive (0) != marketIdxs.length (2)
  });

  test("exchange landing exactly at HAND_LIMIT succeeds (camels-only give)", () => {
    const s = makeState({ market: ["gold", "silver"] });
    s.players[0].hand = Array(HAND_LIMIT - 2).fill("leather"); // 5 cards
    s.players[0].camels = 2;
    const r = exchangeCards(s, 0, { handIdxs: [], camels: 2 }, [0, 1]); // 5 - 0 + 2 = 7
    expect(r.ok).toBe(true);
    expect(s.players[0].hand).toHaveLength(HAND_LIMIT); // exactly at the limit, allowed
  });

  test("exchange that would exceed HAND_LIMIT by 1 is rejected", () => {
    const s = makeState({ market: ["gold", "silver"] });
    s.players[0].hand = Array(HAND_LIMIT - 1).fill("leather"); // 6 cards
    s.players[0].camels = 2;
    const r = exchangeCards(s, 0, { handIdxs: [], camels: 2 }, [0, 1]); // 6 - 0 + 2 = 8 > 7
    expect(r.ok).toBe(false);
    expect(s.players[0].hand).toHaveLength(6); // untouched
    expect(s.players[0].camels).toBe(2); // untouched
  });
});

describe("sellCards — pile-size edges", () => {
  test("selling exactly the pile size empties it and banks all values", () => {
    const s = makeState();
    s.players[0].hand = ["cloth", "cloth"];
    s.tokens.cloth = [5, 3];
    const r = sellCards(s, 0, "cloth", 2);
    expect(r.ok).toBe(true);
    expect(s.tokens.cloth).toEqual([]);
    expect(s.players[0].score).toBe(8);
  });

  test("selling more cards than the pile has tokens for only banks what's available", () => {
    const s = makeState();
    s.players[0].hand = ["cloth", "cloth", "cloth"];
    s.tokens.cloth = [5, 3]; // only 2 tokens left
    const r = sellCards(s, 0, "cloth", 3);
    expect(r.ok).toBe(true); // count(3) <= owned(3), and pile non-empty, so allowed
    expect(s.players[0].hand).toEqual([]); // all 3 cards leave the hand
    expect(s.tokens.cloth).toEqual([]); // pile fully drained
    expect(s.players[0].score).toBe(8 + 1); // 5+3 goods value + bonus[3] (1) — all 3 tokens "spent" but only 2 existed
  });
});

describe("sellCards — bonus-tier selection", () => {
  test("selling exactly 3 draws from bonus[3]", () => {
    const s = makeState();
    s.players[0].hand = ["spice", "spice", "spice"];
    s.tokens.spice = [5, 5, 5];
    s.bonus = { 3: [7], 4: [99], 5: [999] };
    sellCards(s, 0, "spice", 3);
    expect(s.players[0].score).toBe(15 + 7);
    expect(s.bonus[3]).toEqual([]);
    expect(s.bonus[4]).toEqual([99]); // untouched
  });

  test("selling exactly 4 draws from bonus[4]", () => {
    const s = makeState();
    s.players[0].hand = ["leather", "leather", "leather", "leather"];
    s.tokens.leather = [4, 4, 3, 3];
    s.bonus = { 3: [1], 4: [7], 5: [999] };
    sellCards(s, 0, "leather", 4);
    expect(s.players[0].score).toBe(14 + 7);
    expect(s.bonus[4]).toEqual([]);
    expect(s.bonus[3]).toEqual([1]); // untouched
  });

  test("selling 5 draws from bonus[5]; selling 6 also draws from bonus[5] (5+ tier)", () => {
    const s = makeState();
    s.players[0].hand = Array(5).fill("leather");
    s.tokens.leather = [4, 4, 3, 3, 2];
    s.bonus = { 3: [1], 4: [1], 5: [10, 20] };
    sellCards(s, 0, "leather", 5);
    expect(s.players[0].score).toBe(16 + 10);
    expect(s.bonus[5]).toEqual([20]); // one token consumed, top of pile now 20

    const s2 = makeState();
    s2.players[0].hand = Array(6).fill("leather");
    s2.tokens.leather = [4, 4, 3, 3, 2, 1];
    s2.bonus = { 3: [1], 4: [1], 5: [30] };
    sellCards(s2, 0, "leather", 6);
    expect(s2.players[0].score).toBe(17 + 30);
  });

  test("bonus pile empty for the matched tier awards no bonus, no crash", () => {
    const s = makeState();
    s.players[0].hand = ["spice", "spice", "spice"];
    s.tokens.spice = [5, 5, 5];
    s.bonus = { 3: [], 4: [1], 5: [1] };
    const r = sellCards(s, 0, "spice", 3);
    expect(r.ok).toBe(true);
    expect(s.players[0].score).toBe(15); // no bonus added
  });

  test("selling 2 (below bonus threshold) awards no bonus even if bonus[3] is available", () => {
    const s = makeState();
    s.players[0].hand = ["spice", "spice"];
    s.tokens.spice = [5, 5];
    s.bonus = { 3: [7], 4: [1], 5: [1] };
    sellCards(s, 0, "spice", 2);
    expect(s.players[0].score).toBe(10);
    expect(s.bonus[3]).toEqual([7]); // untouched
  });
});

describe("token pile order (descending — top is best)", () => {
  test("selling 1 of a common good takes the first (highest) value in the pile array", () => {
    const s = makeState();
    s.players[0].hand = ["cloth"];
    s.tokens.cloth = [9, 1, 1]; // deliberately out of natural template order
    sellCards(s, 0, "cloth", 1);
    expect(s.players[0].score).toBe(9);
    expect(s.tokens.cloth).toEqual([1, 1]);
  });

  test("TOKEN_TEMPLATE values are non-increasing (top of each pile is highest)", () => {
    for (const good of Object.keys(TOKEN_TEMPLATE)) {
      const pile = TOKEN_TEMPLATE[good];
      for (let i = 1; i < pile.length; i++) expect(pile[i]).toBeLessThanOrEqual(pile[i - 1]);
    }
  });
});

describe("turn rotation and round wrap", () => {
  test("turn advances sequentially through all 4 players without touching round", () => {
    const s = makeState({ market: ["gold", "silver", "cloth", "spice", "leather", "gold", "silver"] });
    expect(s.turnIndex).toBe(0);
    expect(s.round).toBe(1);
    takeCard(s, 0, 0);
    expect(s.turnIndex).toBe(1);
    expect(s.round).toBe(1);
    takeCard(s, 1, 0);
    expect(s.turnIndex).toBe(2);
    expect(s.round).toBe(1);
    takeCard(s, 2, 0);
    expect(s.turnIndex).toBe(3);
    expect(s.round).toBe(1);
  });

  test("wrapping from the last player (index 3) back to 0 increments round", () => {
    const s = makeState({ market: ["gold"], turnIndex: PLAYER_COUNT - 1, round: 5 });
    takeCard(s, PLAYER_COUNT - 1, 0);
    expect(s.turnIndex).toBe(0);
    expect(s.round).toBe(6);
  });
});

describe("checkGameEnd threshold", () => {
  test("exactly 2 empty piles does not end the game", () => {
    const s = makeState();
    s.tokens.diamond = []; s.tokens.gold = [];
    checkGameEnd(s);
    expect(s.gameOver).toBe(false);
  });

  test("exactly 3 empty piles ends the game", () => {
    const s = makeState();
    s.tokens.diamond = []; s.tokens.gold = []; s.tokens.silver = [];
    checkGameEnd(s);
    expect(s.gameOver).toBe(true);
  });

  test("empty deck alone (with fewer than 3 empty piles) ends the game", () => {
    const s = makeState({ deck: [] });
    checkGameEnd(s);
    expect(s.gameOver).toBe(true);
  });
});

describe("bot AI — no legal move skips", () => {
  test("bot with a full hand, no sellable pile, <2 non-camel market cards, and no camels skips its turn", () => {
    const s = makeState({
      turnIndex: 0,
      market: ["diamond"], // only 1 non-camel card, no camels present
    });
    s.players[0].hand = Array(HAND_LIMIT).fill("diamond"); // full hand
    s.tokens.diamond = []; // can't sell diamonds — pile empty
    const before = s.log.length;
    botPlay(s, 0);
    expect(s.turnIndex).toBe(1); // advanced via the skip branch, not a real action
    expect(s.round).toBe(1);
    expect(s.players[0].hand).toHaveLength(HAND_LIMIT); // hand untouched
    expect(s.log[s.log.length - 1]).toContain("no legal move");
    expect(s.log.length).toBe(before + 1);
  });

  test("bot skip at the last seat also increments the round", () => {
    const s = makeState({
      turnIndex: PLAYER_COUNT - 1,
      round: 2,
      market: ["diamond"],
    });
    s.players[PLAYER_COUNT - 1].hand = Array(HAND_LIMIT).fill("diamond");
    s.tokens.diamond = [];
    botPlay(s, PLAYER_COUNT - 1);
    expect(s.turnIndex).toBe(0);
    expect(s.round).toBe(3);
  });
});

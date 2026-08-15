// NIGHT MARKET — rules engine tests.
// Practice: every engine feature/fix lands with a test here. Run: `bun test`.
import { test, expect, describe } from "bun:test";
import {
  newGame, takeCard, takeCamels, sellCards, exchangeCards, botPlay,
  buildDeck, goodsInHand, finishGame,
  GOODS, RARE, DECK_COUNTS, TOKEN_TEMPLATE, HAND_LIMIT, MARKET_SIZE,
  CAMEL_BONUS, PLAYER_COUNT, PLAYER_NAMES,
} from "../public/engine.js";

// A blank, fully-controlled state — no RNG — so behaviour is deterministic.
// Deck is stocked by default so refills don't accidentally trigger deck-exhaustion
// game-end; tests that want the end-game override `deck`/`tokens` explicitly.
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

describe("setup", () => {
  test("buildDeck has the exact card multiset", () => {
    const deck = buildDeck();
    expect(deck.length).toBe(Object.values(DECK_COUNTS).reduce((a, b) => a + b, 0)); // 92
    const counts = goodsInHand(deck);
    for (const [good, n] of Object.entries(DECK_COUNTS)) expect(counts[good]).toBe(n);
  });

  test("newGame deals 5 to each of 4 players and fills the market", () => {
    const s = newGame();
    expect(s.players).toHaveLength(PLAYER_COUNT);
    // Deal draws until 5 non-drone cards are in hand; any drones drawn are extra fleet.
    for (const p of s.players) expect(p.hand).toHaveLength(5);
    expect(s.market).toHaveLength(MARKET_SIZE);
    expect(s.turnIndex).toBe(0);
    expect(s.gameOver).toBe(false);
  });
});

describe("takeCard", () => {
  test("moves a market card to hand, refills market, advances turn", () => {
    const s = makeState({ market: ["cloth", "spice", "gold"], deck: ["leather", "leather", "silver"] });
    const r = takeCard(s, 0, 0);
    expect(r.ok).toBe(true);
    expect(s.players[0].hand).toEqual(["cloth"]);
    expect(s.market).toHaveLength(3);          // spliced one, refilled one
    expect(s.market).toContain("silver");      // refill came off the deck
    expect(s.turnIndex).toBe(1);
  });

  test("rejects taking a drone via takeCard", () => {
    const s = makeState({ market: ["camel"] });
    const r = takeCard(s, 0, 0);
    expect(r.ok).toBe(false);
    expect(s.turnIndex).toBe(0);               // turn not consumed on illegal move
  });

  test("rejects when hand is full", () => {
    const s = makeState({ market: ["cloth"], players: PLAYER_NAMES.map((name, i) => ({ id: i, name, isHuman: i === 0, hand: Array(HAND_LIMIT).fill("spice"), camels: 0, score: 0 })) });
    const r = takeCard(s, 0, 0);
    expect(r.ok).toBe(false);
  });
});

describe("takeCamels", () => {
  test("sweeps every drone into the fleet and refills", () => {
    const s = makeState({ market: ["camel", "cloth", "camel"] }); // stocked default deck
    const r = takeCamels(s, 0);
    expect(r.ok).toBe(true);
    expect(s.players[0].camels).toBe(2);
    expect(s.market.filter((c: string) => c === "camel")).toHaveLength(0);
    expect(s.market).toHaveLength(3);          // cloth + 2 refills
    expect(s.turnIndex).toBe(1);
  });

  test("rejects when no drones present", () => {
    const s = makeState({ market: ["cloth"] });
    expect(takeCamels(s, 0).ok).toBe(false);
  });
});

describe("sellCards", () => {
  test("commons: sells and banks the top token values", () => {
    const s = makeState();
    s.players[0].hand = ["cloth", "cloth"];
    s.tokens.cloth = [5, 5, 3];                 // top two are 5 + 5
    const r = sellCards(s, 0, "cloth", 2);
    expect(r.ok).toBe(true);
    expect(s.players[0].score).toBe(10);
    expect(s.tokens.cloth).toEqual([3]);
    expect(s.players[0].hand).toEqual([]);
  });

  test("rare goods cannot be sold as a single card", () => {
    const s = makeState();
    s.players[0].hand = ["gold"];
    const r = sellCards(s, 0, "gold", 1);
    expect(r.ok).toBe(false);
    expect(s.players[0].score).toBe(0);
  });

  test("selling 3+ awards a bonus token on top of the goods value", () => {
    const s = makeState();
    s.players[0].hand = ["spice", "spice", "spice"];
    s.tokens.spice = [5, 5, 3];
    s.bonus[3] = [2];                           // deterministic bonus
    const r = sellCards(s, 0, "spice", 3);
    expect(r.ok).toBe(true);
    expect(s.players[0].score).toBe(13 + 2);    // 5+5+3 goods + 2 bonus
  });

  test("cannot sell more than owned, and cannot sell from an empty pile", () => {
    const s = makeState();
    s.players[0].hand = ["cloth"];
    expect(sellCards(s, 0, "cloth", 2).ok).toBe(false);
    s.players[0].hand = ["cloth", "cloth"];
    s.tokens.cloth = [];
    expect(sellCards(s, 0, "cloth", 2).ok).toBe(false);
  });

  test("records lastSale for the price-wall animation", () => {
    const s = makeState();
    s.players[0].hand = ["cloth", "cloth"];
    s.tokens.cloth = [5, 5];
    sellCards(s, 0, "cloth", 2);
    expect(s.lastSale).toEqual({ playerIdx: 0, good: "cloth", values: [5, 5] });
  });
});

describe("exchangeCards", () => {
  test("swaps N hand cards for N market cards", () => {
    const s = makeState({ market: ["gold", "silver", "cloth"] });
    s.players[0].hand = ["leather", "leather"];
    const r = exchangeCards(s, 0, { handIdxs: [0, 1], camels: 0 }, [0, 1]);
    expect(r.ok).toBe(true);
    expect(s.players[0].hand.sort()).toEqual(["gold", "silver"]);
    expect(s.market).toContain("leather");
    expect(s.turnIndex).toBe(1);
  });

  test("rejects an exchange that would take a drone", () => {
    const s = makeState({ market: ["camel", "gold"] });
    s.players[0].hand = ["cloth", "cloth"];
    expect(exchangeCards(s, 0, { handIdxs: [0, 1], camels: 0 }, [0, 1]).ok).toBe(false);
  });

  test("rejects fewer than 2 in an exchange", () => {
    const s = makeState({ market: ["gold"] });
    s.players[0].hand = ["cloth"];
    expect(exchangeCards(s, 0, { handIdxs: [0], camels: 0 }, [0]).ok).toBe(false);
  });
});

describe("game end", () => {
  test("three empty token piles ends the match", () => {
    const s = makeState({ market: ["cloth"], deck: ["gold"] });
    s.tokens.diamond = []; s.tokens.gold = []; s.tokens.silver = [];
    s.players[0].hand = ["cloth", "cloth"];
    s.tokens.cloth = [5, 5];
    sellCards(s, 0, "cloth", 2);                // triggers checkGameEnd
    expect(s.gameOver).toBe(true);
  });

  test("largest unique fleet earns the fixer-reputation bonus", () => {
    const s = makeState();
    s.players[0].camels = 4; s.players[1].camels = 2;
    finishGame(s);
    expect(s.players[0].score).toBe(CAMEL_BONUS);
  });

  test("tied largest fleet earns no bonus", () => {
    const s = makeState();
    s.players[0].camels = 3; s.players[1].camels = 3;
    finishGame(s);
    expect(s.players[0].score).toBe(0);
    expect(s.players[1].score).toBe(0);
  });
});

describe("bot AI", () => {
  test("bot only acts on its own turn", () => {
    const s = makeState({ turnIndex: 1 });
    const before = JSON.stringify(s);
    botPlay(s, 0);                              // not player 0's turn
    expect(JSON.stringify(s)).toBe(before);
  });

  test("bot takes a full legal turn and passes the baton", () => {
    const s = newGame();
    s.turnIndex = 1;
    botPlay(s, 1);
    expect(s.turnIndex).not.toBe(1);           // it did something and advanced
  });

  test("bot prefers the bonus sell when it holds three of a good", () => {
    const s = makeState({ turnIndex: 1 });
    s.players[1].hand = ["spice", "spice", "spice"];
    s.tokens.spice = [5, 5, 3];
    botPlay(s, 1);
    expect(s.players[1].hand).toEqual([]);     // sold all three
    expect(s.players[1].score).toBeGreaterThanOrEqual(13);
  });
});

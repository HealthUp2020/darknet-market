import { describe, test, expect } from "bun:test";
import {
  newGame, finishGame, nextRound,
  MATCH_ROUNDS, SEALS_TO_WIN, PLAYER_COUNT, PLAYER_NAMES,
  TOKEN_TEMPLATE, MARKET_SIZE,
} from "../public/engine.js";

// Plain match-less state, mirroring engine.test.ts's makeState but WITHOUT a `match` field,
// to check finishGame stays backward-compatible for single-round callers.
function makePlainState(overrides: any = {}) {
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

// newGame() uses real RNG for the deal, so camel counts (and thus the +5 fleet bonus applied
// inside finishGame) are non-deterministic. Zero every player's camel fleet so the bonus never
// fires and can't perturb the scores we set by hand.
function setScores(state: any, scores: number[]) {
  scores.forEach((s, i) => { state.players[i].score = s; state.players[i].camels = 0; });
}

describe("match wrapper: newGame seeds", () => {
  test("newGame seeds match correctly", () => {
    const s = newGame();
    expect(s.match).toBeTruthy();
    expect(s.match.roundNo).toBe(1);
    expect(s.match.maxRounds).toBe(MATCH_ROUNDS);
    expect(s.match.seals).toEqual([0, 0, 0, 0]);
    expect(s.match.cumScore).toEqual([0, 0, 0, 0]);
    expect(s.match.matchOver).toBe(false);
    expect(s.match.matchWinner).toBeNull();
    expect(s.match.matchWinners).toEqual([]);
    expect(s.match.lastRound).toBeNull();
    expect(s.turnIndex).toBe(0);
    expect(s.gameOver).toBe(false);
    for (const p of s.players) expect(p.hand).toHaveLength(5);
    expect(s.market).toHaveLength(MARKET_SIZE);
  });

  test("MATCH_ROUNDS is 3 and SEALS_TO_WIN is 2", () => {
    expect(MATCH_ROUNDS).toBe(3);
    expect(SEALS_TO_WIN).toBe(2);
  });
});

describe("finishGame: single round bookkeeping", () => {
  test("records cumScore, unique top scorer gets one seal, lastRound recorded", () => {
    const s = newGame();
    setScores(s, [10, 20, 5, 7]);
    finishGame(s);
    expect(s.gameOver).toBe(true);
    expect(s.match.cumScore).toEqual([10, 20, 5, 7]);
    expect(s.match.seals).toEqual([0, 1, 0, 0]);
    expect(s.match.lastRound).toEqual({ roundNo: 1, scores: [10, 20, 5, 7], winners: [1] });
    expect(s.match.matchOver).toBe(false);
  });

  test("shared top score gives a seal to EACH tied top scorer", () => {
    const s = newGame();
    setScores(s, [15, 15, 3, 15]);
    finishGame(s);
    expect(s.match.seals).toEqual([1, 1, 0, 1]);
    expect(s.match.lastRound.winners.sort()).toEqual([0, 1, 3]);
    expect(s.match.matchOver).toBe(false); // no one alone reached 2 seals yet, and roundNo(1) < maxRounds
  });
});

describe("match completion: 2 seals ends it early", () => {
  test("same seat topping twice ends the match after round 2, not round 3", () => {
    const s = newGame();
    setScores(s, [30, 5, 5, 5]);
    finishGame(s);
    expect(s.match.seals[0]).toBe(1);
    expect(s.match.matchOver).toBe(false);

    const r = nextRound(s);
    expect(r.ok).toBe(true);
    expect(s.match.roundNo).toBe(2);

    setScores(s, [40, 1, 1, 1]);
    finishGame(s);

    expect(s.match.seals[0]).toBe(2);
    expect(s.match.matchOver).toBe(true);
    expect(s.match.matchWinner).toBe(0);
    expect(s.match.matchWinners).toEqual([0]);
    expect(s.match.roundNo).toBe(2); // stopped after round 2, never reached round 3
  });
});

describe("match completion: goes the distance to maxRounds", () => {
  test("different winners each round -> match ends after round 3 on seal count", () => {
    const s = newGame();
    // Round 1: seat 0 wins
    setScores(s, [10, 0, 0, 0]);
    finishGame(s);
    expect(nextRound(s).ok).toBe(true);

    // Round 2: seat 1 wins
    setScores(s, [0, 10, 0, 0]);
    finishGame(s);
    expect(s.match.matchOver).toBe(false); // no one has 2 seals yet
    expect(nextRound(s).ok).toBe(true);

    // Round 3: seat 2 wins -> each of seats 0,1,2 has exactly 1 seal; roundNo hits maxRounds
    setScores(s, [0, 0, 10, 0]);
    finishGame(s);

    expect(s.match.roundNo).toBe(3);
    expect(s.match.matchOver).toBe(true);
    expect(s.match.seals).toEqual([1, 1, 1, 0]);
    // 3-way tie on seals; tiebreak on cumScore: 0->10, 1->10, 2->10 (all equal) => true draw
    expect(s.match.matchWinner).toBeNull();
    expect(s.match.matchWinners.sort()).toEqual([0, 1, 2]);
  });

  test("seal tie broken by higher cumScore", () => {
    const s = newGame();
    // Round 1: seat 0 wins big
    setScores(s, [50, 0, 0, 0]);
    finishGame(s);
    expect(nextRound(s).ok).toBe(true);

    // Round 2: seat 1 wins small
    setScores(s, [0, 5, 0, 0]);
    finishGame(s);
    expect(nextRound(s).ok).toBe(true);

    // Round 3: seat 1 wins again small -> seat 0 has 1 seal, seat 1 has 2 seals
    // Actually to force a *seal tie*, let's instead have seat 0 win round 3 too via a shared top.
    // Redo: give seat 1 a second win but also tie seat 0 in round 3 via shared top score.
    setScores(s, [3, 3, 0, 0]); // shared top -> both 0 and 1 get a seal this round
    finishGame(s);

    // seals: round1 -> seat0 +1; round2 -> seat1 +1; round3 -> seat0 +1, seat1 +1
    // => seat0: 2 seals, seat1: 2 seals (tie), cumScore: seat0 = 50+0+3=53, seat1 = 0+5+3=8
    expect(s.match.roundNo).toBe(3);
    expect(s.match.matchOver).toBe(true);
    expect(s.match.seals[0]).toBe(2);
    expect(s.match.seals[1]).toBe(2);
    expect(s.match.cumScore[0]).toBe(53);
    expect(s.match.cumScore[1]).toBe(8);
    expect(s.match.matchWinner).toBe(0); // higher cumScore breaks the seal tie
    expect(s.match.matchWinners).toEqual([0]);
  });

  test("true draw: equal seals AND equal cumScore -> matchWinner null, matchWinners length >= 2", () => {
    const s = newGame();
    // Seats 0 and 1 tie every round with identical scores. They both reach SEALS_TO_WIN(2)
    // simultaneously after round 2, ending the match early on an unbreakable tie.
    setScores(s, [8, 8, 0, 0]);
    finishGame(s);
    expect(s.match.matchOver).toBe(false);
    expect(nextRound(s).ok).toBe(true);

    setScores(s, [8, 8, 0, 0]);
    finishGame(s);

    expect(s.match.roundNo).toBe(2);
    expect(s.match.matchOver).toBe(true);
    expect(s.match.seals[0]).toBe(2);
    expect(s.match.seals[1]).toBe(2);
    expect(s.match.cumScore[0]).toBe(16);
    expect(s.match.cumScore[1]).toBe(16);
    expect(s.match.matchWinner).toBeNull();
    expect(s.match.matchWinners.sort()).toEqual([0, 1]);
    expect(s.match.matchWinners.length).toBeGreaterThanOrEqual(2);
  });
});

describe("seat rotation across rounds", () => {
  test("round 1 -> next round starts seat 1, roundNo 2", () => {
    const s = newGame();
    expect(s.turnIndex).toBe(0);
    setScores(s, [1, 0, 0, 0]);
    finishGame(s);
    const r = nextRound(s);
    expect(r.ok).toBe(true);
    expect(s.turnIndex).toBe(1);
    expect(s.match.roundNo).toBe(2);
  });

  test("round 2 -> next round starts seat 2, roundNo 3", () => {
    const s = newGame();
    setScores(s, [1, 0, 0, 0]);
    finishGame(s);
    nextRound(s);
    setScores(s, [0, 1, 0, 0]);
    finishGame(s);
    const r = nextRound(s);
    expect(r.ok).toBe(true);
    expect(s.turnIndex).toBe(2);
    expect(s.match.roundNo).toBe(3);
  });
});

describe("nextRound guards", () => {
  test("returns {ok:false} if the round is not over yet", () => {
    const s = newGame();
    expect(s.gameOver).toBe(false);
    const r = nextRound(s);
    expect(r.ok).toBe(false);
    expect(s.match.roundNo).toBe(1); // unchanged
  });

  test("returns {ok:false} once the match is over", () => {
    const s = newGame();
    setScores(s, [30, 5, 5, 5]);
    finishGame(s);
    nextRound(s);
    setScores(s, [40, 1, 1, 1]);
    finishGame(s);
    expect(s.match.matchOver).toBe(true);
    const r = nextRound(s);
    expect(r.ok).toBe(false);
  });
});

describe("nextRound resets per-round state but preserves match totals", () => {
  test("scores reset to 0, hands 5, market 7, gameOver false; seals/cumScore preserved", () => {
    const s = newGame();
    setScores(s, [12, 3, 9, 1]);
    finishGame(s);
    const sealsBefore = [...s.match.seals];
    const cumBefore = [...s.match.cumScore];

    const r = nextRound(s);
    expect(r.ok).toBe(true);

    for (const p of s.players) {
      expect(p.score).toBe(0);
      expect(p.hand).toHaveLength(5);
    }
    expect(s.market).toHaveLength(MARKET_SIZE);
    expect(s.gameOver).toBe(false);
    expect(s.match.seals).toEqual(sealsBefore);
    expect(s.match.cumScore).toEqual(cumBefore);
  });
});

describe("regression: finishGame on a match-less state", () => {
  test("does not throw and still applies the fleet bonus without a match object", () => {
    const s = makePlainState({
      players: PLAYER_NAMES.map((name, i) => ({
        id: i, name, isHuman: i === 0, hand: [], camels: i === 0 ? 4 : 1, score: i === 0 ? 10 : 5,
      })),
    });
    expect(s.match).toBeUndefined();
    expect(() => finishGame(s)).not.toThrow();
    expect(s.gameOver).toBe(true);
    expect(s.players[0].score).toBe(15); // 10 + CAMEL_BONUS(5) for largest fleet
  });
});

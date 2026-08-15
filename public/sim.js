// ---- NIGHT MARKET — headless simulation harness (no DOM) ----
// Plays full games among pluggable strategies to measure balance (win rates, avg score).
// Uses the pure engine. Deterministic when given a seed. See scripts/simulate.ts for the CLI.

import { newGame, botPlay, PLAYER_COUNT } from "./engine.js";

// Small seedable PRNG (mulberry32) so runs are reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The default strategy = the shipped heuristic bot. A strategy is (state, seatIdx) => void
// that takes exactly one legal turn (advancing state.turnIndex), like botPlay.
export const defaultStrategy = botPlay;

// Final standings of a finished game. finishGame() (run via the engine's end check) has
// already folded in bonus tokens + the fleet bonus, so player.score is the final total.
function standings(state) {
  const scores = state.players.map((p) => p.score);
  const max = Math.max(...scores);
  const winners = scores.map((s, i) => (s === max ? i : -1)).filter((i) => i >= 0);
  return { scores, winners };
}

// Play one full game. `strategies[i]` drives seat i. `rng` seeds the engine's shuffles
// (patched onto Math.random only for the duration of this game, then restored).
export function playGame(strategies, rng = Math.random) {
  if (strategies.length !== PLAYER_COUNT) {
    throw new Error(`need exactly ${PLAYER_COUNT} strategies, got ${strategies.length}`);
  }
  const origRandom = Math.random;
  Math.random = rng;
  try {
    const state = newGame();
    let guard = 0;
    while (!state.gameOver && guard++ < 100000) {
      const seat = state.turnIndex;
      strategies[seat](state, seat);
      // Safety net: a well-behaved strategy always advances the turn. If one no-ops on its
      // own seat (illegal move), force the turn forward so the sim can't spin forever.
      if (!state.gameOver && state.turnIndex === seat) {
        state.turnIndex = (seat + 1) % PLAYER_COUNT;
        if (state.turnIndex === 0) state.round++;
      }
    }
    return { ...standings(state), rounds: state.round, gameOver: state.gameOver };
  } finally {
    Math.random = origRandom;
  }
}

// Play N games and aggregate per-seat metrics. `seed` makes the whole run reproducible
// (game g uses seed+g). A win shared in a tie counts toward winRateInclTies, not winRate.
export function simulate(strategies, games = 1000, seed = 1) {
  const seats = strategies.length;
  const wins = Array(seats).fill(0);
  const winsInclTies = Array(seats).fill(0);
  const scoreSum = Array(seats).fill(0);
  let ties = 0;
  for (let g = 0; g < games; g++) {
    const r = playGame(strategies, makeRng(seed + g));
    r.scores.forEach((s, i) => (scoreSum[i] += s));
    r.winners.forEach((i) => winsInclTies[i]++);
    if (r.winners.length === 1) wins[r.winners[0]]++;
    else ties++;
  }
  return {
    games,
    seed,
    ties,
    winRate: wins.map((w) => w / games),
    winRateInclTies: winsInclTies.map((w) => w / games),
    avgScore: scoreSum.map((s) => s / games),
  };
}

// ---- NIGHT MARKET — bot/player strategies for the simulation harness (no DOM) ----
// A strategy is (state, seatIdx) => void that takes exactly one legal turn, like the
// engine's botPlay. Used by sim.js to measure balance. Keep DOM-free + testable.

import {
  RARE, GOODS, goodsInHand, HAND_LIMIT, PLAYER_COUNT,
  takeCard, takeCamels, sellCards, exchangeCards, botPlay,
} from "./engine.js";

// "Human proxy" — models the strong human line Kasia described:
// buy high-rarity goods, hold for a 3–4 combo (bonus token), but cash a rare pair early
// and dump anything when the hand is nearly full. This is the yardstick the bots are
// measured against; if it wins far above its fair share, the bots are too weak.
export function humanProxy(state, seat) {
  if (state.gameOver || state.turnIndex !== seat) return;
  const p = state.players[seat], hand = p.hand, counts = goodsInHand(hand);
  const pressure = hand.length >= HAND_LIMIT - 1;

  // 1) Sell. Prefer 3+ lots (combo bonus); take a rare pair (scarce, valuable); under hand
  //    pressure sell the best legal lot even if small.
  let best = null;
  for (const g of GOODS) {
    const owned = counts[g] || 0;
    const min = RARE.has(g) ? 2 : 1;
    if (owned < min) continue;
    const pile = state.tokens[g];
    if (pile.length === 0) continue;
    const n = Math.min(owned, pile.length);
    const value = pile.slice(0, n).reduce((a, b) => a + b, 0);
    const wantSell = n >= 3 || (RARE.has(g) && n >= 2) || (pressure && n >= min);
    if (!wantSell) continue;
    const score = value + (n >= 3 ? 6 : 0) + (RARE.has(g) ? 3 : 0);
    if (!best || score > best.score) best = { g, n, score };
  }
  if (best) { sellCards(state, seat, best.g, best.n); return; }

  // 2) Acquire rares to build toward a set (extend an existing collection first).
  if (hand.length < HAND_LIMIT) {
    const rares = state.market.map((c, i) => ({ c, i })).filter((x) => RARE.has(x.c));
    if (rares.length) {
      rares.sort((a, b) => (counts[b.c] || 0) - (counts[a.c] || 0));
      takeCard(state, seat, rares[0].i);
      return;
    }
  }

  // 3) Sweep drones when plentiful; else take the most useful non-drone good.
  const drones = state.market.filter((c) => c === "camel").length;
  if (drones >= 2) { takeCamels(state, seat); return; }
  if (hand.length < HAND_LIMIT) {
    const nonCamel = state.market.map((c, i) => ({ c, i })).filter((x) => x.c !== "camel");
    if (nonCamel.length) {
      const val = (c) => {
        let s = RARE.has(c) ? 4 : 1;
        if (counts[c]) s += 2;
        const pile = state.tokens[c];
        if (pile && pile.length) s += pile[0] / 10;
        return s;
      };
      nonCamel.sort((a, b) => val(b.c) - val(a.c));
      takeCard(state, seat, nonCamel[0].i);
      return;
    }
  }
  if (drones > 0) { takeCamels(state, seat); return; }

  // 4) Fallback: exchange (give commons for market) to keep moving.
  const mkt = state.market.map((c, i) => (c !== "camel" ? i : -1)).filter((i) => i >= 0);
  const give = Math.min(2, hand.length, mkt.length);
  if (give >= 2) {
    const idxs = hand
      .map((c, i) => ({ c, i }))
      .sort((a, b) => (RARE.has(a.c) ? 1 : 0) - (RARE.has(b.c) ? 1 : 0))
      .slice(0, give)
      .map((x) => x.i);
    exchangeCards(state, seat, { handIdxs: idxs, camels: 0 }, mkt.slice(0, give));
    return;
  }

  // 5) No legal move — skip (mirror the engine's skip path).
  state.turnIndex = (seat + 1) % PLAYER_COUNT;
  if (state.turnIndex === 0) state.round++;
}

// ---- Smart bot: 1-ply lookahead over legal moves + position evaluation (ROC-206) ----
// Enumerates every legal move, simulates each on a cloned state, scores the resulting
// position, and plays the best. Subsumes rare-set timing / hold-for-bonus automatically.

// Position value from `seat`'s perspective: banked CR is real; hand goods are discounted
// (not yet banked, and opponents compete); fleet is valued toward the +5 end bonus.
export function evalPosition(state, seat) {
  const p = state.players[seat];
  let v = p.score; // banked CR
  const counts = goodsInHand(p.hand);
  for (const g of GOODS) {
    const n = counts[g] || 0;
    if (!n) continue;
    const pile = state.tokens[g];
    const avail = Math.min(n, pile.length);
    const sellNow = pile.slice(0, avail).reduce((a, b) => a + b, 0);
    v += sellNow * 0.55; // hand goods worth ~half until banked
    if (n >= 3) v += 4; // a combo bonus is in reach
    else if (RARE.has(g) && n >= 2) v += 2.5; // rare pair, near its payout
    else if (n >= 2) v += 1; // building a set
  }
  // Fleet: camels give flexibility; leading the fleet is worth ~the +5 end bonus.
  const others = Math.max(0, ...state.players.filter((x) => x.id !== seat).map((x) => x.camels));
  v += p.camels * 0.6;
  if (p.camels > others) v += 3;
  else if (p.camels === others && others > 0) v += 1;
  return v;
}

function enumerateMoves(state, seat) {
  const p = state.players[seat], counts = goodsInHand(p.hand), moves = [];
  if (p.hand.length < HAND_LIMIT) {
    const seen = new Set(); // one representative per good type (same good ⇒ same resulting value)
    state.market.forEach((c, i) => { if (c !== "camel" && !seen.has(c)) { seen.add(c); moves.push({ kind: "take", i }); } });
  }
  if (state.market.some((c) => c === "camel")) moves.push({ kind: "camels" });
  for (const g of GOODS) {
    const owned = counts[g] || 0, min = RARE.has(g) ? 2 : 1;
    if (owned < min || state.tokens[g].length === 0) continue;
    const cnts = new Set([owned, min]);
    if (owned >= 3) cnts.add(3);
    for (const c of cnts) if (c >= min && c <= owned) moves.push({ kind: "sell", good: g, count: c });
  }
  // One simple 2-for-2 exchange as a fallback (give the two lowest-priority commons).
  const mkt = state.market.map((c, i) => (c !== "camel" ? i : -1)).filter((i) => i >= 0);
  if (p.hand.length >= 2 && mkt.length >= 2) {
    const give = p.hand.map((c, i) => ({ c, i }))
      .sort((a, b) => (RARE.has(a.c) ? 1 : 0) - (RARE.has(b.c) ? 1 : 0))
      .slice(0, 2).map((x) => x.i);
    moves.push({ kind: "exchange", give: { handIdxs: give, camels: 0 }, take: mkt.slice(0, 2) });
  }
  return moves;
}

function applyMove(state, seat, m) {
  switch (m.kind) {
    case "take": return takeCard(state, seat, m.i);
    case "camels": return takeCamels(state, seat);
    case "sell": return sellCards(state, seat, m.good, m.count);
    case "exchange": return exchangeCards(state, seat, m.give, m.take);
  }
  return { ok: false };
}

export function smartBot(state, seat) {
  if (state.gameOver || state.turnIndex !== seat) return;
  const moves = enumerateMoves(state, seat);
  let best = null, bestV = -Infinity;
  for (const m of moves) {
    const clone = structuredClone(state);
    const r = applyMove(clone, seat, m);
    if (!r || !r.ok) continue;
    const v = evalPosition(clone, seat);
    if (v > bestV) { bestV = v; best = m; }
  }
  if (best) { applyMove(state, seat, best); return; }
  // No legal move — skip (mirror the engine's skip path).
  state.turnIndex = (seat + 1) % PLAYER_COUNT;
  if (state.turnIndex === 0) state.round++;
}

// ---- Difficulty personalities + tier registry (ROC-208) ----
// easyBot = a "reckless" personality: cashes the first sellable good at its minimum count
// (dumping rares for their low early tokens, never waiting for a 3+ combo bonus, never
// building sets). Deliberately weak — the beatable tier.
export function easyBot(state, seat) {
  if (state.gameOver || state.turnIndex !== seat) return;
  const p = state.players[seat], counts = goodsInHand(p.hand);
  for (const g of GOODS) {
    const min = RARE.has(g) ? 2 : 1;
    if ((counts[g] || 0) >= min && state.tokens[g].length > 0) { sellCards(state, seat, g, min); return; }
  }
  if (p.hand.length < HAND_LIMIT) {
    const idx = state.market.findIndex((c) => c !== "camel");
    if (idx >= 0) { takeCard(state, seat, idx); return; }
  }
  if (state.market.includes("camel")) { takeCamels(state, seat); return; }
  const mkt = state.market.map((c, i) => (c !== "camel" ? i : -1)).filter((i) => i >= 0);
  if (p.hand.length >= 2 && mkt.length >= 2) { exchangeCards(state, seat, { handIdxs: [0, 1], camels: 0 }, mkt.slice(0, 2)); return; }
  state.turnIndex = (seat + 1) % PLAYER_COUNT;
  if (state.turnIndex === 0) state.round++;
}

// Difficulty ladder: easy (reckless) < normal (balanced heuristic) < hard (1-ply lookahead).
export const DIFFICULTY = { easy: easyBot, normal: botPlay, hard: smartBot };
export const DIFFICULTY_ORDER = ["easy", "normal", "hard"];

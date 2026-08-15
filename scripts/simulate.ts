// NIGHT MARKET — bot balance simulator (ROC-204).
// Usage: bun scripts/simulate.ts [games] [seed]
// Runs N games of 4 identical heuristic bots and prints per-seat win rate + avg score.
// (ROC-205 will add a "human-proxy" strategy to quantify the imbalance vs the bots.)

import { simulate, defaultStrategy } from "../public/sim.js";
import { PLAYER_NAMES } from "../public/engine.js";

const games = Number(process.argv[2]) || 2000;
const seed = Number(process.argv[3]) || 1;

const strategies = Array(4).fill(defaultStrategy);
const t0 = performance.now();
const r = simulate(strategies, games, seed);
const ms = Math.round(performance.now() - t0);

const pct = (x: number) => (x * 100).toFixed(1).padStart(5) + "%";
console.log(`\nNIGHT MARKET — bot balance  (${games} games, seed ${seed}, ${ms}ms)`);
console.log(`4× default heuristic bot. Seat 0 acts first.\n`);
console.log(`seat  name        win%   win%(+ties)  avgScore`);
for (let i = 0; i < 4; i++) {
  const name = (PLAYER_NAMES[i] || `seat ${i}`).padEnd(10);
  console.log(`  ${i}   ${name}  ${pct(r.winRate[i])}   ${pct(r.winRateInclTies[i])}      ${r.avgScore[i].toFixed(1).padStart(5)}`);
}
console.log(`\nties (no unique winner): ${(r.ties / games * 100).toFixed(1)}%  (${r.ties}/${games})`);
console.log(`sum win% = ${(r.winRate.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%  (rest are ties)\n`);

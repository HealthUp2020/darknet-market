// NIGHT MARKET — strategy comparison (ROC-206).
// Usage: bun scripts/compare.ts [games] [seed]
// Puts a "challenger" strategy at each seat vs 3 of a "field" strategy, averaged over seats.

import { simulate } from "../public/sim.js";
import { botPlay } from "../public/engine.js";
import { humanProxy, smartBot } from "../public/strategies.js";

const games = Number(process.argv[2]) || 1000;
const seed = Number(process.argv[3]) || 1;

function oneVsThree(challenger: any, field: any) {
  let win = 0, winTies = 0, score = 0;
  const perSeat: number[] = [];
  for (let seat = 0; seat < 4; seat++) {
    const strat = [field, field, field, field];
    strat[seat] = challenger;
    const r = simulate(strat, games, seed + seat * 100003);
    perSeat.push(r.winRate[seat]);
    win += r.winRate[seat]; winTies += r.winRateInclTies[seat]; score += r.avgScore[seat];
  }
  return { win: win / 4, winTies: winTies / 4, score: score / 4, perSeat };
}

const pct = (x: number) => (x * 100).toFixed(1) + "%";
const t0 = performance.now();
const vsBots = oneVsThree(smartBot, botPlay);
const vsHuman = oneVsThree(smartBot, humanProxy);
const ms = Math.round(performance.now() - t0);

console.log(`\nNIGHT MARKET — smartBot comparison  (${games} games/seat, seed ${seed}, ${ms}ms)`);
console.log(`Fair share = 25.0%\n`);
console.log(`  smartBot vs 3 default bots :  win ${pct(vsBots.win)}  (+ties ${pct(vsBots.winTies)})  avgScore ${vsBots.score.toFixed(1)}`);
console.log(`     by seat: ${vsBots.perSeat.map((x, i) => `s${i} ${pct(x)}`).join("  ")}`);
console.log(`  smartBot vs 3 human-proxy  :  win ${pct(vsHuman.win)}  (+ties ${pct(vsHuman.winTies)})  avgScore ${vsHuman.score.toFixed(1)}`);
console.log(`     by seat: ${vsHuman.perSeat.map((x, i) => `s${i} ${pct(x)}`).join("  ")}`);
console.log(`\n  smartBot beats a default bot's share by ${(vsBots.win / ((1 - vsBots.win) / 3)).toFixed(2)}×\n`);

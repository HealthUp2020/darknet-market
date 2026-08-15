// NIGHT MARKET — bot-balance baseline (ROC-205).
// Usage: bun scripts/baseline.ts [games] [seed]
// Puts the human-proxy strategy at each of the 4 seats vs 3 default bots and averages its
// win rate (cancels the seat-order bias found in ROC-204), then compares to the fair 25%.

import { simulate } from "../public/sim.js";
import { botPlay } from "../public/engine.js";
import { humanProxy } from "../public/strategies.js";

const games = Number(process.argv[2]) || 3000;
const seed = Number(process.argv[3]) || 1;

let hWin = 0, hWinTies = 0, hScore = 0;
const perSeat: number[] = [];
for (let seat = 0; seat < 4; seat++) {
  const strat = [botPlay, botPlay, botPlay, botPlay];
  strat[seat] = humanProxy;
  const r = simulate(strat, games, seed + seat * 100003);
  perSeat.push(r.winRate[seat]);
  hWin += r.winRate[seat];
  hWinTies += r.winRateInclTies[seat];
  hScore += r.avgScore[seat];
}
hWin /= 4; hWinTies /= 4; hScore /= 4;

// All-bot reference: average bot win rate per seat (fair share is 25%).
const ref = simulate([botPlay, botPlay, botPlay, botPlay], games, seed + 700007);
const botAvgWin = ref.winRate.reduce((a, b) => a + b, 0) / 4;
const botAvgScore = ref.avgScore.reduce((a, b) => a + b, 0) / 4;

const pct = (x: number) => (x * 100).toFixed(1) + "%";
console.log(`\nNIGHT MARKET — baseline imbalance  (${games} games/seat, seed ${seed})\n`);
console.log(`Fair share in a 4-player game = 25.0%\n`);
console.log(`  human-proxy (avg over all 4 seats):  win ${pct(hWin)}   win+ties ${pct(hWinTies)}   avgScore ${hScore.toFixed(1)}`);
console.log(`  default bot  (avg over all 4 seats):  win ${pct(botAvgWin)}                    avgScore ${botAvgScore.toFixed(1)}`);
console.log(`\n  human-proxy win rate by seat: ${perSeat.map((x, i) => `s${i} ${pct(x)}`).join("  ")}`);
console.log(`\n  imbalance = human ${pct(hWin)} vs fair 25.0%  ->  +${((hWin - 0.25) * 100).toFixed(1)} pts over fair`);
console.log(`             human beats a bot's share by ${(hWin / botAvgWin).toFixed(2)}×\n`);

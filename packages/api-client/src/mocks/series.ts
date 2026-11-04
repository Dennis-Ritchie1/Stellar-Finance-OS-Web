// Deterministic fake cash-flow history so charts look plausible in mock mode.
import Big from 'big.js';
import type { MockDb } from './db';

const DAY = 24 * 3600 * 1000;

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function dailySeries(db: MockDb, from: Date, to: Date, assetCode = 'USDC') {
  const points: { date: string; inflow: string; outflow: string }[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += DAY) {
    const date = new Date(t).toISOString().slice(0, 10);
    const dayIndex = Math.floor(t / DAY);
    let inflow = new Big(seeded(dayIndex) > 0.55 ? Math.round(seeded(dayIndex + 1) * 4000) : 0);
    let outflow = new Big(
      seeded(dayIndex + 7) > 0.65 ? Math.round(seeded(dayIndex + 3) * 2500) : 0,
    );
    for (const tx of db.transactions) {
      if (tx.assetCode !== assetCode || tx.createdAt.slice(0, 10) !== date) continue;
      if (tx.direction === 'incoming') inflow = inflow.plus(tx.amount);
      else outflow = outflow.plus(tx.amount);
    }
    points.push({ date, inflow: inflow.toFixed(2), outflow: outflow.toFixed(2) });
  }
  return points;
}

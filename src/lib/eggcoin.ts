// EggCoin demo domain logic. Pure functions + constants. No backend, no I/O.
// Flip the two multipliers below to change the whole payout model in one place.

export const BALUT_MULT = 1.2; // Balut (win)  → coin worth price × 1.20
export const PENOY_MULT = 0.8; // Penoy/spoil (loss) → coin worth price × 0.80
export const START_WALLET = 10_000; // ₱ demo balance

// Demo time is accelerated: one "day" of maturation lasts a few real seconds,
// so a 15-day batch resolves in ~40s. Real calendar days = unwatchable demo.
// ponytail: 1 day = 2.5s. Bump toward 86_400_000 for real time if a backend lands.
export const DEMO_DAY_MS = 2_500;

export type Outcome = "balut" | "penoy";
export type BatchStatus = "live" | "upcoming" | "closed";

export interface Batch {
  id: string;
  code: string; // "#0713"
  name: string; // "Balutan Prime"
  farm: string;
  price: number; // ₱ per EggCoin (per-batch; 15 for the seed batches)
  supply: number; // total EggCoins issued = backed physical eggs
  sold: number; // EggCoins already claimed (scarcity)
  maturityDays: number; // 14–16
  openedAt: number; // epoch ms — batch drop time
  closesAt: number; // sale window end
  hatchRate: number; // farm's historical Balut rate, 0..1 (the odds shown to buyers)
}

export interface Resolution {
  balutRate: number; // actual realized rate 0..1
  balutCoins: number;
  penoyCoins: number;
  payout: number; // ₱ credited back
}

export interface Holding {
  id: string;
  batchId: string;
  batchLabel: string; // frozen "#0713 · Balutan Prime" for portfolio display
  coins: number;
  price: number; // locked buy price
  boughtAt: number;
  maturesAt: number; // boughtAt + maturityDays × DEMO_DAY_MS
  resolved?: Resolution; // set once hatched
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const available = (b: Batch) => Math.max(0, b.supply - b.sold);
export const soldPct = (b: Batch) => clamp(b.sold / b.supply, 0, 1);
export const batchLabel = (b: Batch) => `${b.code} · ${b.name}`;

export function batchStatus(b: Batch, now: number): BatchStatus {
  if (now < b.openedAt) return "upcoming";
  if (now >= b.closesAt || available(b) <= 0) return "closed";
  return "live";
}

export function isMatured(h: Holding, now: number) {
  return now >= h.maturesAt;
}

// Maturation progress 0..1 for the countdown ring.
export function maturity(h: Holding, now: number) {
  const total = h.maturesAt - h.boughtAt;
  return clamp((now - h.boughtAt) / total, 0, 1);
}

// Peso formatting — ₱1,512.00
export function peso(n: number, dp = 2) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function compact(n: number) {
  return n.toLocaleString("en-PH");
}

// The core payout. Given how many coins turned Balut, what does the holding pay?
export function payoutFor(coins: number, price: number, balutCoins: number): number {
  const penoy = coins - balutCoins;
  return balutCoins * price * BALUT_MULT + penoy * price * PENOY_MULT;
}

// Resolve a matured holding: draw an actual Balut rate around the farm's odds,
// with variance, then compute the split + payout. rng lets callers pass a seed.
export function resolve(h: Holding, hatchRate: number, rng: () => number = Math.random): Resolution {
  const variance = 0.12;
  const rate = clamp(hatchRate + (rng() * 2 - 1) * variance, 0.45, 1);
  const balutCoins = Math.round(h.coins * rate);
  const penoyCoins = h.coins - balutCoins;
  const payout = payoutFor(h.coins, h.price, balutCoins);
  return { balutRate: balutCoins / h.coins, balutCoins, penoyCoins, payout };
}

// Projected value at the farm's stated odds — shown before buying.
export function projected(coins: number, price: number, hatchRate: number) {
  const cost = coins * price;
  const value = payoutFor(coins, price, coins * hatchRate);
  return { cost, value, pnl: value - cost, roi: cost ? (value - cost) / cost : 0 };
}

// Seed batches, timestamps relative to first client load `t0`.
export function seedBatches(t0: number): Batch[] {
  const day = DEMO_DAY_MS;
  return [
    {
      id: "b0713",
      code: "#0713",
      name: "Balutan Prime",
      farm: "Pateros Duck Farm",
      price: 15,
      supply: 3000,
      sold: 2190,
      maturityDays: 15,
      openedAt: t0 - 40 * day,
      closesAt: t0 + 90 * day, // long window, closes when sold out
      hatchRate: 0.82,
    },
    {
      id: "b0712",
      code: "#0712",
      name: "Laguna Mallard",
      farm: "Los Baños Itik Co-op",
      price: 15,
      supply: 5000,
      sold: 1240,
      maturityDays: 16,
      openedAt: t0 - 12 * day,
      closesAt: t0 + 140 * day,
      hatchRate: 0.78,
    },
    {
      id: "b0711",
      code: "#0711",
      name: "Heritage Itik",
      farm: "Victoria Highland Ducks",
      price: 15,
      supply: 1200,
      sold: 1150, // almost gone — urgency
      maturityDays: 14,
      openedAt: t0 - 60 * day,
      closesAt: t0 + 30 * day,
      hatchRate: 0.88, // premium odds
    },
    {
      id: "b0714",
      code: "#0714",
      name: "Dawn Drop",
      farm: "Pateros Duck Farm",
      price: 15,
      supply: 4000,
      sold: 0,
      maturityDays: 15,
      openedAt: t0 + 18_000, // drops ~18s after load
      closesAt: t0 + 200 * day,
      hatchRate: 0.8,
    },
  ];
}

// Live-market simulation: other investors nibble supply on live batches so
// availability visibly ticks down. Returns a new batches array (immutable).
export function simulateDemand(batches: Batch[], now: number, rng: () => number = Math.random): Batch[] {
  return batches.map((b) => {
    if (batchStatus(b, now) !== "live") return b;
    if (rng() > 0.55) return b; // only some ticks buy
    const buy = 1 + Math.floor(rng() * 6);
    const sold = Math.min(b.supply, b.sold + buy);
    return sold === b.sold ? b : { ...b, sold };
  });
}

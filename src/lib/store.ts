"use client";

// Tiny localStorage-backed store via useSyncExternalStore. No deps, no context.
// Actions replace state immutably then emit; getSnapshot returns a stable ref.

import { useSyncExternalStore } from "react";
import {
  Batch,
  Holding,
  START_WALLET,
  DEMO_DAY_MS,
  available,
  batchLabel,
  resolve,
  seedBatches,
  simulateDemand,
} from "./eggcoin";

const KEY = "eggcoin.v2";

export interface State {
  wallet: number;
  holdings: Holding[];
  batches: Batch[];
  seededAt: number;
}

const EMPTY: State = { wallet: START_WALLET, holdings: [], batches: [], seededAt: 0 };

let state: State | null = null;
const listeners = new Set<() => void>();
let idSeq = 0;

function fresh(now: number): State {
  return { wallet: START_WALLET, holdings: [], batches: seedBatches(now), seededAt: now };
}

function load(): State {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s && Array.isArray(s.batches) && s.batches.length) return s;
    }
  } catch {
    // corrupt storage — reseed
  }
  return fresh(Date.now());
}

function ensure(): State {
  if (!state) state = load();
  return state;
}

function commit(next: State) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // quota/private mode — keep in memory
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => ensure();
const getServerSnapshot = () => EMPTY;

export function useEgg(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---- actions -------------------------------------------------------------

export type BuyResult = { ok: true; holding: Holding } | { ok: false; reason: string };

export function buy(batchId: string, coins: number, now = Date.now()): BuyResult {
  const s = ensure();
  const batch = s.batches.find((b) => b.id === batchId);
  if (!batch) return { ok: false, reason: "Batch not found" };
  if (coins <= 0) return { ok: false, reason: "Enter at least 1 EggCoin" };
  if (coins > available(batch)) return { ok: false, reason: "Not enough supply left" };
  const cost = coins * batch.price;
  if (cost > s.wallet) return { ok: false, reason: "Insufficient balance" };

  const holding: Holding = {
    id: `h${now}_${idSeq++}`,
    batchId: batch.id,
    batchLabel: batchLabel(batch),
    coins,
    price: batch.price,
    boughtAt: now,
    maturesAt: now + batch.maturityDays * DEMO_DAY_MS,
  };

  commit({
    ...s,
    wallet: s.wallet - cost,
    holdings: [holding, ...s.holdings],
    batches: s.batches.map((b) => (b.id === batch.id ? { ...b, sold: b.sold + coins } : b)),
  });
  return { ok: true, holding };
}

export function hatch(holdingId: string): Holding | null {
  const s = ensure();
  const h = s.holdings.find((x) => x.id === holdingId);
  if (!h || h.resolved) return null;
  const batch = s.batches.find((b) => b.id === h.batchId);
  const rate = batch?.hatchRate ?? 0.8;
  const resolved = resolve(h, rate);
  const next: Holding = { ...h, resolved };
  commit({
    ...s,
    wallet: s.wallet + resolved.payout,
    holdings: s.holdings.map((x) => (x.id === holdingId ? next : x)),
  });
  return next;
}

export function addFunds(amount = 5000) {
  const s = ensure();
  commit({ ...s, wallet: s.wallet + amount });
}

// Advance market: simulated demand nibbles live supply. Called on an interval.
export function tick(now = Date.now()) {
  const s = ensure();
  const batches = simulateDemand(s.batches, now);
  if (batches !== s.batches && batches.some((b, i) => b !== s.batches[i])) {
    commit({ ...s, batches });
  }
}

export function reset() {
  commit(fresh(Date.now()));
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CoinSprite, EggSprite } from "@/components/sprites";
import { DropTimer, useNow } from "@/components/timers";
import { addFunds, buy, hatch, reset, tick, useEgg } from "@/lib/store";
import {
  Batch,
  DEMO_DAY_MS,
  Holding,
  available,
  batchStatus,
  compact,
  isMatured,
  maturity,
  peso,
  projected,
  soldPct,
} from "@/lib/eggcoin";

type Tab = "market" | "portfolio";

export default function AppPage() {
  const state = useEgg();
  const now = useNow(1000);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("market");
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // live market: other investors nibble supply
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => tick(), 1500);
    return () => clearInterval(id);
  }, [mounted]);

  // auto-dismiss the flash message
  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 2600);
    return () => clearTimeout(id);
  }, [flash]);

  const maturedCount = useMemo(
    () => (now ? state.holdings.filter((h) => !h.resolved && isMatured(h, now)).length : 0),
    [state.holdings, now],
  );

  if (!mounted) return <Boot />;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24">
      {/* top bar */}
      <header className="sticky top-0 z-20 -mx-4 mb-6 flex items-center justify-between gap-3 border-b-4 border-ink bg-bg/95 px-4 py-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <CoinSprite size={30} />
          <span className="pixel-font text-xs text-yolk">EGGCOIN</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="panel flex items-center gap-2 px-3 py-2">
            <CoinSprite size={20} />
            <span className="pixel-font text-xs text-cream">{peso(state.wallet)}</span>
          </div>
          <button className="btn btn-sm btn-teal" onClick={() => addFunds(5000)}>
            + ₱5k
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              reset();
              setFlash("Demo reset");
            }}
          >
            Reset
          </button>
        </div>
      </header>

      {/* tabs */}
      <div className="mb-6 flex gap-3">
        <TabBtn active={tab === "market"} onClick={() => setTab("market")}>
          Market
        </TabBtn>
        <TabBtn active={tab === "portfolio"} onClick={() => setTab("portfolio")}>
          Portfolio
          {maturedCount > 0 && <span className="chip chip-live ml-2">{maturedCount} ready</span>}
        </TabBtn>
      </div>

      {tab === "market" ? (
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {state.batches.map((b) => (
            <BatchCard key={b.id} batch={b} now={now} wallet={state.wallet} onFlash={setFlash} />
          ))}
        </section>
      ) : (
        <Portfolio holdings={state.holdings} now={now} onFlash={setFlash} onGoMarket={() => setTab("market")} />
      )}

      {flash && (
        <div className="pop fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
          <div className="panel panel-raised px-5 py-3 text-lg text-cream">{flash}</div>
        </div>
      )}
    </main>
  );
}

// ---- market -------------------------------------------------------------

function BatchCard({
  batch,
  now,
  wallet,
  onFlash,
}: {
  batch: Batch;
  now: number;
  wallet: number;
  onFlash: (s: string) => void;
}) {
  const [qty, setQty] = useState(50);
  const status = batchStatus(batch, now || batch.openedAt);
  const left = available(batch);
  const maxByWallet = Math.floor(wallet / batch.price);
  const max = Math.min(left, maxByWallet);
  const coins = Math.max(0, Math.min(qty, max));
  const proj = projected(coins, batch.price, batch.hatchRate);
  const pct = Math.round(soldPct(batch) * 100);
  const canBuy = status === "live" && coins > 0;

  const chip =
    status === "live"
      ? pct > 90
        ? "chip-hot"
        : "chip-live"
      : status === "upcoming"
        ? "chip-soon"
        : "";
  const chipText = status === "live" ? (pct > 90 ? "Almost gone" : "Live") : status === "upcoming" ? "Upcoming" : "Sold out";

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="pixel-font text-xs text-yolk">{batch.code}</span>
        <span className={`chip ${chip}`}>{chipText}</span>
      </div>
      <h3 className="mt-3 text-xl text-cream">{batch.name}</h3>
      <p className="text-base text-muted">{batch.farm}</p>

      <div className="mt-4 flex items-end justify-between">
        <Metric k={`₱${batch.price}`} v="per coin" />
        <Metric k={`${Math.round(batch.hatchRate * 100)}%`} v="hatch odds" tone="teal" right />
      </div>

      <div className="mt-4">
        <div className="meter">
          <i style={{ "--v": soldPct(batch) } as React.CSSProperties} />
        </div>
        <div className="eyebrow mt-2">
          {pct}% claimed · {compact(left)} of {compact(batch.supply)} left
        </div>
      </div>

      {status === "upcoming" ? (
        <div className="mt-5 panel panel-raised px-4 py-3 text-center">
          <div className="eyebrow">Drops in</div>
          <div className="pixel-font mt-1 text-lg text-teal">
            <DropTimer to={batch.openedAt} />
          </div>
        </div>
      ) : status === "closed" ? (
        <div className="mt-5 panel panel-raised px-4 py-3 text-center text-lg text-muted">Batch sold out</div>
      ) : (
        <div className="mt-5">
          <Stepper qty={qty} max={max} onChange={setQty} />
          <div className="mt-3 flex items-center justify-between text-lg">
            <span className="text-muted">Cost</span>
            <span className="text-cream">{peso(proj.cost)}</span>
          </div>
          <div className="flex items-center justify-between text-lg">
            <span className="text-muted">Projected @ odds</span>
            <span className="text-balut">
              {peso(proj.value)} (+{Math.round(proj.roi * 100)}%)
            </span>
          </div>
          <button
            className="btn mt-4 w-full"
            disabled={!canBuy}
            onClick={() => {
              const r = buy(batch.id, coins);
              onFlash(r.ok ? `Bought ${coins} · ${batch.code}` : r.reason);
            }}
          >
            {coins > 0 ? `Buy ${coins} — ${peso(proj.cost)}` : "Enter amount"}
          </button>
        </div>
      )}
    </div>
  );
}

function Stepper({ qty, max, onChange }: { qty: number; max: number; onChange: (n: number) => void }) {
  const clamp = (n: number) => Math.max(0, Math.min(max, n));
  return (
    <div>
      <div className="flex items-stretch gap-2">
        <button className="btn btn-sm btn-ghost" onClick={() => onChange(clamp(qty - 10))} aria-label="minus 10">
          –
        </button>
        <input
          type="number"
          value={qty}
          min={0}
          max={max}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className="panel w-full bg-ink px-3 py-2 text-center text-xl text-cream outline-none"
          aria-label="EggCoin quantity"
        />
        <button className="btn btn-sm btn-ghost" onClick={() => onChange(clamp(qty + 10))} aria-label="plus 10">
          +
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        {[10, 50, 100].map((n) => (
          <button key={n} className="btn btn-sm btn-ghost flex-1" onClick={() => onChange(clamp(n))}>
            {n}
          </button>
        ))}
        <button className="btn btn-sm btn-ghost flex-1" onClick={() => onChange(max)}>
          Max
        </button>
      </div>
    </div>
  );
}

// ---- portfolio ----------------------------------------------------------

function Portfolio({
  holdings,
  now,
  onFlash,
  onGoMarket,
}: {
  holdings: Holding[];
  now: number;
  onFlash: (s: string) => void;
  onGoMarket: () => void;
}) {
  if (holdings.length === 0) {
    return (
      <div className="panel grid place-items-center gap-4 p-14 text-center">
        <EggSprite size={90} className="bob" glow="#f5a623" />
        <p className="text-2xl text-cream">No holdings yet.</p>
        <p className="text-lg text-muted">Buy into a live batch and wait for the hatch.</p>
        <button className="btn" onClick={onGoMarket}>
          Go to Market
        </button>
      </div>
    );
  }

  const invested = holdings.reduce((n, h) => n + h.coins * h.price, 0);
  const realized = holdings.reduce((n, h) => n + (h.resolved?.payout ?? 0), 0);

  return (
    <section>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryTile k={peso(invested)} v="Total invested" />
        <SummaryTile k={peso(realized)} v="Realized payout" tone="balut" />
        <SummaryTile k={`${holdings.length}`} v="Positions" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {holdings.map((h) => (
          <HoldingCard key={h.id} holding={h} now={now} onFlash={onFlash} />
        ))}
      </div>
    </section>
  );
}

function HoldingCard({ holding, now, onFlash }: { holding: Holding; now: number; onFlash: (s: string) => void }) {
  const [phase, setPhase] = useState<"idle" | "cracking">("idle");
  const matured = now ? isMatured(holding, now) : false;
  const prog = now ? maturity(holding, now) : 0;
  const cost = holding.coins * holding.price;
  const daysLeft = Math.max(0, Math.ceil((holding.maturesAt - now) / DEMO_DAY_MS));
  const r = holding.resolved;

  useEffect(() => {
    if (phase !== "cracking") return;
    const id = setTimeout(() => {
      const res = hatch(holding.id);
      setPhase("idle");
      if (res?.resolved) {
        const pnl = res.resolved.payout - cost;
        onFlash(`${res.batchLabel}: ${peso(res.resolved.payout)} (${pnl >= 0 ? "+" : ""}${peso(pnl)})`);
      }
    }, 650);
    return () => clearTimeout(id);
  }, [phase, holding.id, cost, onFlash]);

  return (
    <div className="panel flex gap-4 p-5">
      <div className="grid place-items-center">
        <EggSprite
          size={64}
          className={phase === "cracking" ? "shake" : matured && !r ? "bob glow" : ""}
          glow={r ? (r.balutRate >= 0.5 ? "#2fae4a" : "#d83a55") : "#f5a623"}
          tint={r && r.balutRate < 0.5 ? { S: "#e6d3c0", s: "#c9b49a" } : undefined}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate pixel-font text-[0.62rem] text-yolk">{holding.batchLabel}</span>
          <span className="text-lg text-muted">{compact(holding.coins)} coins</span>
        </div>

        {r ? (
          <div className="rise mt-2">
            <div className="flex items-baseline justify-between">
              <span className="pixel-font text-sm" style={{ color: r.balutRate >= 0.5 ? "var(--balut)" : "var(--penoy)" }}>
                {Math.round(r.balutRate * 100)}% Balut
              </span>
              <span className="text-lg text-muted">
                {r.balutCoins}✓ / {r.penoyCoins}✕
              </span>
            </div>
            <div className={`meter ${r.balutRate >= 0.5 ? "balut" : "penoy"} mt-2`}>
              <i style={{ "--v": r.balutRate } as React.CSSProperties} />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-lg text-muted">Payout</span>
              <span className="pixel-font text-sm text-cream">{peso(r.payout)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg text-muted">P&L</span>
              <PnL value={r.payout - cost} />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-2 flex items-baseline justify-between text-lg">
              <span className="text-muted">Cost</span>
              <span className="text-cream">{peso(cost)}</span>
            </div>
            <div className="mt-3">
              <div className="meter">
                <i style={{ "--v": prog } as React.CSSProperties} />
              </div>
              <div className="eyebrow mt-2">
                {matured ? "Matured — ready to hatch" : `Incubating · ~${daysLeft}d left (demo)`}
              </div>
            </div>
            <button
              className="btn btn-balut mt-4 w-full"
              disabled={!matured || phase === "cracking"}
              onClick={() => setPhase("cracking")}
            >
              {phase === "cracking" ? "Cracking…" : matured ? "▶ Hatch" : "Incubating…"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ---- small pieces -------------------------------------------------------

function Boot() {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="text-center">
        <EggSprite size={80} className="bob" glow="#f5a623" />
        <p className="pixel-font mt-6 text-xs text-muted">
          Booting exchange<span className="caret" />
        </p>
      </div>
    </main>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`btn btn-sm ${active ? "" : "btn-ghost"}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Metric({ k, v, tone, right }: { k: string; v: string; tone?: "teal"; right?: boolean }) {
  return (
    <div className={right ? "text-right" : ""}>
      <div className={`pixel-font text-sm ${tone === "teal" ? "text-teal" : "text-cream"}`}>{k}</div>
      <div className="eyebrow">{v}</div>
    </div>
  );
}

function SummaryTile({ k, v, tone }: { k: string; v: string; tone?: "balut" }) {
  return (
    <div className="panel p-4">
      <div className={`pixel-font text-sm ${tone === "balut" ? "text-balut" : "text-cream"}`}>{k}</div>
      <div className="eyebrow mt-1">{v}</div>
    </div>
  );
}

function PnL({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className="pixel-font text-sm" style={{ color: up ? "var(--balut)" : "var(--penoy)" }}>
      {up ? "+" : ""}
      {peso(value)}
    </span>
  );
}

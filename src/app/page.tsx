import Link from "next/link";
import { CoinSprite, EggSprite } from "@/components/sprites";
import { Ticker } from "@/components/ticker";
import {
  BALUT_MULT,
  PENOY_MULT,
  compact,
  peso,
  projected,
  seedBatches,
  soldPct,
} from "@/lib/eggcoin";

const batches = seedBatches(0);
const totalEggs = batches.reduce((n, b) => n + b.supply, 0);
const avgHatch = Math.round((batches.reduce((n, b) => n + b.hatchRate, 0) / batches.length) * 100);
const ex = projected(100, 15, 0.8); // worked example: 100 coins, 80% balut

const tickerItems = [
  ...batches.map((b) => `${b.code} ${b.name} · ₱${b.price} · ${Math.round(b.hatchRate * 100)}% HATCH`),
  `BALUT ×${BALUT_MULT}`,
  `PENOY ×${PENOY_MULT}`,
  `${compact(totalEggs)} EGGS BACKED`,
  "LIMITED SUPPLY",
];

const STEPS = [
  { n: "01", t: "Order", d: "A Balutan places a real order with a duck farm. Today: a 3,000-egg batch." },
  { n: "02", t: "Buy EggCoins", d: "Each EggCoin is ₱15 and backed 1:1 by a physical egg in that batch." },
  { n: "03", t: "Incubate", d: "Wait 14–16 days while the batch matures. Watch the odds, not the clock." },
  { n: "04", t: "Hatch", d: "Balut coins pay ×1.20. Penoy / spoilage pay ×0.80. Cash out." },
];

export default function Landing() {
  return (
    <main className="relative">
      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <CoinSprite size={34} />
          <span className="pixel-font text-sm text-yolk">EGGCOIN</span>
        </Link>
        <nav className="flex items-center gap-3">
          <a href="#how" className="eyebrow hidden hover:text-cream sm:inline">
            How it works
          </a>
          <a href="#batches" className="eyebrow hidden hover:text-cream sm:inline">
            Batches
          </a>
          <Link href="/app" className="btn btn-sm">
            Launch App
          </Link>
        </nav>
      </header>

      <Ticker items={tickerItems} />

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="grid-floor pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <span className="chip chip-live mb-5">● Batch #0713 live now</span>
            <h1 className="text-[13vw] leading-[0.95] text-cream sm:text-6xl md:text-7xl">
              Invest in<br />
              the <span className="text-yolk">Hatch</span>
            </h1>
            <p className="mt-6 max-w-md text-2xl text-muted">
              A pixel commodity exchange for duck-egg batches. Buy low, wait for the incubation,
              cash out when they become <span className="text-balut">balut</span>.
              <span className="caret" />
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/app" className="btn">
                ▶ Start trading
              </Link>
              <a href="#how" className="btn btn-ghost">
                How it works
              </a>
            </div>
            <dl className="mt-12 flex flex-wrap gap-8">
              <Stat k={`${compact(totalEggs)}`} v="eggs backed" />
              <Stat k={`${avgHatch}%`} v="avg hatch rate" />
              <Stat k={`+${Math.round((BALUT_MULT - 1) * 100)}%`} v="balut upside" tone="balut" />
            </dl>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="panel panel-raised grid place-items-center p-10">
                <EggSprite size={200} glow="#f5a623" className="bob-slow glow" title="A giant EggCoin egg" />
              </div>
              <div className="chip chip-soon absolute -bottom-4 -left-4">₱15 / coin</div>
              <div className="chip chip-hot absolute -right-4 -top-4">82% odds</div>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead eyebrow="The loop" title="From farm to payout" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="panel p-5">
              <div className="pixel-font text-xs text-yolk">{s.n}</div>
              <h3 className="mt-3 text-base text-cream">{s.t}</h3>
              <p className="mt-2 text-lg text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* payout */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="panel panel-raised p-6 md:p-10">
          <SectionHead eyebrow="The math" title="±20%, decided by the hatch" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <OutcomeCard tone="balut" label="Balut" mult={BALUT_MULT} note="Fertilized & hatched. Your coin is worth more." />
              <OutcomeCard tone="penoy" label="Penoy / Spoil" mult={PENOY_MULT} note="Unfertilized or lost. Your coin takes the hit." />
            </div>
            <div className="panel p-5 font-[family-name:var(--font-body)]">
              <div className="eyebrow mb-3">Worked example</div>
              <Row a="Buy 100 EggCoins @ ₱15" b={peso(ex.cost)} />
              <Row a={`80 turn Balut → ×${BALUT_MULT}`} b={peso(80 * 15 * BALUT_MULT)} tone="balut" />
              <Row a={`20 turn Penoy → ×${PENOY_MULT}`} b={peso(20 * 15 * PENOY_MULT)} tone="penoy" />
              <div className="my-3 border-t border-line" />
              <Row a="Payout" b={peso(ex.value)} big />
              <Row a="Profit" b={`${peso(ex.pnl)} (+${Math.round(ex.roi * 100)}%)`} tone="balut" big />
            </div>
          </div>
        </div>
      </section>

      {/* batches */}
      <section id="batches" className="mx-auto max-w-6xl px-5 py-20">
        <SectionHead eyebrow="Live market" title="Limited batches, real eggs" />
        <div className="grid gap-5 md:grid-cols-3">
          {batches.slice(0, 3).map((b) => {
            const pct = Math.round(soldPct(b) * 100);
            return (
              <div key={b.id} className="panel p-5">
                <div className="flex items-center justify-between">
                  <span className="pixel-font text-xs text-yolk">{b.code}</span>
                  <span className={`chip ${pct > 90 ? "chip-hot" : "chip-live"}`}>{pct > 90 ? "Almost gone" : "Live"}</span>
                </div>
                <h3 className="mt-3 text-lg text-cream">{b.name}</h3>
                <p className="text-base text-muted">{b.farm}</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="pixel-font text-sm text-cream">₱{b.price}</div>
                    <div className="eyebrow">per coin</div>
                  </div>
                  <div className="text-right">
                    <div className="pixel-font text-sm text-teal">{Math.round(b.hatchRate * 100)}%</div>
                    <div className="eyebrow">hatch odds</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="meter">
                    <i style={{ "--v": soldPct(b) } as React.CSSProperties} />
                  </div>
                  <div className="eyebrow mt-2">{pct}% claimed · {compact(b.supply - b.sold)} left</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/app" className="btn btn-teal">
            ▶ Open the exchange
          </Link>
        </div>
      </section>

      <footer className="border-t-4 border-ink bg-ink/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-10 text-center">
          <CoinSprite size={30} />
          <p className="text-lg text-muted">
            Prototype. Demo money, simulated hatches. Not financial advice. Balut is delicious.
          </p>
          <p className="eyebrow">EggCoin · Fintech × Balut</p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "balut" }) {
  return (
    <div>
      <dd className={`pixel-font text-xl ${tone === "balut" ? "text-balut" : "text-cream"}`}>{k}</dd>
      <dt className="eyebrow mt-1">{v}</dt>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <div className="eyebrow text-teal">{eyebrow}</div>
      <h2 className="mt-2 text-2xl text-cream md:text-4xl">{title}</h2>
    </div>
  );
}

function OutcomeCard({ tone, label, mult, note }: { tone: "balut" | "penoy"; label: string; mult: number; note: string }) {
  const color = tone === "balut" ? "text-balut" : "text-penoy";
  return (
    <div className="panel p-4 text-center">
      <EggSprite size={56} className="mx-auto" glow={tone === "balut" ? "#2fae4a" : "#d83a55"} title={label} />
      <div className={`pixel-font mt-3 text-base ${color}`}>×{mult}</div>
      <div className="mt-1 text-base text-cream">{label}</div>
      <p className="mt-2 text-sm text-muted">{note}</p>
    </div>
  );
}

function Row({ a, b, tone, big }: { a: string; b: string; tone?: "balut" | "penoy"; big?: boolean }) {
  const color = tone === "balut" ? "text-balut" : tone === "penoy" ? "text-penoy" : "text-cream";
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className={`text-lg text-muted ${big ? "text-cream" : ""}`}>{a}</span>
      <span className={`${big ? "pixel-font text-sm" : "text-xl"} ${color}`}>{b}</span>
    </div>
  );
}

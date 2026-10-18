# DECISIONS — EggCoin

<!-- Append-only. Why we chose things. Newest at top. -->

- **Payout = ±20% multiplier**, not flat ±₱0.20. Balut coin = price ×1.20, Penoy/spoilage coin = price ×0.80. Matches the written formula `×(1 ± 0.20)`; bigger swings read better in a trading demo. One constant each in `src/lib/eggcoin.ts` — flip there if the flat-centavo model is wanted instead.
- **1 EggCoin = 1 backed physical egg.** Batch supply = physical egg count. Makes scarcity concrete.
- **Demo time is accelerated.** 1 "day" = a few real seconds (`DEMO_DAY_MS`), so a 15-day maturation resolves in ~40s. A ⚡ Fast-forward button hatches instantly. Real calendar days would make the demo unwatchable.
- **No backend.** State in `localStorage` via a tiny `useSyncExternalStore`-based store. Reset button clears it.
- **Pixel/gamified/awwwards direction:** CRT-dark palette, Press Start 2P + VT323 fonts, hard pixel shadows, scanlines, live ticker.

# EggCoin

![License: MIT](https://img.shields.io/badge/license-MIT-green) ![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![React 19](https://img.shields.io/badge/React-19-61dafb) ![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38bdf8) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

A pixel-art, gamified demo of "investing" in duck-egg batches, mixing fintech and commodity-trading ideas. Buy EggCoins in a limited batch at P15 each, wait for the batch to mature, and see it hatch: a balut coin pays x1.20, a penoy/spoiled coin pays x0.80. It is a frontend-only prototype with no real money or backend; state is kept in `localStorage`, and demo time is accelerated (with a fast-forward button).

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Structure

- `src/app/` - landing page (`/`) and the trading demo (`/app`)
- `src/components/` - pixel sprites, live ticker, batch timers
- `src/lib/eggcoin.ts` - batch, pricing and payout constants
- `src/lib/store.ts` - small `localStorage`-backed store

## License

[MIT](LICENSE)

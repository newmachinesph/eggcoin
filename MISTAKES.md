# MISTAKES — EggCoin

<!-- Recurring pitfalls to avoid. Newest at top. -->

- **Hydration mismatch:** never render `Date.now()` / `Math.random()` / localStorage values during SSR. Gate dynamic UI behind a `mounted` flag; store `getServerSnapshot` returns a constant empty state.
- **Next 16 async request APIs** (`cookies`/`headers`/`params`/`searchParams`) are Promises — must `await`. N/A here (client-only), but don't reintroduce a stale sync pattern if a backend is added.

// Seamless marquee. Track is duplicated so the -50% translate loops cleanly.
export function Ticker({ items }: { items: string[] }) {
  const track = [...items, ...items];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {track.map((t, i) => (
          <span key={i} className="text-cream">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

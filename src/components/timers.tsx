"use client";

import { useEffect, useState } from "react";

// Current epoch ms, refreshed on an interval. Returns 0 on the server and the
// first client render so callers can render a stable placeholder (no hydration
// mismatch), then re-render once mounted.
export function useNow(interval = 1000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

// mm:ss countdown to a target epoch. Shows LIVE once reached.
export function DropTimer({ to, className }: { to: number; className?: string }) {
  const now = useNow(1000);
  if (!now) return <span className={className}>--:--</span>;
  const ms = to - now;
  if (ms <= 0) return <span className={className}>LIVE</span>;
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return (
    <span className={className}>
      {mm}:{ss}
    </span>
  );
}

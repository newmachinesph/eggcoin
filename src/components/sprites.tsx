// Pure pixel-art sprites: a char grid → crisp SVG rects. No hooks, no directive
// so they render in Server or Client trees alike.

type PixelProps = {
  rows: string[];
  palette: Record<string, string>;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
};

function Pixels({ rows, palette, size = 96, className, style, title }: PixelProps) {
  const h = rows.length;
  const w = rows[0].length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((c, x) => {
      const fill = palette[c];
      if (!fill) return;
      // 1.02 overdraw removes hairline seams between adjacent rects
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />);
    });
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      className={className}
      style={{ imageRendering: "pixelated", ...style }}
      shapeRendering="crispEdges"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rects}
    </svg>
  );
}

// ---- egg ----------------------------------------------------------------

const EGG = [
  "....KKKK....",
  "...KSSSSK...",
  "..KSSHHSSK..",
  ".KSSHHSSSSK.",
  ".KSHSSSSSSK.",
  "KSSSSSSSSSSK",
  "KSSSSSSSSSSK",
  "KSSSSSSSSSsK",
  "KSSSSSSSSssK",
  "KSSSSSSSsssK",
  "KSSSSSSSsssK",
  "KSSSSSSssssK",
  ".KSSSSSsssK.",
  ".KSSSSssssK.",
  "..KSSssssK..",
  "..KKKKKKKK..",
];

const EGG_PALETTE: Record<string, string> = {
  K: "#0b0812", // outline
  S: "#fdeecb", // shell
  H: "#ffffff", // shine
  s: "#e7cfa0", // shell shadow
};

type EggProps = {
  size?: number;
  glow?: string; // drop-shadow color
  className?: string;
  title?: string;
  tint?: Partial<Record<"S" | "s", string>>; // recolor shell (e.g. muted for spoilage)
};

export function EggSprite({ size = 96, glow, className, title, tint }: EggProps) {
  const palette = tint ? { ...EGG_PALETTE, ...tint } : EGG_PALETTE;
  return (
    <Pixels
      rows={EGG}
      palette={palette}
      size={size}
      className={className}
      title={title ?? "EggCoin"}
      style={glow ? { filter: `drop-shadow(0 4px 0 ${glow})` } : undefined}
    />
  );
}

// ---- coin ---------------------------------------------------------------

const COIN = [
  "...CCCCC...",
  ".CGGGGGGGC.",
  "CGGGGGGGGGC",
  "CGGHGGGGGGC",
  "CGGGGEGGGGC",
  "CGGGEEEGGGC",
  "CGGGGEGGGGC",
  "CGGGGGGGGGC",
  "CGGGGGGGGgC",
  ".CGGGGGGGC.",
  "...CCCCC...",
];

const COIN_PALETTE: Record<string, string> = {
  C: "#0b0812", // rim
  G: "#ffcf3f", // gold
  g: "#f5a623", // gold shadow
  H: "#fff6cf", // shine
  E: "#fdeecb", // egg pip
};

export function CoinSprite({ size = 28, className }: { size?: number; className?: string }) {
  return <Pixels rows={COIN} palette={COIN_PALETTE} size={size} className={className} title="EggCoin token" />;
}

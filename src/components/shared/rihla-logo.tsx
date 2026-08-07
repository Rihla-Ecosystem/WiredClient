"use client";

import Image from "next/image";

// Primary Rihla icon logo — the pyramid "keyhole" mark
export function RihlaGlyph({ size = 28 }: { size?: number }) {
  const w = Math.round(size * 1.25);
  const h = Math.round(w * (1024 / 1536));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Image
        src="/logo.png"
        alt="Rihla Logo"
        width={w}
        height={h}
        style={{ objectFit: "contain", display: "block", maxWidth: "none" }}
        priority
      />
    </div>
  );
}

// Horizontal full logo lockup
export function RihlaLogoFull({ size = 80 }: { size?: number }) {
  const w = Math.round(size * 2.4);
  const h = Math.round(w * (1024 / 1536));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Image
        src="/logo.png"
        alt="Rihla Full Logo"
        width={w}
        height={h}
        style={{ objectFit: "contain", display: "block", maxWidth: "none" }}
        priority
      />
    </div>
  );
}

// Concentric pyramid wireframes — architectural decoration from the logo DNA
export function Geom({
  size = 280,
  color = "#F5EFE0",
  op = 0.06,
}: {
  size?: number;
  color?: string;
  op?: number;
}) {
  const cx = size / 2;
  const ay = size * 0.06;
  const bw = size * 0.9;
  const by = size * 0.96;
  const steps = 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: "block", pointerEvents: "none" }}>
      {Array.from({ length: steps }, (_, i) => {
        const t = (i + 1) / steps;
        const lx = cx - (bw * 0.5) * t;
        const rx = cx + (bw * 0.5) * t;
        const y = ay + (by - ay) * t;
        return (
          <path key={i} d={`M${cx},${ay} L${rx},${y} L${lx},${y} Z`} stroke={color} strokeWidth="0.6" fill="none" opacity={op * (11 - i) * 1.1} />
        );
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6;
        const y = ay + (by - ay) * t;
        const hw = (bw * 0.5) * t;
        return (
          <line key={`h${i}`} x1={cx - hw} y1={y} x2={cx + hw} y2={y} stroke={color} strokeWidth="0.3" opacity={op * 4} />
        );
      })}
    </svg>
  );
}

// Detailed Egyptian pyramid skyline — one great, one mid, one small
export function PyramidSkyline({
  size = 640,
  op = 0.6,
  color = "#E8C57A",
}: {
  size?: number;
  op?: number;
  color?: string;
}) {
  const W = 640;
  const H = 260;
  const h = Math.round(size * (H / W));

  const PYR = [
    { ax: 220, ay: 26, bx: 30, cx: 400, by: 232 },
    { ax: 470, ay: 112, bx: 398, cx: 556, by: 232 },
    { ax: 576, ay: 172, bx: 540, cx: 630, by: 232 },
  ];

  const courses = (p: { ax: number; ay: number; bx: number; cx: number; by: number }, n: number) => {
    const cx = (p.bx + p.cx) / 2;
    const half = (p.cx - p.bx) / 2;
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 1) / n;
      const y = p.ay + (p.by - p.ay) * t;
      const hw = half * t;
      return <line key={i} x1={cx - hw} y1={y} x2={cx + hw} y2={y} stroke={color} strokeWidth={0.7} opacity={0.3 - i * 0.025} />;
    });
  };

  return (
    <svg width={size} height={h} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ display: "block", pointerEvents: "none", opacity: op }}>
      <defs>
        <linearGradient id="pyLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3DFAE" />
          <stop offset="100%" stopColor="#C89A55" />
        </linearGradient>
        <linearGradient id="pyRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C99A55" />
          <stop offset="100%" stopColor="#8A5A2E" />
        </linearGradient>
      </defs>

      <circle cx={222} cy={66} r={46} fill="#F5C040" opacity={0.18} />
      <circle cx={222} cy={66} r={30} fill="#F5C040" opacity={0.22} />

      {PYR.map((p, pi) => {
        const cx = (p.bx + p.cx) / 2;
        return (
          <g key={pi}>
            <polygon points={`${p.ax},${p.ay} ${p.bx},${p.by} ${cx},${p.by}`} fill="url(#pyLeft)" />
            <polygon points={`${p.ax},${p.ay} ${cx},${p.by} ${p.cx},${p.by}`} fill="url(#pyRight)" />
            <line x1={p.ax} y1={p.ay} x2={cx} y2={p.by} stroke={color} strokeWidth={1.1} opacity={0.55} />
            {courses(p, pi === 0 ? 10 : pi === 1 ? 7 : 5)}
            <polygon points={`${p.ax},${p.ay} ${p.ax - 9},${p.ay + 10} ${p.ax + 9},${p.ay + 10}`} fill="#F5C040" opacity={0.85} />
          </g>
        );
      })}

      <path d="M0,238 C80,226 150,246 230,238 C320,228 400,244 470,236 C540,228 600,244 640,236 L640,260 L0,260 Z" fill="#C89A55" opacity={0.5} />
      <path d="M0,248 C110,240 200,252 320,246 C440,240 540,252 640,244 L640,260 L0,260 Z" fill="#8A5A2E" opacity={0.45} />
    </svg>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Rubik_Pixels } from 'next/font/google';

const pixelFont = Rubik_Pixels({ weight: '400', subsets: ['hebrew', 'latin'], display: 'swap' });

// Pixel-art scooter courier. Each char is one pixel; '.' is empty.
const SCOOTER = [
  '..........YYYY......',
  '.........YYYYYY.....',
  '.........YYCCYY.....',
  '..OOOOO...SSSS......',
  '..OOOOO..PPPPPP.....',
  '..OWOWO..PPPPPP..G..',
  '..OOOOO...PPPP...G..',
  '..OOOOORRRRRRRRRRG..',
  '...RRRRRRRRRRRRRRR..',
  '..KKK..........KKK..',
  '.KWWWK........KWWWK.',
  '.KWKWK........KWKWK.',
  '.KWWWK........KWWWK.',
  '..KKK..........KKK..',
];

const PALETTE: Record<string, string> = {
  Y: '#FACC15', // helmet
  C: '#22D3EE', // visor
  S: '#FDBA74', // face
  P: '#A855F7', // jacket
  O: '#F97316', // delivery box
  W: '#F8FAFC',
  R: '#EC4899', // scooter body
  G: '#94A3B8', // handlebar
  K: '#0F172A', // tyres / outline
};

function PixelSprite({ rows, size }: { rows: string[]; size: number }) {
  return (
    <svg
      width={rows[0].length * size}
      height={rows.length * size}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PALETTE[ch]} />,
        ),
      )}
    </svg>
  );
}

// Deterministic pixel skyline, drawn twice so it can scroll seamlessly.
const BUILDING_COLORS = ['#1E3A8A', '#312E81', '#4C1D95', '#1E40AF', '#3730A3'];
const BUILDINGS = Array.from({ length: 12 }, (_, i) => ({
  w: 5 + ((i * 7) % 4),
  h: 8 + ((i * 13) % 11),
  color: BUILDING_COLORS[i % BUILDING_COLORS.length],
}));

function Skyline() {
  let x = 0;
  const blocks = BUILDINGS.map((b, i) => {
    const bx = x;
    x += b.w + 1;
    return (
      <g key={i}>
        <rect x={bx} y={24 - b.h} width={b.w} height={b.h} fill={b.color} />
        {Array.from({ length: Math.floor(b.h / 3) }, (_, r) =>
          Array.from({ length: Math.floor(b.w / 2) }, (_, c) =>
            (r + c + i) % 3 === 0 ? (
              <rect key={`${r}-${c}`} x={bx + 1 + c * 2} y={24 - b.h + 1 + r * 3} width={1} height={1} fill="#FDE047" />
            ) : null,
          ),
        )}
      </g>
    );
  });
  const width = x;
  return (
    <div className="pixel-skyline absolute bottom-[22px] left-0 flex" style={{ width: width * 8 * 2 }}>
      {[0, 1].map((copy) => (
        <svg key={copy} width={width * 8} height={24 * 8} viewBox={`0 0 ${width} 24`} shapeRendering="crispEdges" aria-hidden>
          {blocks}
        </svg>
      ))}
    </div>
  );
}

const STARS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 23) % 45,
  color: ['#F472B6', '#22D3EE', '#FACC15', '#A3E635'][i % 4],
  delay: (i % 6) * 0.35,
}));

const MESSAGES = [
  'שולחים הודעה לשליחים באזור',
  'השליחים בודקים את ההזמנה',
  'ממתינים שמישהו יגיד "אני לוקח!"',
  'עוד רגע וזה אצלך',
];

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function PixelCourierSearch({ since }: { since?: string }) {
  const [now, setNow] = useState(() => Date.now());
  const [startedAt] = useState(() => (since ? new Date(since).getTime() : Date.now()));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = now - startedAt;
  const message = MESSAGES[Math.floor(elapsed / 3500) % MESSAGES.length];

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Pixel screen */}
      <div
        className="relative w-full max-w-[340px] h-[230px] overflow-hidden rounded-xl border-4 border-[#0B1222]"
        style={{
          background: 'linear-gradient(180deg, #0B1026 0%, #1B1446 55%, #3B1A5A 100%)',
          boxShadow: '0 0 0 4px #1E293B, 0 0 40px rgba(168,85,247,0.35)',
          imageRendering: 'pixelated',
        }}
      >
        {STARS.map((s, i) => (
          <span
            key={i}
            className="pixel-star absolute w-1 h-1"
            style={{ left: `${s.left}%`, top: `${s.top}%`, background: s.color, animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Pixel moon */}
        <span className="absolute top-4 left-5 w-6 h-6 bg-[#FDE68A]" style={{ boxShadow: '4px 4px 0 0 #FCD34D' }} />

        <Skyline />

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-[22px] bg-[#111827]">
          <div className="pixel-road absolute top-[9px] left-0 h-1 w-[200%]" />
        </div>

        {/* Courier */}
        <div className="pixel-bob absolute bottom-[14px] left-1/2 -translate-x-1/2">
          <div className="relative">
            <span className="pixel-speed absolute top-[40px] -left-6 w-4 h-1 bg-cyan-300" />
            <span className="pixel-speed absolute top-[56px] -left-10 w-6 h-1 bg-pink-400" style={{ animationDelay: '0.15s' }} />
            <span className="pixel-speed absolute top-[72px] -left-7 w-5 h-1 bg-yellow-300" style={{ animationDelay: '0.3s' }} />
            <PixelSprite rows={SCOOTER} size={5} />
          </div>
        </div>

        {/* Scanline overlay for the retro screen feel */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)' }}
        />
      </div>

      <div className="text-center">
        <p className={`${pixelFont.className} pixel-rainbow text-[32px] leading-tight`}>מחפשים שליח בשבילך</p>
        <p className="text-slate-300 text-sm mt-2 min-h-[1.25rem]">{message}</p>
      </div>

      {/* Elapsed timer */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2">
        <span className="pixel-blink w-2 h-2 bg-emerald-400" />
        <span className="text-white text-lg font-mono font-bold tabular-nums tracking-widest" dir="ltr">{formatElapsed(elapsed)}</span>
      </div>

      <style>{`
        .pixel-skyline { animation: pixel-scroll 14s steps(56) infinite; }
        .pixel-road {
          background: repeating-linear-gradient(90deg, #FACC15 0 16px, transparent 16px 32px);
          animation: pixel-scroll 0.8s steps(8) infinite;
        }
        @keyframes pixel-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .pixel-bob { animation: pixel-bob 0.4s steps(2) infinite; }
        @keyframes pixel-bob { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -3px); } }
        .pixel-speed { animation: pixel-speed 0.45s steps(3) infinite; }
        @keyframes pixel-speed { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-18px); opacity: 0; } }
        .pixel-star { animation: pixel-twinkle 1.6s steps(2) infinite; }
        @keyframes pixel-twinkle { 50% { opacity: 0.15; } }
        .pixel-blink { animation: pixel-twinkle 1s steps(2) infinite; }
        .pixel-rainbow {
          background: linear-gradient(90deg, #F472B6, #FACC15, #4ADE80, #22D3EE, #A78BFA, #F472B6);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: pixel-hue 3s steps(12) infinite;
        }
        @keyframes pixel-hue { to { background-position: 200% 0; } }
        @media (prefers-reduced-motion: reduce) {
          .pixel-skyline, .pixel-road, .pixel-bob, .pixel-speed, .pixel-star, .pixel-blink, .pixel-rainbow { animation: none; }
        }
      `}</style>
    </div>
  );
}

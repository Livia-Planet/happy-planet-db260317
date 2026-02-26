import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  bpm: number;
  themeColor: string;
  meteorDensity?: number;
}

// Hand‑drawn neon star shapes and one surprise comet. V5 stylistic rewrite.
export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  bpm,
  themeColor,
  meteorDensity = 5,
}) => {
  const beat = 60 / Math.max(1, bpm); // seconds per beat

  // star count between 58 and 128
  const starCount = Math.floor(15 + Math.random() * 8);

  // color pool (rgba/hsla friendly)
  const colorPool = [
    'rgba(255,99,132,VAR)', // red
    'rgba(255,159,64,VAR)', // orange
    'rgba(255,205,86,VAR)', // yellow
    'rgba(75,192,192,VAR)', // green-cyan
    'rgba(54,162,235,VAR)', // blue
    'rgba(153,102,255,VAR)', // purple
    'rgba(255,102,204,VAR)', // pink
    'rgba(0,0,0,VAR)', // black
    'rgba(255,255,255,VAR)', // white
  ];

  // different doodle path templates (rough, hand-drawn like)
  const starPaths = {
    four: 'M50 8 L64 46 L92 54 L66 74 L76 96 L50 82 L24 96 L34 74 L8 54 L36 46 Z',
    cross: 'M50 6 L54 44 L92 50 L54 56 L50 94 L46 56 L8 50 L46 44 Z',
    sext: 'M50 5 L60 30 L85 35 L65 55 L75 80 L50 65 L25 80 L35 55 L15 35 L40 30 Z',
    five: 'M50 10 L61 38 L92 38 L67 58 L78 88 L50 68 L22 88 L33 58 L8 38 L39 38 Z',
  } as const;

  // Generate stars with organic randomness; depend on bpm so change when music changes
  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => {
      const left = 6 + Math.random() * 88; // padding to keep balanced
      const top = 6 + Math.random() * 88;
      const size = 15 + Math.random() * 30; // 15 - 45 px
      const strokeWidth = 1.5 + Math.random() * 2; // 1.5 - 3.5
      const alpha = 0.4 + Math.random() * 0.3; // 0.4 - 0.7
      const colorTemplate = colorPool[Math.floor(Math.random() * colorPool.length)];
      const color = colorTemplate.replace('VAR', alpha.toFixed(2));
      const delay = Math.random() * (beat * 2.5 + 4); // fully random delays
      const baseDuration = beat * (0.9 + Math.random() * 1.6); // bpm-linked
      const rotible = Math.random() < 0.18; // ~18% rotate
      const rotDelta = (Math.random() * 20 + 6) * (Math.random() < 0.5 ? -1 : 1); // ±6-26deg
      const initialRotate = Math.random() * 360;
      const pathKeys = Object.keys(starPaths);
      const shapeKey = pathKeys[Math.floor(Math.random() * pathKeys.length)] as keyof typeof starPaths;
      return {
        id: `s-${i}-${Math.random().toString(36).slice(2,7)}`,
        left,
        top,
        size,
        strokeWidth,
        color,
        delay,
        duration: baseDuration,
        rotible,
        rotDelta,
        initialRotate,
        path: starPaths[shapeKey],
      };
    });
  }, [bpm]);

  // Surprise comet: very infrequent, fast and long fan-shaped tail
  const comet = useMemo(() => {
    const appearDelay = 10 + Math.random() * 20; // 10s - 30s (rare)
    const travel = 0.6 + Math.random() * 0.2; // 0.6 - 0.8s (very quick)
    const startLeft = 105 + Math.random() * 20; // start off-screen right
    const startTop = -20 + Math.random() * 30; // slightly above
    const tailLength = 250 + Math.random() * 50; // 250 - 300 px
    const color = '#FFFBEB'; // creamy white for high-end look
    return { id: `comet-${Math.random().toString(36).slice(2,8)}`, appearDelay, travel, startLeft, startTop, tailLength, color };
  }, [bpm]);

  // Container-level subtle paper ink bloom
  return (
    <div
      className="fixed inset-0 z-5 pointer-events-none overflow-hidden"
      style={{
        filter: 'blur(0.3px)',
        // expose beat for potential CSS usage
        ['--beat-duration' as any]: `${beat}s`,
      } as React.CSSProperties}
    >
      <style>{`
        /* V5 doodle neon star animations */
        @keyframes doodle-breath {
          0% { transform: translate(-50%,-50%) rotate(var(--initial)) scale(calc(var(--scale) * 0.92)); opacity: calc(var(--alpha) * 0.85); }
          50% { transform: translate(-50%,-50%) rotate(calc(var(--initial) + var(--rot-delta))) scale(calc(var(--scale) * 1.18)); opacity: calc(var(--alpha) * 1.15); }
          100% { transform: translate(-50%,-50%) rotate(var(--initial)) scale(calc(var(--scale) * 0.92)); opacity: calc(var(--alpha) * 0.85); }
        }

        @keyframes comet-travel {
          0% { transform: translate(0,0) rotate(-45deg); opacity: 1; }
          100% { transform: translate(-140vw,140vh) rotate(-45deg); opacity: 0; }
        }

        .doodle-star {
          position: absolute;
          width: var(--size);
          height: var(--size);
          left: calc(var(--left) * 1%);
          top: calc(var(--top) * 1%);
          transform-origin: 50% 50%;
          animation: doodle-breath var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
          mix-blend-mode: screen;
        }

        .doodle-star svg { display:block; width:100%; height:100%; }

        /* comet styling */
        .comet {
          position: absolute;
          left: var(--start-left);
          top: var(--start-top);
          pointer-events: none;
          filter: blur(1.5px) drop-shadow(0 0 8px rgba(255,255,255,0.6));
          will-change: transform, opacity;
        }

        .comet svg { overflow: visible; display:block; }

        .comet .comet-head {
          transform-origin: center;
        }
      `}</style>

      {/* Stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="doodle-star"
          style={{
            ['--left' as any]: s.left.toFixed(2),
            ['--top' as any]: s.top.toFixed(2),
            ['--size' as any]: `${s.size}px`,
            ['--scale' as any]: `${s.size / 30}`,
            ['--alpha' as any]: `${parseFloat((s.color.match(/,(\d?\.\d+)\)$/)?.[1] || '0.6'))}`,
            ['--delay' as any]: `${s.delay}s`,
            ['--dur' as any]: `${s.duration}s`,
            ['--initial' as any]: `${s.initialRotate}deg`,
            ['--rot-delta' as any]: `${s.rotDelta}deg`,
            ['--stroke' as any]: s.color,
            ['--stroke-width' as any]: `${s.strokeWidth}px`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 100 100" fill="none" stroke={s.color} strokeWidth={s.strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d={s.path} />
          </svg>
        </div>
      ))}

      {/* Surprise Comet (rare, quick) rendered as a fan-shaped SVG tail + tiny head */}
      <div
        className="comet"
        style={{
          ['--start-left' as any]: `${comet.startLeft}%`,
          ['--start-top' as any]: `${comet.startTop}%`,
          animation: `comet-travel ${comet.travel}s ease-in-out ${comet.appearDelay}s 1 forwards`,
        } as React.CSSProperties}
      >
        <svg
          width={comet.tailLength}
          height={28}
          viewBox={`0 0 ${comet.tailLength} 28`}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id={`grad-${comet.id}`} x1="0" x2="1">
              <stop offset="0%" stopColor={comet.color} stopOpacity="0.8" />
              <stop offset="60%" stopColor={comet.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={comet.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fan-shaped tapered tail drawn as a rounded triangular path with slight curve */}
          <path
            d={`M0 14 Q ${comet.tailLength * 0.12} 6 ${comet.tailLength} 2 L ${comet.tailLength} 26 Q ${comet.tailLength * 0.12} 22 0 14 Z`}
            fill={`url(#grad-${comet.id})`}
          />

          {/* Tiny head dot (2px radius) */}
          <circle className="comet-head" cx={4} cy={14} r={2} fill={comet.color} />
        </svg>
      </div>
    </div>
  );
};

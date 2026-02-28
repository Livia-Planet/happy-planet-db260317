import React, { useMemo } from 'react';

interface SpaceBackgroundProps {
  bpm: number;
  themeColor: string;
  meteorDensity?: number;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
  bpm,
  themeColor,
  meteorDensity = 5,
}) => {
  const beat = 60 / Math.max(1, bpm);

  // --- [ADD] 新增：微型背景星尘的数据生成 ---
  const stardustCount = 50; // 星尘数量
  const backgroundStardust = useMemo(() => {
    return Array.from({ length: stardustCount }).map((_, i) => ({
      id: `dust-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 1.5, // 1px - 2.5px 极小
      delay: Math.random() * (beat * 2),
      duration: beat * (1.5 + Math.random() * 1), // 呼吸频率略慢于主节奏，更有深邃感
    }));
  }, [bpm]);

  // 原有的霓虹星数据生成 (保持不变)
  const starCount = Math.floor(15 + Math.random() * 8);
  const colorPool = [
    'rgba(255,99,132,VAR)', 'rgba(255,159,64,VAR)', 'rgba(255,205,86,VAR)',
    'rgba(75,192,192,VAR)', 'rgba(54,162,235,VAR)', 'rgba(153,102,255,VAR)',
    'rgba(255,102,204,VAR)', 'rgba(0,0,0,VAR)', 'rgba(255,255,255,VAR)',
  ];

  const starPaths = {
    four: 'M50 8 L64 46 L92 54 L66 74 L76 96 L50 82 L24 96 L34 74 L8 54 L36 46 Z',
    cross: 'M50 6 L54 44 L92 50 L54 56 L50 94 L46 56 L8 50 L46 44 Z',
    sext: 'M50 5 L60 30 L85 35 L65 55 L75 80 L50 65 L25 80 L35 55 L15 35 L40 30 Z',
    five: 'M50 10 L61 38 L92 38 L67 58 L78 88 L50 68 L22 88 L33 58 L8 38 L39 38 Z',
  } as const;

  const stars = useMemo(() => {
    return Array.from({ length: starCount }).map((_, i) => {
      const left = 6 + Math.random() * 88;
      const top = 6 + Math.random() * 88;
      const size = 15 + Math.random() * 30;
      const strokeWidth = 1.5 + Math.random() * 2;
      const alpha = 0.4 + Math.random() * 0.3;
      const colorTemplate = colorPool[Math.floor(Math.random() * colorPool.length)];
      const color = colorTemplate.replace('VAR', alpha.toFixed(2));
      const delay = Math.random() * (beat * 2.5 + 4);
      const baseDuration = beat * (0.9 + Math.random() * 1.6);
      const rotible = Math.random() < 0.18;
      const rotDelta = (Math.random() * 20 + 6) * (Math.random() < 0.5 ? -1 : 1);
      const initialRotate = Math.random() * 360;
      const pathKeys = Object.keys(starPaths);
      const shapeKey = pathKeys[Math.floor(Math.random() * pathKeys.length)] as keyof typeof starPaths;
      return {
        id: `s-${i}-${Math.random().toString(36).slice(2,7)}`,
        left, top, size, strokeWidth, color, delay, duration: baseDuration,
        rotible, rotDelta, initialRotate, path: starPaths[shapeKey],
      };
    });
  }, [bpm]);

  const comet = useMemo(() => {
    const appearDelay = 10 + Math.random() * 20;
    const travel = 0.6 + Math.random() * 0.2;
    const startLeft = 105 + Math.random() * 20;
    const startTop = -20 + Math.random() * 30;
    const tailLength = 250 + Math.random() * 50;
    const color = '#FFFBEB';
    return { id: `comet-${Math.random().toString(36).slice(2,8)}`, appearDelay, travel, startLeft, startTop, tailLength, color };
  }, [bpm]);

  return (
    <div
      className="fixed inset-0 z-5 pointer-events-none overflow-hidden"
      style={{
        filter: 'blur(0.3px)',
        ['--beat-duration' as any]: `${beat}s`,
      } as React.CSSProperties}
    >
      <style>{`
        /* --- [ADD] 新增：星尘呼吸动画 --- */
        @keyframes stardust-breath {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        .stardust {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: stardust-breath var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        /* 原有动画 (保持不变) */
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

        .comet {
          position: absolute;
          left: var(--start-left);
          top: var(--start-top);
          pointer-events: none;
          filter: blur(1.5px) drop-shadow(0 0 8px rgba(255,255,255,0.6));
          will-change: transform, opacity;
        }
        .comet svg { overflow: visible; display:block; }
        .comet .comet-head { transform-origin: center; }
      `}</style>

      {/* --- [ADD] 新增渲染：底层星尘 (放在 Stars 之前以确保在底层) --- */}
      {backgroundStardust.map((d) => (
        <div
          key={d.id}
          className="stardust"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            ['--delay' as any]: `${d.delay}s`,
            ['--dur' as any]: `${d.duration}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Stars (原封不动) */}
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

      {/* Surprise Comet (原封不动) */}
      <div
        className="comet"
        style={{
          ['--start-left' as any]: `${comet.startLeft}%`,
          ['--start-top' as any]: `${comet.startTop}%`,
          animation: `comet-travel ${comet.travel}s ease-in-out ${comet.appearDelay}s 1 forwards`,
        } as React.CSSProperties}
      >
        <svg width={comet.tailLength} height={28} viewBox={`0 0 ${comet.tailLength} 28`} xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id={`grad-${comet.id}`} x1="0" x2="1">
              <stop offset="0%" stopColor={comet.color} stopOpacity="0.8" />
              <stop offset="60%" stopColor={comet.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={comet.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M0 14 Q ${comet.tailLength * 0.12} 6 ${comet.tailLength} 2 L ${comet.tailLength} 26 Q ${comet.tailLength * 0.12} 22 0 14 Z`} fill={`url(#grad-${comet.id})`} />
          <circle className="comet-head" cx={4} cy={14} r={2} fill={comet.color} />
        </svg>
      </div>
    </div>
  );
};
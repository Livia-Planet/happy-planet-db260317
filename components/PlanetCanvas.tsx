import React, { useRef, useEffect } from 'react';
import { PlanetCategory, Language } from '../types';
import { PLANET_PARTS_DB } from '../data/parts';
import { TRANSLATIONS } from '../utils/gameLogic';

interface PlanetCanvasProps {
  parts: Record<PlanetCategory, string>;
  uniqueId: string;
  lang: Language;
}

export const PlanetCanvas: React.FC<PlanetCanvasProps> = ({ parts, uniqueId, lang }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const CX = W / 2;
    const CY = H / 2;

    // --- HELPER: COLORS & LOGIC ---
    const getBaseColor = (id: string) => {
      if (id.includes('red')) return '#EF4444';   // Red-500
      if (id.includes('blue')) return '#3B82F6';  // Blue-500
      if (id.includes('green')) return '#10B981'; // Emerald-500
      if (id.includes('yellow')) return '#F59E0B';// Amber-500
      return '#6B7280'; // Gray
    };

    const getGlowColor = (id: string) => {
      if (id.includes('red')) return '#FCA5A5';
      if (id.includes('blue')) return '#93C5FD';
      if (id.includes('green')) return '#6EE7B7';
      if (id.includes('yellow')) return '#FDE68A';
      return '#FFFFFF';
    };

    const loadImage = (src: string | undefined): Promise<HTMLImageElement | null> => {
      if (!src) return Promise.resolve(null);
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          // console.warn(`Image failed to load: ${src}`); 
          // Resolve null to trigger fallback rendering
          resolve(null);
        };
      });
    };

    const render = async () => {
      // 1. BACKGROUND: Deep Space Gradient (Always Redraws)
      const gradient = ctx.createRadialGradient(CX, CY, 50, CX, CY, H);
      gradient.addColorStop(0, '#1E293B'); // Slate 800
      gradient.addColorStop(0.5, '#0F172A'); // Slate 900
      gradient.addColorStop(1, '#020617'); // Slate 950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // 2. SPACE DUST (Randomized per render, keeps the 'alive' feel)
      const generateStars = (count: number) => {
        ctx.fillStyle = 'white';
        for (let i = 0; i < count; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          const size = Math.random() * 1.5;
          const alpha = Math.random() * 0.7 + 0.1;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      };
      generateStars(80);

      // 3. LOAD ASSETS (Parallel)
      const baseDef = PLANET_PARTS_DB[parts.base];
      const surfDef = PLANET_PARTS_DB[parts.surface];
      const atmoDef = PLANET_PARTS_DB[parts.atmosphere];
      const logoUrl = 'https://raw.githubusercontent.com/Livia-Planet/my-images/main/img/Character%20Generator-logo400x400.png';

      const [baseImg, surfImg, atmoImg, logoImg] = await Promise.all([
        loadImage(baseDef?.images.main),
        loadImage(surfDef?.images.main),
        loadImage(atmoDef?.images.main),
        loadImage(logoUrl)
      ]);

      // Planet Metrics
      const planetSize = 250; // Width/Height
      const r = planetSize / 2;
      const planetX = CX - r;
      const planetY = CY - r - 20;
      const centerX = planetX + r;
      const centerY = planetY + r;

      // --- LAYER 1: BASE (BAS) ---
      if (parts.base !== 'planet_base_none') {
        ctx.save();
        // Apply Outer Glow (Atmosphere-like)
        ctx.shadowColor = getGlowColor(parts.base);
        ctx.shadowBlur = 50;
        
        if (baseImg) {
          ctx.drawImage(baseImg, planetX, planetY, planetSize, planetSize);
        } else {
          // Fallback: Procedural Planet Sphere
          ctx.beginPath();
          ctx.arc(centerX, centerY, r - 5, 0, Math.PI * 2);
          const planetGrad = ctx.createRadialGradient(centerX - 40, centerY - 40, 10, centerX, centerY, r);
          planetGrad.addColorStop(0, getGlowColor(parts.base)); // Highlight
          planetGrad.addColorStop(1, getBaseColor(parts.base)); // Base
          ctx.fillStyle = planetGrad;
          ctx.fill();
        }
        ctx.restore(); // Remove shadow for next layers
      }

      // --- LAYER 2: SURFACE (YTA) ---
      if (parts.surface !== 'planet_surf_none') {
        // Clip to planet circle so surface doesn't spill
        // Even if base is none, we assume the surface floats in the same spherical area
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, r - 5, 0, Math.PI * 2);
        ctx.clip();

        if (surfImg) {
          ctx.drawImage(surfImg, planetX, planetY, planetSize, planetSize);
        } else {
          // Fallback Procedural Surface with Universal Randomization
          if (parts.surface.includes('craters')) {
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            // Randomized Craters
            const craterCount = 8;
            for(let i=0; i<craterCount; i++) {
               const angle = Math.random() * Math.PI * 2;
               // Distribute within circle (sqrt helps uniform area)
               const dist = Math.sqrt(Math.random()) * (r - 15);
               const x = centerX + Math.cos(angle) * dist;
               const y = centerY + Math.sin(angle) * dist;
               const size = 10 + Math.random() * 20;
               
               ctx.beginPath();
               ctx.arc(x, y, size, 0, Math.PI * 2);
               ctx.fill();
            }
          } else if (parts.surface.includes('swirls')) {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 12; 
            
            // Randomized Swirls
            const swirlCount = 5;
            for (let i = 0; i < swirlCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.sqrt(Math.random()) * (r - 20);
                const sx = centerX + Math.cos(angle) * dist;
                const sy = centerY + Math.sin(angle) * dist;
                
                const scale = 0.6 + Math.random() * 0.8;
                const rot = Math.random() * Math.PI * 2;
                
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(rot);
                ctx.scale(scale, scale);
                
                ctx.beginPath();
                // Draw a simple s-curve or loop relative to center
                ctx.moveTo(-30, 0);
                ctx.bezierCurveTo(-15, -30, 15, 30, 30, 0);
                ctx.stroke();
                ctx.restore();
            }
          }
        }
        ctx.restore();
      }

      // --- LAYER 3: ATMOSPHERE (ATMOS) ---
      // Note: Rings might extend outside the planet clip, so we draw them after restore()
      if (atmoImg) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(atmoImg, planetX, planetY, planetSize, planetSize);
        ctx.restore();
      } else {
        // Fallback Procedural Atmos
        if (parts.atmosphere.includes('rings')) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, r + 40, 20, Math.PI / 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.restore();
        } else if (parts.atmosphere.includes('glow')) {
          ctx.save();
          const glow = ctx.createRadialGradient(centerX, centerY, r, centerX, centerY, r + 40);
          glow.addColorStop(0, 'rgba(255,255,255,0.3)');
          glow.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
      }

      // --- LAYER 4: LOGO STAMP ---
      if (logoImg) {
        const logoSize = 130;
        const lx = CX - logoSize / 2;
        const ly = centerY - logoSize / 2;
        
        ctx.save();
        // UPDATED: Transparency 0.7 and Multiply mode for ink-stamp look
        ctx.globalAlpha = 0.7; 
        ctx.globalCompositeOperation = 'multiply'; 
        
        // Draw Image
        ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
        
        // REMOVED: The white stroke ring to avoid "white border" look
        
        ctx.restore();
      }

      // --- LAYER 5: UI (Barcode & ID) ---
      const footerY = H - 90;

      // Glowing Barcode
      ctx.save();
      ctx.shadowColor = '#4D96FF';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      const barcodeW = 180;
      const barcodeH = 20;
      const startX = CX - barcodeW / 2;
      
      let currentX = startX;
      // Use a seeded random or consistent pattern if we want it static, 
      // but randomizing per render gives a cool "scanning" effect.
      while (currentX < startX + barcodeW) {
         const width = Math.random() > 0.6 ? 3 : 1;
         const gap = Math.random() > 0.5 ? 3 : 2;
         ctx.fillRect(currentX, footerY, width, barcodeH);
         currentX += width + gap;
      }
      ctx.restore();

      // Text Info
      ctx.textAlign = 'center';
      
      // ID
      ctx.font = 'bold 13px "Fredoka", sans-serif';
      ctx.fillStyle = '#60A5FA'; // Light Blue
      ctx.fillText(uniqueId, CX, footerY + 40);

      // Label
      ctx.font = '10px "Patrick Hand", cursive';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(TRANSLATIONS.idTitle[lang].toUpperCase(), CX, footerY + 55);
    };

    render();
  }, [parts, uniqueId, lang]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black">
      {/* Main Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        width={340} 
        height={480} 
        className="absolute inset-0 w-full h-full object-cover z-10"
      />
      
      {/* LAYER 6: COMPANION OVERLAY (CSS Animation) */}
      {/* This layer sits ON TOP of the canvas */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
         
         {/* MOON: Orbit Animation */}
         {parts.companion === 'planet_comp_moon' && (
             <div className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 animate-orbit">
                <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-md filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    <circle cx="25" cy="25" r="22" fill="#E5E7EB" stroke="black" strokeWidth="3" />
                    <circle cx="15" cy="18" r="5" fill="rgba(0,0,0,0.1)" />
                    <circle cx="32" cy="30" r="3" fill="rgba(0,0,0,0.1)" />
                </svg>
             </div>
         )}
         
         {/* UFO: Float Animation */}
         {parts.companion === 'planet_comp_ufo' && (
             <div className="absolute top-1/2 left-1/2 w-16 h-12 -ml-8 -mt-6 animate-float">
                 <svg viewBox="0 0 60 40" className="w-full h-full drop-shadow-md filter drop-shadow-[0_0_8px_rgba(77,150,255,0.6)]">
                    <path d="M15 20 A 15 15 0 0 1 45 20" fill="#60A5FA" stroke="white" strokeWidth="3" />
                    <ellipse cx="30" cy="20" rx="28" ry="10" fill="#9CA3AF" stroke="white" strokeWidth="3" />
                    <circle cx="15" cy="20" r="3" fill="#FCD34D" />
                    <circle cx="30" cy="24" r="3" fill="#FCD34D" />
                    <circle cx="45" cy="20" r="3" fill="#FCD34D" />
                 </svg>
             </div>
         )}
      </div>

      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(60px, -70px); }
          50% { transform: translate(60px, -85px); }
        }
        .animate-orbit { animation: orbit 12s linear infinite; }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
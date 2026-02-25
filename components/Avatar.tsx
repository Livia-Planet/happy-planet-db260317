import React, { useRef, useEffect } from 'react';
import { PartCategory } from '../types';
import { PARTS_DB } from '../data/parts';

interface AvatarProps {
  selectedParts: Record<PartCategory, string>;
  dominantStat: 'mod' | 'bus' | 'klurighet';
  className?: string;
  transparent?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ selectedParts, dominantStat, className = "", transparent = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background color mapping
  const bgColors = {
    mod: 'bg-[#FEE2E2]',      // Pale Red
    bus: 'bg-[#FEF9C3]',      // Pale Yellow/Lime
    klurighet: 'bg-[#E0F2FE]' // Pale Blue
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scaling and Positioning Constants
    const SCALE = 1.1; // Zoom in by 10%
    const SCALED_W = canvas.width * SCALE;
    const SCALED_H = canvas.height * SCALE;
    const OFFSET_X = (canvas.width - SCALED_W) / 2; // Center horizontally
    const OFFSET_Y = 15; // Shift down slightly so ears don't clip the top curve, but head is high


    // Helper to load and draw an image
    const drawLayer = (src: string | undefined, x: number, y: number): Promise<void> => {
      if (!src) return Promise.resolve();
      return new Promise((resolve) => {
        const img = new Image();
        // Use encodeURI to handle spaces and special characters in URLs
        const finalSrc = src.startsWith('http') ? encodeURI(decodeURI(src)) : src;
        img.src = finalSrc;
        img.crossOrigin = "anonymous"; // Important for saving
        img.onload = () => {
          // Apply Scale and Offsets
          ctx.drawImage(
            img,
            OFFSET_X + x,
            OFFSET_Y + y,
            SCALED_W,
            SCALED_H
          );
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${finalSrc}`);
          resolve(); // Resolve anyway to continue drawing other layers
        };
      });
    };

    const renderStack = async () => {

      // Fetch parts definition
      const ears = PARTS_DB[selectedParts.ears];
      const body = PARTS_DB[selectedParts.body];
      const face = PARTS_DB[selectedParts.face];
      const hair = PARTS_DB[selectedParts.hair];
      const access = PARTS_DB[selectedParts.access];

      // --- LAYER 0: ACCESSORIES BACK (e.g. Helmet Back) ---
      if (access?.images.back) {
        await drawLayer(access.images.back, 0, 0);
      }

      // --- LAYER 1: HAIR BACK (e.g. Braids) ---
      if (hair?.images.back) {
        await drawLayer(hair.images.back, 0, 0);
      }

      // --- LAYER 2: EARS ---
      if (ears?.images.main) {
        await drawLayer(ears.images.main, 0, 0);
      }

      // --- LAYER 3: BODY ---
      if (body?.images.main) {
        await drawLayer(body.images.main, 0, 0);
      }

      // --- LAYER 4: FACE (Eyes/Mouth) ---
      if (face?.images.main) {
        await drawLayer(face.images.main, 0, 0);
      }

      // --- LAYER 5: HAIR FRONT ---
      if (hair?.images.front) {
        await drawLayer(hair.images.front, 0, 0);
      }

      // --- LAYER 6: ACCESSORIES FRONT ---
      if (access?.images.front) {
        // Apply offsetY if defined
        const layerOffsetY = access.offsetY || 0;
        await drawLayer(access.images.front, 0, layerOffsetY);
      }
    };

    renderStack();

  }, [selectedParts]);

  return (
    <div className={`w-40 h-40 border-4 border-black rounded-[80px_80px_20px_20px] flex items-center justify-center relative overflow-hidden shadow-[inset_0_10px_20px_rgba(255,255,255,0.5),inset_0_-5px_15px_rgba(0,0,0,0.05)] transition-colors duration-500 ${transparent ? 'bg-transparent' : bgColors[dominantStat]} [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] ${className}`}>

      {/* The HTML5 Canvas Element */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full relative z-10"
      />

      {/* Glossy overlay */}
      <div className="absolute top-4 right-6 w-4 h-4 rounded-full bg-white opacity-40 pointer-events-none z-20"></div>
    </div>
  );
};
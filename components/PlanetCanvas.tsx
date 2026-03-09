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
      if (id.includes('red')) return '#EF4444';   // Magma Red
      if (id.includes('blue')) return '#3B82F6';  // Ice/Ocean Blue
      if (id.includes('green')) return '#10B981'; // Jungle Green
      if (id.includes('yellow')) return '#F59E0B';// Desert Yellow
      if (id.includes('purple')) return '#8B5CF6'; // Nebula Purple (新)
      if (id.includes('white')) return '#F3F4F6';  // Diamond White (新)
      if (id.includes('black')) return '#111827';  // Void Black (新)
      if (id.includes('gold')) return '#FCD34D';   // Cyber Gold (新)
      return '#6B7280'; // Gray Fallback
    };

    const getGlowColor = (id: string) => {
      if (id.includes('red')) return '#FCA5A5';
      if (id.includes('blue')) return '#93C5FD';
      if (id.includes('green')) return '#6EE7B7';
      if (id.includes('yellow')) return '#FDE68A';
      if (id.includes('purple')) return '#C4B5FD'; // 新
      if (id.includes('white')) return '#FFFFFF';  // 新
      if (id.includes('black')) return '#4B5563';  // 幽暗的光环 (新)
      if (id.includes('gold')) return '#FEF08A';   // 新
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

      // --- LAYER 2: SURFACE (终极地貌：大师级重构版) ---
      if (parts.surface !== 'planet_surf_none') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, r - 2, 0, Math.PI * 2);
        ctx.clip();

        // 基于 uniqueId 的伪随机函数，保证不闪烁
        let seed = 0;
        for (let i = 0; i < uniqueId.length; i++) seed += uniqueId.charCodeAt(i);
        const sRng = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        if (surfImg) {
          ctx.drawImage(surfImg, planetX, planetY, planetSize, planetSize);
        } else {
          // 1. 陨石坑 (Craters) - 保持 95分 版本
          if (parts.surface.includes('craters')) {
            for (let i = 0; i < 12; i++) {
              const x = centerX + (sRng() - 0.5) * r * 1.5;
              const y = centerY + (sRng() - 0.5) * r * 1.5;
              const size = 5 + sRng() * 15;
              ctx.fillStyle = 'rgba(0,0,0,0.2)';
              ctx.beginPath();
              ctx.arc(x, y, size, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.1)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(x + 1, y + 1, size, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          // 2. 气旋 (Swirls) - 完美还原你的原版设计，仅替换随机数
          else if (parts.surface.includes('swirls')) {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 12;
            const swirlCount = 5;
            for (let i = 0; i < swirlCount; i++) {
              const angle = sRng() * Math.PI * 2;
              const dist = Math.sqrt(sRng()) * (r - 20);
              const sx = centerX + Math.cos(angle) * dist;
              const sy = centerY + Math.sin(angle) * dist;
              const scale = 0.6 + sRng() * 0.8;
              const rot = sRng() * Math.PI * 2;

              ctx.save();
              ctx.translate(sx, sy);
              ctx.rotate(rot);
              ctx.scale(scale, scale);
              ctx.beginPath();
              ctx.moveTo(-30, 0);
              ctx.bezierCurveTo(-15, -30, 15, 30, 30, 0);
              ctx.stroke();
              ctx.restore();
            }
          }

          // 3. 地壳裂缝 (Cracks) - 优化：主次分明、由粗到细的崩裂感
          else if (parts.surface.includes('cracks')) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // 画 1-2 条主要大裂缝
            for (let i = 0; i < 2; i++) {
              let startAngle = sRng() * Math.PI * 2;
              let endAngle = startAngle + Math.PI * 0.8 + (sRng() * 0.4);
              let cx = centerX + Math.cos(startAngle) * r;
              let cy = centerY + Math.sin(startAngle) * r;
              let destX = centerX + Math.cos(endAngle) * r;
              let destY = centerY + Math.sin(endAngle) * r;

              let steps = 6;
              let lastX = cx;
              let lastY = cy;

              for (let j = 1; j <= steps; j++) {
                let t = j / steps;
                // 主干粗细随进度衰减：从 6 变到 2
                let currentWidth = 6 * (1 - t * 0.6);
                let baseX = cx + (destX - cx) * t;
                let baseY = cy + (destY - cy) * t;
                let nx = baseX + (sRng() - 0.5) * 40;
                let ny = baseY + (sRng() - 0.5) * 40;

                // 画主干
                ctx.beginPath();
                ctx.lineWidth = currentWidth;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(nx, ny);
                ctx.stroke();

                // 侧边分叉：主干越往后，分叉越细、越短
                if (sRng() > 0.4) {
                  ctx.save();
                  ctx.beginPath();
                  ctx.lineWidth = currentWidth * 0.5;
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                  ctx.moveTo(nx, ny);
                  ctx.lineTo(nx + (sRng() - 0.5) * 30, ny + (sRng() - 0.5) * 30);
                  ctx.stroke();
                  ctx.restore();
                }
                lastX = nx;
                lastY = ny;
              }
            }
          }

          // 4. 岩浆河流 (Lava) - 优化：主流汇聚、末梢逐渐冷却变细
          else if (parts.surface.includes('lava')) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // 设定两条主流的起点
            for (let i = 0; i < 2; i++) {
              let lx = centerX + (sRng() - 0.5) * r;
              let ly = centerY + (sRng() - 0.5) * r;

              let steps = 5;
              for (let j = 0; j < steps; j++) {
                let t = j / steps;
                // 岩浆宽度：核心由 12 逐渐变细到 4
                let coreW = 12 * (1 - t * 0.7);
                let nextX = lx + (sRng() - 0.5) * 60;
                let nextY = ly + (sRng() - 0.5) * 60;

                // 绘制带辉光的岩浆
                ctx.shadowBlur = 10 * (1 - t * 0.5);
                ctx.shadowColor = '#FF4D00';

                // 底层：宽阔的热场
                ctx.beginPath();
                ctx.lineWidth = coreW + 4;
                ctx.strokeStyle = 'rgba(255, 77, 0, 0.3)';
                ctx.moveTo(lx, ly);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();

                // 中层：流动的金红岩浆
                ctx.beginPath();
                ctx.lineWidth = coreW;
                ctx.strokeStyle = '#FF7675';
                ctx.moveTo(lx, ly);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();

                // 顶层：最亮的中心线
                ctx.lineWidth = coreW * 0.3;
                ctx.strokeStyle = '#FFEAA7';
                ctx.stroke();

                // 分支小溪：只有主流的前半段会产生
                if (j < 3 && sRng() > 0.5) {
                  ctx.save();
                  ctx.shadowBlur = 5;
                  ctx.beginPath();
                  ctx.lineWidth = coreW * 0.4;
                  ctx.strokeStyle = '#FF7675';
                  ctx.moveTo(nextX, nextY);
                  ctx.lineTo(nextX + (sRng() - 0.5) * 40, nextY + (sRng() - 0.5) * 40);
                  ctx.stroke();
                  ctx.restore();
                }

                lx = nextX;
                ly = nextY;
              }
            }
            ctx.shadowBlur = 0;
          }

          // 5. 水晶丛林 (Crystal) - 优化：矮胖Q萌的晶簇结构
          else if (parts.surface.includes('crystal')) {
            for (let i = 0; i < 5; i++) { // 减少大簇数量，增加精致度
              const cx = centerX + (sRng() - 0.5) * (r * 1.2);
              const cy = centerY + (sRng() - 0.5) * (r * 1.2);

              // 每个晶簇由 3-5 根矮胖的水晶组成
              for (let j = 0; j < 4; j++) {
                ctx.save();
                // 随机偏移，让它们聚在一起
                const ox = (sRng() - 0.5) * 20;
                const oy = (sRng() - 0.5) * 20;
                ctx.translate(cx + ox, cy + oy);

                // 旋转一下，更有丛林感
                ctx.rotate((sRng() - 0.5) * 0.5);

                const cWidth = 12 + sRng() * 10;
                const cHeight = cWidth * (0.8 + sRng() * 0.6); // 高度不超宽度两倍，确保“矮胖”

                // 绘制晶体结构 (简单的多面体)
                const colors = ['#00d2ff', '#a29bfe', '#fab1a0'];
                const baseCol = colors[Math.floor(sRng() * colors.length)];

                // 1. 晶体左侧
                ctx.fillStyle = baseCol;
                ctx.beginPath();
                ctx.moveTo(0, -cHeight); // 顶点
                ctx.lineTo(-cWidth / 2, 0); // 左下
                ctx.lineTo(0, 5); // 底部中心
                ctx.fill();

                // 2. 晶体右侧 (稍深)
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, -cHeight);
                ctx.lineTo(cWidth / 2, 0); // 右下
                ctx.lineTo(0, 5);
                ctx.fill();
                ctx.globalAlpha = 1.0;

                // 3. 高光棱线 (非常重要，体现晶体质感)
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-cWidth / 2, 0);
                ctx.lineTo(0, -cHeight);
                ctx.lineTo(cWidth / 2, 0);
                ctx.moveTo(0, -cHeight);
                ctx.lineTo(0, 5);
                ctx.stroke();

                ctx.restore();
              }
            }
          }

          // 6. 文明灯火 (Cities) - 保持 95分 版本
          else if (parts.surface.includes('cities')) {
            ctx.fillStyle = '#FFE66D';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#FFE66D';
            for (let i = 0; i < 40; i++) {
              const x = centerX + (sRng() - 0.5) * r * 1.6;
              const y = centerY + (sRng() - 0.5) * r * 1.6;
              const s = sRng() * 2 + 1;
              ctx.beginPath();
              ctx.arc(x, y, s, 0, Math.PI * 2);
              ctx.fill();
              if (sRng() > 0.8) {
                ctx.strokeStyle = 'rgba(255, 230, 109, 0.2)';
                ctx.lineWidth = 0.5;
                ctx.lineTo(x + 20, y + 10);
                ctx.stroke();
              }
            }
            ctx.shadowBlur = 0;
          }

          // 7. 云带纹理 (Cloud Bands) - 保持
          else if (parts.surface.includes('rings')) {
            for (let i = -3; i <= 3; i++) {
              const h = 10 + sRng() * 15;
              const py = centerY + i * 25 + (sRng() - 0.5) * 10;
              ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + sRng() * 0.15})`;
              ctx.fillRect(centerX - r, py, r * 2, h);
            }
          }

          // 8. 远古遗骸 (Fossils) - 深度优化：完整的奇迹与破碎的遗迹
          else if (parts.surface.includes('fossils')) {
            ctx.lineCap = 'round';
            for (let i = 0; i < 3; i++) {
              const angle = sRng() * Math.PI * 2;
              const dist = sRng() * (r * 0.6);
              const cx = centerX + Math.cos(angle) * dist;
              const cy = centerY + Math.sin(angle) * dist;
              const rot = sRng() * Math.PI * 2;

              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(rot);

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.shadowBlur = 4;
              ctx.shadowColor = 'rgba(0,0,0,0.5)';

              // 只有第一个 i === 0 是完整的，其他的随机破碎
              const isComplete = (i === 0);
              const hasSpine = isComplete || sRng() > 0.5;
              const hasRibs = isComplete || sRng() > 0.4;
              const hasSkull = isComplete || sRng() > 0.7;

              // 1. 绘制脊椎 (Spine)
              if (hasSpine) {
                ctx.lineWidth = 3.5;
                const spineLen = isComplete ? 35 : 15 + sRng() * 20; // 破碎的脊椎比较短
                ctx.beginPath();
                ctx.moveTo(-spineLen, 0);
                ctx.quadraticCurveTo(0, -10, spineLen, 0);
                ctx.stroke();
              }

              // 2. 绘制肋骨 (Ribs)
              if (hasRibs) {
                ctx.lineWidth = 2;
                // 完整版画5对肋骨，破碎版随机画1-3对
                const ribCount = isComplete ? 5 : 1 + Math.floor(sRng() * 3);
                for (let j = 0; j < ribCount; j++) {
                  const xPos = isComplete ? (-20 + j * 10) : (sRng() - 0.5) * 30;
                  let ribLen = 20 - Math.abs(xPos) * 0.5;

                  // 随机掉落一侧的肋骨，增加不对称美
                  if (sRng() > 0.2) { // 绘制上肋骨
                    ctx.beginPath();
                    ctx.moveTo(xPos, -2);
                    ctx.quadraticCurveTo(xPos + 5, -ribLen, xPos + 15, -ribLen * 0.7);
                    ctx.stroke();
                  }
                  if (sRng() > 0.2) { // 绘制下肋骨
                    ctx.beginPath();
                    ctx.moveTo(xPos, 2);
                    ctx.quadraticCurveTo(xPos + 5, ribLen, xPos + 15, ribLen * 0.7);
                    ctx.stroke();
                  }
                }
              }

              // 3. 绘制头骨 (Skull)
              if (hasSkull) {
                const skullX = isComplete ? 42 : (sRng() > 0.5 ? 25 : -25);
                ctx.beginPath();
                ctx.arc(skullX, 2, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fill();
                // 给头骨加一个“眼窝”小点，更生动
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(skullX + 2, 1, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }

              ctx.restore();
            }
            ctx.shadowBlur = 0;
          }
        }
        ctx.restore();
      }

      // --- LAYER 3: ATMOSPHERE (光效与容积云增强版) ---
      if (atmoImg) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(atmoImg, planetX, planetY, planetSize, planetSize);
        ctx.restore();
      } else {
        let aSeed = 0;
        for (let i = 0; i < uniqueId.length; i++) aSeed += uniqueId.charCodeAt(i);
        const aRng = () => {
          aSeed = (aSeed * 9301 + 49297) % 233280;
          return aSeed / 233280;
        };

        // 1. 土星环 (Rings) - 保留
        if (parts.atmosphere.includes('rings')) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, r + 40, 20, Math.PI / 8, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.restore();
        }

        // 2. 宇宙光晕 (Glow) - 保留
        else if (parts.atmosphere.includes('glow')) {
          ctx.save();
          const glow = ctx.createRadialGradient(centerX, centerY, r, centerX, centerY, r + 40);
          glow.addColorStop(0, 'rgba(255,255,255,0.3)');
          glow.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }

        // 3. 霓虹极光 (Aurora) - 优化：穿插的渐变光带
        else if (parts.atmosphere.includes('aurora')) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const colors = ['rgba(85, 230, 193, 0.4)', 'rgba(37, 204, 247, 0.4)', 'rgba(253, 114, 114, 0.4)'];
          for (let i = 0; i < 3; i++) {
            const angle = aRng() * Math.PI * 2;
            const grad = ctx.createLinearGradient(
              centerX - r, centerY - r,
              centerX + r, centerY + r
            );
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, colors[i % 3]);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            // 画出不规则的宽阔光斑
            const x = centerX + (aRng() - 0.5) * r;
            const y = centerY + (aRng() - 0.5) * r;
            ctx.ellipse(x, y, r * 1.2, r * 0.4, angle, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 4. 浓云 (Clouds) - 优化：局部遮挡的叠加渐变
        else if (parts.atmosphere.includes('clouds')) {
          ctx.save();
          // 只在星球范围内显示云，但有局部遮挡感
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.clip();

          for (let i = 0; i < 6; i++) {
            const cx = centerX + (aRng() - 0.5) * r * 1.5;
            const cy = centerY + (aRng() - 0.5) * r * 1.5;
            const cloudR = 40 + aRng() * 60;

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cloudR);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cloudR, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 5. 小行星带 (Debris) - 保留
        else if (parts.atmosphere.includes('debris')) {
          ctx.save();
          for (let i = 0; i < 30; i++) {
            const angle = aRng() * Math.PI * 2;
            const dist = r + 15 + aRng() * 25;
            const dx = centerX + Math.cos(angle) * dist;
            const dy = centerY + Math.sin(angle) * dist;
            const dSize = 2 + aRng() * 5;
            ctx.fillStyle = aRng() > 0.5 ? '#A3A3A3' : '#D4D4D4';
            if (aRng() > 0.5) ctx.fillRect(dx, dy, dSize, dSize);
            else {
              ctx.beginPath();
              ctx.arc(dx, dy, dSize / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }

        // 6. 等离子护盾 (Shield) - 保留
        else if (parts.atmosphere.includes('shield')) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, r + 15, 0, Math.PI * 2);
          ctx.strokeStyle = '#00D2FF';
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 5]);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX, centerY, r + 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 210, 255, 0.3)';
          ctx.lineWidth = 8;
          ctx.setLineDash([]);
          ctx.stroke();
          ctx.restore();
        }

        // 7. 星际尘埃 (Nebula) - 保留
        else if (parts.atmosphere.includes('nebula')) {
          ctx.save();
          for (let i = 0; i < 6; i++) {
            const nx = centerX + (aRng() - 0.5) * r * 2.5;
            const ny = centerY + (aRng() - 0.5) * r * 2.5;
            const nSize = 30 + aRng() * 40;
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nSize);
            const color = aRng() > 0.5 ? 'rgba(162, 155, 254, 0.4)' : 'rgba(253, 121, 168, 0.4)';
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(nx - nSize, ny - nSize, nSize * 2, nSize * 2);
          }
          ctx.restore();
        }

        // 8. 离子风暴 (Electric) - 保留
        else if (parts.atmosphere.includes('electric')) {
          ctx.save();
          ctx.strokeStyle = '#FFF34F';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FFF34F';
          for (let i = 0; i < 6; i++) {
            let lx = centerX + (aRng() - 0.5) * r * 2.2;
            let ly = centerY + (aRng() - 0.5) * r * 2.2;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            for (let j = 0; j < 4; j++) {
              lx += (aRng() - 0.5) * 20;
              ly += (aRng() - 0.5) * 20;
              ctx.lineTo(lx, ly);
            }
            ctx.stroke();
          }
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
      <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">

        {/* 1. MOON: 经典公转 */}
        {parts.companion.includes('moon') && (
          <div className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 animate-orbit-moon">
            <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-md filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              <circle cx="25" cy="25" r="22" fill="#E5E7EB" stroke="black" strokeWidth="3" />
              <circle cx="15" cy="18" r="5" fill="rgba(0,0,0,0.1)" />
              <circle cx="32" cy="30" r="3" fill="rgba(0,0,0,0.1)" />
            </svg>
          </div>
        )}

        {/* 2. UFO: 悬停与轻微摇摆 */}
        {parts.companion.includes('ufo') && (
          <div className="absolute top-1/2 left-1/2 w-16 h-12 -ml-8 -mt-6 animate-hover-ufo">
            <svg viewBox="0 0 60 40" className="w-full h-full drop-shadow-md filter drop-shadow-[0_0_8px_rgba(77,150,255,0.6)]">
              <path d="M15 20 A 15 15 0 0 1 45 20" fill="#60A5FA" stroke="white" strokeWidth="3" />
              <ellipse cx="30" cy="20" rx="28" ry="10" fill="#9CA3AF" stroke="white" strokeWidth="3" />
              <circle cx="15" cy="20" r="3" fill="#FCD34D" />
              <circle cx="30" cy="24" r="3" fill="#FCD34D" />
              <circle cx="45" cy="20" r="3" fill="#FCD34D" />
            </svg>
          </div>
        )}

        {/* 3. ROCKET: 切线飞行 (头朝前) */}
        {parts.companion.includes('rocket') && (
          <div className="absolute top-1/2 left-1/2 w-10 h-16 -ml-5 -mt-8 animate-orbit-rocket">
            <svg viewBox="0 0 60 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,118,117,0.6)]">
              {/* 尾焰独立动画，不遮挡机身 */}
              <g className="animate-flame-pulse">
                <path d="M20 80 L30 105 L40 80 Z" fill="#FF9F1A" />
                <path d="M25 80 L30 95 L35 80 Z" fill="#FFF200" />
              </g>
              {/* 火箭主体：对齐满分粗黑描边 */}
              <path d="M30 5 C15 5 10 30 10 50 L10 80 L50 80 L50 50 C50 30 45 5 30 5 Z" fill="#F1F2F6" stroke="black" strokeWidth="3" />
              <path d="M10 60 L0 80 L10 80 Z" fill="#FF7675" stroke="black" strokeWidth="3" strokeLinejoin="round" />
              <path d="M50 60 L60 80 L50 80 Z" fill="#FF7675" stroke="black" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="30" cy="35" r="8" fill="#70A1FF" stroke="black" strokeWidth="3" />
            </svg>
          </div>
        )}

        {/* 4. WHALE: 修复转向 (朝左画，向左游，转身再向右) */}
        {parts.companion.includes('whale') && (
          <div className="absolute top-1/2 left-1/2 w-20 h-14 -ml-10 -mt-7 animate-swim-whale">
            <svg viewBox="0 0 80 50" className="w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
              {/* 鲸鱼朝向左侧：头在左，尾巴在右 */}
              <path d="M 70 25 C 70 10, 30 10, 10 20 C 5 22, 5 28, 10 30 C 30 40, 70 40, 70 25 Z" fill="#3B82F6" stroke="black" strokeWidth="3" />
              <path d="M 70 25 L 78 15 L 75 25 L 78 35 Z" fill="#3B82F6" stroke="black" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="25" cy="22" r="2.5" fill="black" />
              <path d="M 60 30 Q 40 35 20 28" fill="none" stroke="white" strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* 5. SATELLITE: 错位椭圆轨道 */}
        {parts.companion.includes('satellite') && (
          <div className="absolute top-1/2 left-1/2 w-16 h-10 -ml-8 -mt-5 animate-orbit-satellite">
            <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
              {/* 蓝色太阳能板 */}
              <rect x="5" y="15" width="30" height="20" rx="3" fill="#60A5FA" stroke="black" strokeWidth="3" />
              <rect x="65" y="15" width="30" height="20" rx="3" fill="#60A5FA" stroke="black" strokeWidth="3" />
              {/* 连接轴与核心 */}
              <line x1="35" y1="25" x2="65" y2="25" stroke="black" strokeWidth="4" />
              <circle cx="50" cy="25" r="12" fill="#E5E7EB" stroke="black" strokeWidth="3" />
              <circle cx="50" cy="25" r="4" fill="#FCD34D" />
            </svg>
          </div>
        )}

        {/* 6. DYSON SPHERE: 原地自转 */}
        {parts.companion.includes('dyson') && (
          <div className="absolute top-[30%] left-[20%] w-16 h-16 animate-spin-dyson">
            <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]">
              {/* 增加黑色硬描边 */}
              <polygon points="30,5 55,18 55,42 30,55 5,42 5,18" fill="none" stroke="black" strokeWidth="4" />
              <polygon points="30,5 55,18 55,42 30,55 5,42 5,18" fill="none" stroke="#FCD34D" strokeWidth="2" />
              <polygon points="30,15 45,25 45,40 30,50 15,40 15,25" fill="#F59E0B" stroke="black" strokeWidth="3" />
              <circle cx="30" cy="30" r="5" fill="#FFFBEB" className="animate-pulse" />
            </svg>
          </div>
        )}

        {/* 7. COMET: 掠过天际 (重新设计：多巴胺配色冰晶 + 渐变粗拖尾) */}
        {parts.companion.includes('comet') && (
          <div className="absolute w-32 h-16 animate-flyby-comet pointer-events-none">
            <svg viewBox="0 0 160 60" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="cometGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgba(255,255,255,0)" />
                  <stop offset="0.8" stopColor="#70A1FF" />
                </linearGradient>
              </defs>
              {/* 彗星尾巴 */}
              <path d="M 0 30 Q 80 15 120 30 Q 80 45 0 30 Z" fill="url(#cometGrad)" />
              {/* 硬核冰晶：粗白描边 */}
              <polygon points="110,30 125,15 145,25 150,40 135,45 120,35" fill="#E0F2FE" stroke="white" strokeWidth="3" strokeLinejoin="round" />
              <polygon points="125,25 135,28 130,38 120,32" fill="#BAE6FD" />
            </svg>
          </div>
        )}

        {/* 8. ORBITAL STATION: 逆向慢速公转 (重新设计：大色块拼接) */}
        {parts.companion.includes('station') && (
          <div className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 animate-orbit-station">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* 太阳能板 */}
              <rect x="10" y="40" width="25" height="20" rx="2" fill="#60A5FA" stroke="black" strokeWidth="3" />
              <rect x="65" y="40" width="25" height="20" rx="2" fill="#60A5FA" stroke="black" strokeWidth="3" />
              <line x1="35" y1="50" x2="65" y2="50" stroke="black" strokeWidth="4" />
              {/* 核心舱体 */}
              <rect x="40" y="20" width="20" height="60" rx="6" fill="#F3F4F6" stroke="black" strokeWidth="3" />
              {/* 雷达与红色信号灯 */}
              <path d="M40 20 Q 50 0 60 20" fill="none" stroke="black" strokeWidth="3" />
              <circle cx="50" cy="10" r="4" fill="#EF4444" stroke="black" strokeWidth="2" className="animate-ping" />
            </svg>
          </div>
        )}
      </div>

      <style>{`
          /* === 彻底清理后的纯净 CSS 动画系统 === */

          /* 1. 月球：保持平稳正向转动 (自己不转，只绕圈) */
          @keyframes orbit-moon {
            from { transform: rotate(0deg) translateX(110px) rotate(-0deg); }
            to   { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
          }

          /* 2. UFO：原位轻微上下浮动，带小角度摇摆 */
          @keyframes hover-ufo {
            0%, 100% { transform: translate(60px, -70px) rotate(0deg); }
            50%      { transform: translate(60px, -85px) rotate(-5deg); }
          }

          /* 3. 火箭：绕着星球飞，头始终朝向飞行路线前方 */
          /* 核心原理：先自转确定路线角度，推远距离，再转 90 度让头冲前 */
          @keyframes orbit-rocket {
            from { transform: rotate(0deg) translateY(-110px) rotate(90deg); }
            to   { transform: rotate(360deg) translateY(-110px) rotate(90deg); }
          }
          @keyframes flame-pulse {
            0%, 100% { transform: scaleY(1); opacity: 0.8; }
            50%      { transform: scaleY(1.3); opacity: 1; }
          }

          /* 4. 鲸鱼：修复转向！向左游过去，掉头，向右游回来 */
          @keyframes swim-whale {
            0%   { transform: translate(150px, -20px) scaleX(1); }    /* 在右边，头朝左 */
            45%  { transform: translate(-150px, 40px) scaleX(1); }    /* 游到左边 */
            50%  { transform: translate(-150px, 40px) scaleX(-1); }   /* 掉头 (翻转) */
            95%  { transform: translate(150px, -20px) scaleX(-1); }   /* 游回右边 */
            100% { transform: translate(150px, -20px) scaleX(1); }    /* 掉头 */
          }

          /* 5. 卫星：倾斜角度的远距离轨道 */
          @keyframes orbit-satellite {
            from { transform: rotate(0deg) translateY(-130px) translateX(40px) rotate(0deg); }
            to   { transform: rotate(360deg) translateY(-130px) translateX(40px) rotate(-360deg); }
          }

          /* 6. 戴森球：原位极慢自转 */
          @keyframes spin-dyson {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* 7. 彗星：大跨度对角线极速掠过 */
          @keyframes flyby-comet {
            0%   { transform: translate(-200px, -100px) rotate(25deg); opacity: 0; }
            20%  { opacity: 1; }
            80%  { opacity: 1; }
            100% { transform: translate(400px, 250px) rotate(25deg); opacity: 0; }
          }

          /* 8. 空间站：与火箭反方向（逆时针）的超慢轨道，保持绝对平衡 */
          @keyframes orbit-station {
            from { transform: rotate(360deg) translateY(140px) rotate(-360deg); }
            to   { transform: rotate(0deg) translateY(140px) rotate(0deg); }
          }

          /* 绑定动画类名 (注意不冲突、时间各有错落) */
          .animate-orbit-moon { animation: orbit-moon 15s linear infinite; }
          .animate-hover-ufo { animation: hover-ufo 5s ease-in-out infinite; }
          .animate-orbit-rocket { animation: orbit-rocket 8s linear infinite; }
          .animate-flame-pulse { animation: flame-pulse 0.2s ease-in-out infinite; }
          .animate-swim-whale { animation: swim-whale 24s ease-in-out infinite; }
          .animate-orbit-satellite { animation: orbit-satellite 20s linear infinite; }
          .animate-spin-dyson { animation: spin-dyson 30s linear infinite; }
          .animate-flyby-comet { animation: flyby-comet 10s ease-in infinite; }
          .animate-orbit-station { animation: orbit-station 35s linear infinite; }
        `}</style>
    </div>
  );
};
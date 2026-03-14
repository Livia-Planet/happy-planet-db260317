import { useCallback } from 'react';

export const useAnimateTokens = () => {
  // 通用代币飞行动画 (支持 🥕 和 ✨)
  const animateToken = useCallback((startId: string, endId: string, symbol: string, isGaining: boolean) => {
    const startEl = document.getElementById(startId);
    const endEl = document.getElementById(endId);

    if (!startEl || !endEl) {
      console.warn(`Animation failed: missing elements ${startId} or ${endId}`);
      return;
    }

    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    // 默认飞 3 个粒子，显得丰满
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createFlyingParticle(startX, startY, endX, endY, endEl, isGaining, symbol);
      }, i * 100);
    }
  }, []);

  // 兼容旧版的快捷方法
  const spendCarrots = useCallback((targetButtonId: string, count: number) => {
    animateToken('carrot-wallet', targetButtonId, '🥕', false);
  }, [animateToken]);

  const gainCarrots = useCallback((sourceButtonId: string, count: number) => {
    animateToken(sourceButtonId, 'carrot-wallet', '🥕', true);
  }, [animateToken]);

  return { spendCarrots, gainCarrots, animateToken };
};

function createFlyingParticle(startX: number, startY: number, endX: number, endY: number, targetEl: HTMLElement, isGaining: boolean, symbol: string) {
  const el = document.createElement('div');
  el.innerHTML = symbol;
  // 极高的 z-index 确保在所有弹窗之上
  el.className = 'fixed text-2xl z-[99999] pointer-events-none select-none drop-shadow-md';
  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  document.body.appendChild(el);

  const startTime = performance.now();
  const duration = 650;

  // 弧线控制点
  const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * 150;
  const cpY = Math.min(startY, endY) - 150;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);

    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    if (isGaining) {
      el.style.transform = `translate(-50%, -50%) rotate(${t * 720}deg) scale(${1 + Math.sin(t * Math.PI) * 0.5})`;
      el.style.opacity = '1';
    } else {
      el.style.transform = `translate(-50%, -50%) rotate(${t * 720}deg) scale(${1.2 - t * 0.5})`;
      el.style.opacity = `${1 - t * t}`;
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      el.remove();
      // 目标受到撞击的反馈反馈
      if (isGaining) {
        targetEl.classList.add('scale-110', 'brightness-110');
        setTimeout(() => targetEl.classList.remove('scale-110', 'brightness-110'), 200);
      } else {
        targetEl.classList.add('scale-95', 'opacity-80');
        setTimeout(() => targetEl.classList.remove('scale-95', 'opacity-80'), 200);
      }
    }
  };
  requestAnimationFrame(animate);
}
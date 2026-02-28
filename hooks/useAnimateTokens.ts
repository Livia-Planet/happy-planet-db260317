import { useCallback } from 'react';

export const useAnimateTokens = () => {
  const spendCarrots = useCallback((targetButtonId: string, count: number) => {
    const walletEl = document.getElementById('carrot-wallet');
    const buttonEl = document.getElementById(targetButtonId);

    if (!walletEl || !buttonEl) return;

    const walletRect = walletEl.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();

    // 起点：右上角钱包中心
    const startX = walletRect.left + walletRect.width / 2;
    const startY = walletRect.top + walletRect.height / 2;
    
    // 终点：点击的按钮中心
    const endX = buttonRect.left + buttonRect.width / 2;
    const endY = buttonRect.top + buttonRect.height / 2;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        createFlyingCarrot(startX, startY, endX, endY, buttonEl);
      }, i * 80); // 间隔稍微快一点，5颗齐发时更有节奏感
    }
  }, []);

  return { spendCarrots };
};

function createFlyingCarrot(startX: number, startY: number, endX: number, endY: number, targetEl: HTMLElement) {
  const el = document.createElement('div');
  el.innerHTML = '🥕';
  // 尺寸调小，符合你说的"微调"要求
  el.className = 'fixed text-lg z-[200] pointer-events-none select-none drop-shadow-sm';
  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  document.body.appendChild(el);

  const startTime = performance.now();
  const duration = 650; // 稍微加快飞行速度

  // 弧线控制点：让它划出一道自然的抛物线
  const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * 100;
  const cpY = Math.min(startY, endY) - 100;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);

    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `translate(-50%, -50%) rotate(${t * 720}deg) scale(${1.2 - t * 0.5})`;
    el.style.opacity = `${1 - t * t}`;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      el.remove();
      // 按钮"吸收"反馈
      targetEl.classList.add('animate-spend-hit');
      setTimeout(() => targetEl.classList.remove('animate-spend-hit'), 200);
    }
  };
  requestAnimationFrame(animate);
}
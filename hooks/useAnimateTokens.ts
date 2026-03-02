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
        createFlyingCarrot(startX, startY, endX, endY, buttonEl, false);
      }, i * 80);
    }
  }, []);

  // NEW: 获得金币的反向动画
  const gainCarrots = useCallback((sourceButtonId: string, count: number) => {
    const walletEl = document.getElementById('carrot-wallet');
    const buttonEl = document.getElementById(sourceButtonId);

    if (!walletEl || !buttonEl) return;

    const walletRect = walletEl.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();

    // 起点：触发获得的按钮中心
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;
    
    // 终点：右上角钱包中心
    const endX = walletRect.left + walletRect.width / 2;
    const endY = walletRect.top + walletRect.height / 2;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        createFlyingCarrot(startX, startY, endX, endY, walletEl, true);
      }, i * 80);
    }
  }, []);

  return { spendCarrots, gainCarrots };
};

function createFlyingCarrot(startX: number, startY: number, endX: number, endY: number, targetEl: HTMLElement, isGaining: boolean) {
  const el = document.createElement('div');
  el.innerHTML = '🥕';
  // Z-index 调到极高，确保在 Modal 之上显示
  el.className = 'fixed text-lg z-[99999] pointer-events-none select-none drop-shadow-sm';
  el.style.left = `${startX}px`;
  el.style.top = `${startY}px`;
  document.body.appendChild(el);

  const startTime = performance.now();
  const duration = 650; // 飞行时间

  // 弧线控制点：让它划出一道自然的抛物线
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
      // 获得的动画：旋转并带有呼吸放大效果
      el.style.transform = `translate(-50%, -50%) rotate(${t * 720}deg) scale(${1 + Math.sin(t * Math.PI) * 0.5})`;
      el.style.opacity = '1';
    } else {
      // 消费的动画：旋转变小
      el.style.transform = `translate(-50%, -50%) rotate(${t * 720}deg) scale(${1.2 - t * 0.5})`;
      el.style.opacity = `${1 - t * t}`;
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      el.remove();
      // 给目标元素（按钮或钱包）添加"被击中/收入"的反馈动画
      if (isGaining) {
        targetEl.classList.add('animate-bounce-short');
        setTimeout(() => targetEl.classList.remove('animate-bounce-short'), 300);
      } else {
        targetEl.classList.add('animate-spend-hit');
        setTimeout(() => targetEl.classList.remove('animate-spend-hit'), 200);
      }
    }
  };
  requestAnimationFrame(animate);
}
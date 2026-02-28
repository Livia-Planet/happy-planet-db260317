import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  rotation: number;
  vr: number; // 旋转速度
  type: 'star' | 'carrot';
}

interface ParticleOverlayProps {
  trigger: number; // 每次数值改变都会触发爆炸
  color?: string;
}

export const ParticleOverlay: React.FC<ParticleOverlayProps> = ({ trigger, color = '#FFD93D' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  const createExplosion = (width: number, height: number) => {
    const colors = [color, '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8C42'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      particles.current.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 20,
        type: Math.random() > 0.8 ? 'carrot' : 'star'
      });
    }
  };

  useEffect(() => {
    if (trigger > 0) {
      const canvas = canvasRef.current;
      if (canvas) createExplosion(canvas.width, canvas.height);
    }
  }, [trigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // 重力
        p.life -= 0.02;
        p.rotation += p.vr;

        if (p.life <= 0) {
          particles.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        if (p.type === 'star') {
          // 绘制碎星
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * p.size,
                       Math.sin(((18 + i * 72) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.size / 2),
                       Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.size / 2));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // 绘制小胡萝卜块
          ctx.fillRect(-p.size/2, -p.size, p.size, p.size * 1.5);
        }
        ctx.restore();
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
};
import React from 'react';

interface IconProps {
  className?: string;
}

// 红色叉叉 (用于余额不足提示)
export const RedX: React.FC<IconProps> = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D4D" strokeWidth="3" className={className}>
    <circle cx="12" cy="12" r="10" strokeWidth="3" />
    <path d="M8 8l8 8M16 8l-8 8" />
  </svg>
);

// 黑色能量图标（闪电形状）
// (EnergyIcon removed — use CarrotCoinIcon / RedX for balance-related UI)

// 胡萝卜币 (CarrotCoin) - 简笔画手绘风格
export const CarrotCoinIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 左叶子 */}
    <path d="M18 6l-2 2" />
    {/* 右叶子 */}
    <path d="M15 3l1 3" />
    {/* 胡萝卜身体：尖尖意态 */}
    <path d="M12 8c-2 0-8 6-8 10a2 2 0 0 0 2 2c4 0 10-6 10-8s-2-4-4-4z" />
  </svg>
);

// 档案室 (Archives) - 经典闭合书本
export const ArchivesIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

// 骰子 (Dice) - 极简3点版
export const DiceIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="16" cy="16" r="1.2" fill="currentColor" />
  </svg>
);

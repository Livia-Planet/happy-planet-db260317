import React from 'react';
import { CharacterStats } from '../types';

interface StatBarProps {
  stats: CharacterStats;
}

export const StatBar: React.FC<StatBarProps> = ({ stats }) => {
  return (
    <div className="flex flex-col w-16 h-full border-l-4 border-black bg-white rounded-r-xl overflow-hidden font-rounded font-bold text-2xl">
      {/* Mod (Red) */}
      <div className="flex-1 bg-livia-red border-b-4 border-black flex items-center justify-center text-white relative transition-all duration-300">
         {stats.mod}
      </div>
      
      {/* Bus (Yellow) */}
      <div className="flex-1 bg-livia-yellow border-b-4 border-black flex items-center justify-center text-black relative transition-all duration-300">
         {stats.bus}
      </div>
      
      {/* Klurighet (Blue) */}
      <div className="flex-1 bg-livia-blue flex items-center justify-center text-white relative transition-all duration-300">
         {stats.klurighet}
      </div>
    </div>
  );
};
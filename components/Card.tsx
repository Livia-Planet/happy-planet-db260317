import React from 'react';
import { CharacterData, CharacterStats, Language, PassportData } from '../types';
import { StatBar } from './StatBar';
import { Avatar } from './Avatar';
import { getDominantStat, generateUniqueId, TRANSLATIONS } from '../utils/gameLogic';
import { PlanetCanvas } from './PlanetCanvas';

interface CardProps {
  data: PassportData | CharacterData;
  stats: CharacterStats;
  flavorText: string;
  isFlipped: boolean;
  onFlip: () => void;
  lang: Language;
}

export const Card: React.FC<CardProps> = ({ data, stats, flavorText, isFlipped, onFlip, lang }) => {
  const dominantStat = getDominantStat(stats);
  const uniqueId = generateUniqueId(data.lastModified);

  // Background color mapping for Front
  const cardBgColors = {
    mod: 'bg-red-50',
    bus: 'bg-yellow-50',
    klurighet: 'bg-blue-50'
  };

  // Text color mapping for stats
  const statTextColors = {
    mod: 'text-livia-red',
    bus: 'text-yellow-600',
    klurighet: 'text-livia-blue'
  };

  return (
    <div
      className="relative w-[340px] h-[480px] perspective-1000 cursor-pointer group"
      onClick={onFlip}
    >
      <div
        className={`w-full h-full relative transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* === FRONT FACE === */}
        <div className="absolute w-full h-full backface-hidden bg-white border-[6px] border-black rounded-3xl shadow-comic overflow-hidden flex flex-row">

          {/* Left Content Area (Same as before) */}
          <div className="flex-1 flex flex-col relative">

            {/* 1. Header/Avatar Area */}
            <div className={`flex-1 ${cardBgColors[dominantStat]} transition-colors duration-500 relative p-4 flex flex-col items-center justify-center border-b-[6px] border-black`}>
              {/* Decorative dots */}
              <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-white border-2 border-black opacity-60"></div>
              <div className="absolute bottom-6 right-3 w-5 h-5 rounded-full bg-white border-2 border-black opacity-60"></div>

              {/* Avatar & Name Tag Wrapper */}
              <div className="transform scale-125 transition-transform duration-300 relative">
                <Avatar selectedParts={data.selectedParts} dominantStat={dominantStat} />

                {/* Name Tag */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-black text-white px-4 py-2 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center min-w-[120px]">
                    <h2 className="font-rounded font-black text-lg uppercase tracking-wider leading-none text-center">{data.name}</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Stat Badge Area (Translated) */}
            <div className="flex justify-center gap-3 py-2 bg-white border-b-[4px] border-gray-100">
              <div className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === 'mod' ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                <div className="w-2 h-2 rounded-full bg-livia-red"></div>
                <span className="text-livia-red">{TRANSLATIONS.stats.mod[lang]}</span>
                <span className="text-black text-lg animate-pulse">{stats.mod}</span>
              </div>
              <div className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === 'bus' ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                <div className="w-2 h-2 rounded-full bg-livia-yellow"></div>
                <span className="text-yellow-600">{TRANSLATIONS.stats.bus[lang]}</span>
                <span className="text-black text-lg animate-pulse">{stats.bus}</span>
              </div>
              <div className={`flex items-center gap-1 font-bold font-rounded text-sm ${dominantStat === 'klurighet' ? 'scale-110' : 'opacity-60'} transition-all duration-300`}>
                <div className="w-2 h-2 rounded-full bg-livia-blue"></div>
                <span className="text-livia-blue">{TRANSLATIONS.stats.klurighet[lang]}</span>
                <span className="text-black text-lg animate-pulse">{stats.klurighet}</span>
              </div>
            </div>

            {/* 4. Description / Flavor Text Area */}
            <div className="h-40 p-5 bg-livia-bg text-sm font-hand leading-snug flex flex-col justify-center items-center text-center">
              <p className={`text-lg font-bold ${statTextColors[dominantStat]} mb-2`}>
                {TRANSLATIONS.energyTypes[dominantStat][lang]}
              </p>
              <p className="text-gray-800 text-lg">
                "{flavorText}"
              </p>
            </div>

            {/* Bottom tagline with Unique ID */}
            <div className="bg-black text-white py-2 px-3 text-center font-hand text-[10px] min-h-[32px] flex flex-col items-center justify-center leading-none">
              <span className="opacity-80 mb-0.5">{TRANSLATIONS.idTitle[lang]}</span>
              <span className="font-mono font-bold tracking-widest text-livia-yellow">{uniqueId}</span>
            </div>
          </div>

          {/* Right Stat Bar */}
          <StatBar stats={stats} />

        </div>

        {/* === BACK FACE === */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 bg-black border-[6px] border-black rounded-3xl shadow-comic overflow-hidden`}>

          <div className="absolute inset-0 w-full h-full">
            <PlanetCanvas parts={data.selectedPlanetParts} uniqueId={uniqueId} lang={lang} />
          </div>

        </div>
      </div>
    </div>
  );
};
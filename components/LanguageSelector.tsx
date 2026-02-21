import React, { useState } from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

const LANG_LABELS = {
  se: { label: '🇸🇪 Svenska', icon: 'SE' },
  en: { label: '🇬🇧 English', icon: 'EN' },
  cn: { label: '🇨🇳 中文', icon: 'CN' }
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative font-rounded z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0_black] flex items-center justify-center font-black text-lg hover:translate-y-[1px] hover:shadow-[2px_2px_0_black] active:translate-y-[3px] active:shadow-none transition-all"
      >
        {LANG_LABELS[currentLang].icon}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0_black] overflow-hidden flex flex-col">
          {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-left text-sm font-bold border-b border-black last:border-b-0 hover:bg-livia-yellow transition-colors ${currentLang === lang ? 'bg-gray-100' : ''}`}
            >
              {LANG_LABELS[lang].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
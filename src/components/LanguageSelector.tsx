import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../i18n/languages';

interface LanguageSelectorProps {
  isMobile?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isMobile = false }) => {
  const { language, setLanguage, currentLangObj, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <div className="space-y-1.5 py-2">
        <label className="block text-xs font-semibold text-[#0F172A]/70 uppercase tracking-wider">
          {t('lang.select', 'Select Language')}
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  active
                    ? 'bg-[#0F172A] text-[#FFFFFF]'
                    : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB]'
                }`}
              >
                <span className="truncate">{lang.nativeName}</span>
                {active && <Check className="w-3.5 h-3.5 shrink-0 text-[#F59E0B]" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-colors border border-[#0F172A]/10 focus-visible:outline-2 focus-visible:outline-[#0F172A]"
        aria-expanded={isOpen}
        aria-label={t('lang.select', 'Select Language')}
      >
        <Globe className="w-4 h-4 text-[#D97706]" />
        <span>{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl shadow-xl py-1.5 z-50">
          {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors text-left ${
                  active
                    ? 'bg-[#FFF7ED] text-[#0F172A] font-semibold'
                    : 'text-[#1F2937] hover:bg-[#F3F4F6] hover:text-[#0F172A]'
                }`}
              >
                <span>{lang.nativeName} <span className="text-[#1F2937]/50 text-[11px] ml-1">({lang.name})</span></span>
                {active && <Check className="w-3.5 h-3.5 text-[#D97706]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

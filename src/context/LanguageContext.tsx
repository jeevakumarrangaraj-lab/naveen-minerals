import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../i18n/languages';
import { TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
  currentLangObj: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'naveen_minerals_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (TRANSLATIONS[saved] || SUPPORTED_LANGUAGES.some(l => l.code === saved))) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLangObj.dir || 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.className = `lang-${language}`;
  }, [language, dir]);

  const setLanguage = (code: string) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === code)) {
      setLanguageState(code);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    // Fallback to parameter or key
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, currentLangObj }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

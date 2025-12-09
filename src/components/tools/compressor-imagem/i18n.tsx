
import React, { useState, useCallback, createContext, useContext } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { translations, availableLanguages } from './locales';

interface I18nContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: Record<string, any>) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

const getInitialLanguage = (): string => {
  const storedLangItem = localStorage.getItem('happypaint-language');
  if (storedLangItem) {
    try {
      const storedLang = JSON.parse(storedLangItem);
      if (availableLanguages[storedLang]) {
        return storedLang;
      }
    } catch (e) {
      console.error("Failed to parse language from localStorage", e);
    }
  }

  const browserLang = navigator.language;
  if (availableLanguages[browserLang]) {
    return browserLang;
  }
  const shortLang = browserLang.split(/[-_]/)[0];
  if (translations[shortLang]) {
    return shortLang;
  }

  return 'en';
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useLocalStorage<string>('happypaint-language', getInitialLanguage());

  const getTranslation = (lang: string, key: string) => {
    const keys = key.split('.');
    return keys.reduce((acc, currentKey) => (acc && acc[currentKey] !== undefined ? acc[currentKey] : undefined), translations[lang]);
  }

  const t = useCallback((key: string, options?: Record<string, any>): any => {
    let result = getTranslation(language, key);

    if (result === undefined) {
      console.warn(`Translation key not found: ${key} in language ${language}, falling back to 'en'`);
      result = getTranslation('en', key);
      if (result === undefined) {
        return key;
      }
    }
    
    if (typeof result === 'object' && !Array.isArray(result) && options?.count !== undefined) {
      if (options.count === 1 && result.one) {
        result = result.one;
      } else if (result.other) {
        result = result.other;
      } else {
        result = key;
      }
    }

    if (typeof result === 'string' && options) {
      Object.keys(options).forEach(optionKey => {
        result = result.replace(new RegExp(`\\{${optionKey}\\}`, 'g'), String(options[optionKey]));
      });
    }

    return result;
  }, [language]);
  
  return (
    <I18nContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </I18nContext.Provider>
  );
};

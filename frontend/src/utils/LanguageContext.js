import { createContext, useContext, useMemo } from 'react';
import { translations } from './translations';

const LanguageContext = createContext({
  language: 'ru',
  t: (key) => key,
});

export const LanguageProvider = ({ language = 'ru', children }) => {
  const t = useMemo(() => {
    return (key, replacements = {}) => {
      const dict = translations[language] || translations.ru;
      let text = dict[key] || translations.ru[key] || key;
      
      if (typeof text === 'string') {
        Object.keys(replacements).forEach((repKey) => {
          text = text.replace(`{${repKey}}`, replacements[repKey]);
        });
      }
      return text;
    };
  }, [language]);

  const value = useMemo(() => ({ language, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

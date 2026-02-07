import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import es from '../locales/es.json';
import zh from '../locales/zh.json';
import ru from '../locales/ru.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  zh: { translation: zh },
  ru: { translation: ru }
};

// Detect browser language
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLangs = ['en', 'hi', 'es', 'zh', 'ru'];
  return supportedLangs.includes(browserLang) ? browserLang : 'en';
};

// Get saved language or detect from browser
const savedLanguage = localStorage.getItem('language');
const initialLanguage = savedLanguage || getBrowserLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Save language changes
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
});

export default i18n;

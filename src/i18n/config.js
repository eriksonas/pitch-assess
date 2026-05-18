import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pl from './locales/pl.json';
import de from './locales/de.json';
import lt from './locales/lt.json';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
  de: { translation: de },
  lt: { translation: lt }
};

i18n?.use(initReactI18next)?.init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
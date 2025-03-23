import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
    .use(HttpBackend) // Load translations from public/locales
    .use(LanguageDetector) // Detect browser language
    .use(initReactI18next)
    .init({
        fallbackLng: "en", // Ensure fallback is to 'en-US'
        lng: "en", // Explicitly set the initial language to 'en-US'
        debug: false,//process.env.NODE_ENV === "development",
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json", // Fetch translations dynamically
        },
    });

export default i18n;

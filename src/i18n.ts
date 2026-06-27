/**
 * src/i18n.ts
 *
 * i18next configuration — centralized language registry.
 *
 * SOLID (Open/Closed): Add future languages to the `resources` map
 * without modifying the init logic.
 *
 * Uses LanguageDetector to remember the user's choice in localStorage.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

// ── Centralized language registry ────────────────────────────
// Add future languages here (e.g. fr, es) without touching init.
const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "ar",
    debug: false,
    resources,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;

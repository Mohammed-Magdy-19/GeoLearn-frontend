/**
 * src/components/navigation/LanguageSwitcher.tsx
 *
 * Toggle button to switch between Arabic and English.
 * Renders a compact pill-shaped button showing the *opposite* language
 * name so the user knows what they'll switch to.
 */

import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-all duration-200 hover:bg-white/10 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
      aria-label={t('common.switchLanguage')}
      title={t('common.switchLanguage')}
    >
      <Languages className="size-4" />
      <span>{i18n.language === "ar" ? "EN" : "ع"}</span>
    </button>
  );
}

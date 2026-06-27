/**
 * src/hooks/useLanguageDirection.ts
 *
 * Custom hook — syncs document direction (`dir`) and language (`lang`)
 * attributes with the current i18n language.
 *
 * SRP: Decouples global layout direction from individual components.
 * OCP: Easily extendable for vertical scripts or additional RTL languages.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Languages that require right-to-left layout */
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

export function useLanguageDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRtl = RTL_LANGUAGES.includes(i18n.language);
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
}

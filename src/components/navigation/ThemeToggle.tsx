/**
 * ThemeToggle
 *
 * Circular button that switches between light and dark modes by toggling
 * the `.dark` class on `<html>` — matching the `@custom-variant dark` rule
 * defined in index.css.
 *
 * Persistence: the user's preference is stored in `localStorage.theme`
 * ("dark" | "light") and re-applied on the next page load via the inline
 * script in __root.tsx (or index.html), preventing a flash of wrong theme.
 *
 * Visual:
 *   ☀️  Sun icon  → currently dark,  click to go light
 *   🌙  Moon icon → currently light, click to go dark
 */

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

/** Read initial theme from <html> class set by the flash-prevention script */
function getInitialDark(): boolean {
    if (typeof window === "undefined") return true;

    const html = document.documentElement;
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "light") return false;
    if (storedTheme === "dark") return true;

    return html.classList.contains("dark") || true;
}

export default function ThemeToggle() {
    const { t } = useTranslation();
    const [isDark, setIsDark] = useState(getInitialDark);

    /* Sync the .dark class and localStorage whenever state changes */
    useEffect(() => {
        const root = document.documentElement;

        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label={isDark ? t('common.switchToLight') : t('common.switchToDark')}
            className="h-9 w-9 rounded-full border border-white/20 text-white/80 hover:border-brand-warm hover:bg-brand-warm/10 hover:text-brand-warm focus-visible:ring-2 focus-visible:ring-brand-warm"
        >
            {isDark ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
            )}
        </Button>
    );
}
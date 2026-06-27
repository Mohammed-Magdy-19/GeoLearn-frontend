/**
 * LevelsDropdown
 *
 * Desktop navigation dropdown for academic level summaries.
 * Uses shadcn DropdownMenu for consistent accessibility and interaction.
 */

import { Link } from "react-router";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LEVEL_ITEMS } from "../features/home/data/homeData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LevelsDropdown() {
    const { t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow-brand transition-all duration-200 hover:brightness-110 hover:shadow-brand-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
                {t('summaries.title')}
                <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200"
                    aria-hidden="true"
                />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-44">
                {LEVEL_ITEMS.map((item) => (
                    <DropdownMenuItem
                        key={item.slug}
                        render={
                            <Link
                                to={`/levels#${item.slug}`}
                                className="block w-full px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-brand-primary/10 hover:text-white"
                            />
                        }
                    >
                        {item.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

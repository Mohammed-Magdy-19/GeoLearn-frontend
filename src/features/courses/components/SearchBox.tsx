// src/features/courses/components/SearchBox.tsx
// ─────────────────────────────────────────────────────────────
// Search Box Component — shadcn Input with search icon
// ─────────────────────────────────────────────────────────────

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBox({
    value,
    onChange,
    placeholder,
}: SearchBoxProps) {
    const { t } = useTranslation();
    const resolvedPlaceholder = placeholder || t('courses.searchPlaceholder');
    return (
        <div className="relative mb-6">
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={resolvedPlaceholder}
                className="w-full px-4 py-3 pl-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="size-5 text-muted-foreground" />
            </span>
        </div>
    );
}

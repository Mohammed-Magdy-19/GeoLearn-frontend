/**
 * src/components/feedback/PageLoader.tsx
 *
 * Full-page loading spinner used as the Suspense fallback for
 * lazily loaded route-level components.
 *
 * Centered vertically and horizontally with a subtle animation.
 */

import { useTranslation } from 'react-i18next';

export default function PageLoader() {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                {/* Animated spinner ring */}
                <div className="relative size-12">
                    <div
                        className="absolute inset-0 rounded-full border-[3px] border-border"
                    />
                    <div
                        className="absolute inset-0 rounded-full border-[3px] border-transparent
                                   border-t-brand-primary animate-spin"
                    />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                    {t('common.loading')}
                </p>
            </div>
        </div>
    );
}

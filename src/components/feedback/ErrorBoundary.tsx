/**
 * src/components/ErrorBoundary.tsx
 *
 * React class-based Error Boundary.
 *
 * Why a class component?
 *   React's componentDidCatch / getDerivedStateFromError lifecycle methods
 *   are only available on class components. Function components + hooks
 *   cannot catch render errors in their own subtree.
 *
 * Usage:
 *   Wrap any subtree that might throw during render:
 *
 *   <ErrorBoundary>
 *     <SomeFeature />
 *   </ErrorBoundary>
 *
 *   Or with a custom fallback:
 *
 *   <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *     <SomeFeature />
 *   </ErrorBoundary>
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// ── Props & State ─────────────────────────────────────────────────────────

interface Props {
    children: ReactNode;
    /** Optional custom fallback UI. Receives the error and a reset function. */
    fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// ── Default Fallback UI ────────────────────────────────────────────────────

function DefaultErrorFallback({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    const { t } = useTranslation();
    return (
        <div
            role="alert"
            className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"
        >
            {/* Icon */}
            <div
                className="mb-6 grid h-20 w-20 place-items-center rounded-2xl
                      bg-destructive/10 text-4xl ring-1 ring-destructive/20"
            >
                <AlertTriangle className="size-8 text-destructive" />
            </div>

            {/* Heading */}
            <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">
                {t("errors.somethingWentWrong")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("errors.errorBoundaryDescription")}
            </p>

            {/* Technical detail — collapsed by default */}
            {import.meta.env.DEV && error.message && (
                <details className="mx-auto mt-4 max-w-lg text-start">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Error details (dev)
                    </summary>
                    <pre
                        className="mt-2 overflow-auto rounded-xl bg-muted px-4 py-3
                          text-start text-xs text-destructive"
                    >
                        {error.message}
                    </pre>
                </details>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                    onClick={reset}
                    className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-bold
                     text-white shadow-brand transition hover:brightness-110"
                    size="lg"
                >
                    {t("errors.tryAgain")}
                </Button>
                <a
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {t("errors.goToHome")}
                </a>
            </div>
        </div>
    );
}

// ── Error Boundary Class ───────────────────────────────────────────────────

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Log to console in dev; swap for Sentry / a real reporter in production
        console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (hasError && error) {
            // Use the custom fallback if provided, otherwise the default UI
            if (fallback) return fallback({ error, reset: this.reset });
            return <DefaultErrorFallback error={error} reset={this.reset} />;
        }

        return children;
    }
}
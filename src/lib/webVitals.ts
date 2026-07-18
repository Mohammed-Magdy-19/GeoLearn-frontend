/**
 * src/lib/webVitals.ts
 *
 * Core Web Vitals performance monitoring utility.
 *
 * Captures LCP, FID, CLS, INP, and TTFB using the native
 * PerformanceObserver API. Zero external dependencies.
 *
 * Usage (in main.tsx):
 *   import { reportWebVitals } from './lib/webVitals';
 *   reportWebVitals(console.log);
 *   // or send to analytics:
 *   reportWebVitals((metric) => sendToAnalytics(metric));
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface WebVitalMetric {
  /** Metric name identifier */
  name: "LCP" | "FID" | "CLS" | "INP" | "TTFB";
  /** Metric value in milliseconds (or unitless for CLS) */
  value: number;
  /** Rating based on Google's thresholds */
  rating: "good" | "needs-improvement" | "poor";
  /** Navigation type (e.g., "navigate", "reload", "back_forward") */
  navigationType: string;
}

export type WebVitalReportCallback = (metric: WebVitalMetric) => void;

// ── Thresholds (per Google's Web Vitals documentation) ─────────────────────

const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  FID: [100, 300],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  TTFB: [800, 1800],
};

function getRating(name: string, value: number): WebVitalMetric["rating"] {
  const [good, poor] = THRESHOLDS[name] ?? [Infinity, Infinity];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

// ── Observer helpers ───────────────────────────────────────────────────────

function getNavigationType(): string {
  const nav = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;
  return nav?.type ?? "navigate";
}

function observe(
  type: string,
  callback: (entries: PerformanceEntryList) => void
): PerformanceObserver | undefined {
  try {
    if (!PerformanceObserver.supportedEntryTypes?.includes(type)) {
      return undefined;
    }
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });
    observer.observe({ type, buffered: true });
    return observer;
  } catch {
    return undefined;
  }
}

// ── Metric collectors ──────────────────────────────────────────────────────

function observeLCP(onReport: WebVitalReportCallback): void {
  observe("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) {
      onReport({
        name: "LCP",
        value: last.startTime,
        rating: getRating("LCP", last.startTime),
        navigationType: getNavigationType(),
      });
    }
  });
}

function observeFID(onReport: WebVitalReportCallback): void {
  observe("first-input", (entries) => {
    const first = entries[0] as PerformanceEventTiming | undefined;
    if (first) {
      const value = first.processingStart - first.startTime;
      onReport({
        name: "FID",
        value,
        rating: getRating("FID", value),
        navigationType: getNavigationType(),
      });
    }
  });
}

function observeCLS(onReport: WebVitalReportCallback): void {
  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  observe("layout-shift", (entries) => {
    for (const entry of entries) {
      const lsEntry = entry as PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
      };
      if (lsEntry.hadRecentInput) continue;

      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

      if (
        sessionEntries.length > 0 &&
        firstSessionEntry &&
        lastSessionEntry &&
        entry.startTime - lastSessionEntry.startTime < 1000 &&
        entry.startTime - firstSessionEntry.startTime < 5000
      ) {
        sessionValue += lsEntry.value ?? 0;
        sessionEntries.push(entry);
      } else {
        sessionValue = lsEntry.value ?? 0;
        sessionEntries = [entry];
      }

      if (sessionValue > clsValue) {
        clsValue = sessionValue;
        onReport({
          name: "CLS",
          value: clsValue,
          rating: getRating("CLS", clsValue),
          navigationType: getNavigationType(),
        });
      }
    }
  });
}

function observeINP(onReport: WebVitalReportCallback): void {
  const interactions: number[] = [];

  observe("event", (entries) => {
    for (const entry of entries) {
      const eventEntry = entry as PerformanceEventTiming & {
        interactionId?: number;
      };
      if (eventEntry.interactionId) {
        const duration = eventEntry.duration;
        interactions.push(duration);
      }
    }

    if (interactions.length > 0) {
      interactions.sort((a, b) => b - a);
      const highPercentileIndex = Math.min(
        interactions.length - 1,
        Math.floor(interactions.length / 50 + 1)
      );
      const inp = interactions[highPercentileIndex] ?? 0;
      onReport({
        name: "INP",
        value: inp,
        rating: getRating("INP", inp),
        navigationType: getNavigationType(),
      });
    }
  });
}

function observeTTFB(onReport: WebVitalReportCallback): void {
  const nav = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;

  if (nav) {
    const value = nav.responseStart - nav.requestStart;
    onReport({
      name: "TTFB",
      value,
      rating: getRating("TTFB", value),
      navigationType: nav.type,
    });
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Initializes Core Web Vitals monitoring and reports each metric
 * via the provided callback function.
 *
 * @param onReport - Callback invoked with each metric as it becomes available.
 */
export function reportWebVitals(onReport: WebVitalReportCallback): void {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
    return;
  }

  observeLCP(onReport);
  observeFID(onReport);
  observeCLS(onReport);
  observeINP(onReport);
  observeTTFB(onReport);
}

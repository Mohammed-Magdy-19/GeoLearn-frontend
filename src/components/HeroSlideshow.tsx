/**
 * HeroSlideshow
 *
 * Renders a full-bleed, position:absolute background image carousel
 * directly beneath the hero gradient overlay.
 *
 * Behaviour:
 *  - Three images rotate every SLIDE_DURATION ms with an overlapping
 *    cross-fade transition so the outgoing and incoming slides dissolve
 *    simultaneously — no dark gap between them.
 *  - The active image applies a slow Ken Burns (scale 1 → 1.08) zoom.
 *    The zoom is driven by a per-activation key on the <img> element so
 *    the animation restarts cleanly on every slide change without
 *    touching the opacity wrapper (which must stay mounted for the fade).
 *  - Slides 1 and 2 are preloaded via <link rel="preload"> on first
 *    render so all images are in-cache before their turn comes.
 *  - GPU compositing is requested via will-change on both the opacity
 *    wrapper (opacity transition) and the image (transform animation).
 *
 * Stacking contract:
 *   All children stay within z-index 0/1 (inactive / active).
 *   The parent HeroSection places its gradient overlay at z-index ≥ 2
 *   and text content at z-index ≥ 3.
 *
 * This component is purely presentational — no props, no external state.
 */

import { useEffect, useRef, useState } from "react";
import i18n from "@/i18n";

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
    {
        url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1920&q=80",
        altKey: "home.heroSlide1",
    },
    {
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80",
        altKey: "home.heroSlide2",
    },
    {
        url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1920&q=80",
        altKey: "home.heroSlide3",
    },
] as const;

// ─── Timing constants ─────────────────────────────────────────────────────────

/**
 * How long each slide stays fully visible before the next begins fading in (ms).
 * The actual visible hold is SLIDE_DURATION. The fade then OVERLAPS: the next
 * slide starts rising while the current one is still falling, so the total
 * interval between index changes is SLIDE_DURATION (not SLIDE_DURATION + FADE).
 */
const SLIDE_DURATION = 5_000;

/**
 * Cross-fade duration (ms).
 *
 * SMOOTHNESS FIX 2: raised from 1 000 → 1 600 ms.
 * A 1 s fade is perceptible as a "cut". 1.6 s reads as a true film dissolve.
 *
 * SMOOTHNESS FIX 4 (overlap): kept equal to the overlap window between slides.
 * By firing setCurrent every SLIDE_DURATION ms — shorter than SLIDE_DURATION +
 * FADE_DURATION — the incoming slide begins fading IN while the outgoing slide
 * is still fading OUT. The two cross-fade simultaneously: no dark gap.
 */
const FADE_DURATION_MS = 1_600;

/**
 * Easing for the opacity cross-fade.
 *
 * SMOOTHNESS FIX 1: replaced `ease-in-out` with a custom cubic-bezier.
 * `ease-in-out` is symmetrical (slow → fast → slow), which makes the
 * midpoint of the dissolve feel abrupt. This curve accelerates quickly
 * out of the current slide and decelerates gently into the new one —
 * the perceptual equivalent of a film dissolve rather than a cross-cut.
 */
const FADE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSlideshow() {
    const [current, setCurrent] = useState(0);

    /**
     * SMOOTHNESS FIX 3 — Ken Burns restart key.
     *
     * The original code toggled `animation: "none" / "ken-burns …"` on the
     * same DOM node. Browsers may batch style recalculations and skip the
     * "none" frame, meaning the zoom never resets between slides.
     *
     * Instead we track an activation counter per slide index. Each time a
     * slide becomes active its counter increments, which is passed as `key`
     * to the <img>. React unmounts/remounts the img (but NOT its wrapper div),
     * so the opacity transition on the wrapper continues uninterrupted while
     * the img gets a brand-new CSS animation context — guaranteed restart.
     */
    const activationCountRef = useRef<number[]>(SLIDES.map(() => 0));

    // Advance the activation counter for the slide that just became active.
    useEffect(() => {
        activationCountRef.current[current] += 1;
    }, [current]);

    // ── Preload images ──────────────────────────────────────────────────────────
    /**
     * SMOOTHNESS FIX 6 — actual preload implementation.
     * The original docblock claimed preloads existed but contained no code.
     * We inject <link rel="preload"> tags for every slide except the first
     * (which is already `loading="eager" fetchPriority="high"`) so all
     * images are in the browser cache before their turn arrives.
     */
    useEffect(() => {
        SLIDES.forEach((slide, i) => {
            if (i === 0) return; // First slide handled by eager loading on the img.
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = slide.url;
            link.fetchPriority = "low";
            document.head.appendChild(link);
        });
    }, []); // Run once on mount — SLIDES is static.

    // ── Slide rotation ──────────────────────────────────────────────────────────
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, SLIDE_DURATION);

        return () => clearInterval(timer);
    }, []);

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            {SLIDES.map((slide, i) => {
                const isActive = i === current;

                return (
                    <div
                        key={slide.url}
                        className="absolute inset-0"
                        style={{
                            opacity: isActive ? 1 : 0,
                            transition: `opacity ${FADE_DURATION_MS}ms ${FADE_EASING}`,
                            zIndex: isActive ? 1 : 0,
                            /**
                             * SMOOTHNESS FIX 5a — GPU compositing for the opacity transition.
                             * Declaring will-change: opacity promotes this layer to the GPU
                             * compositor, eliminating CPU-driven repaints during the fade.
                             */
                            willChange: "opacity",
                        }}
                    >
                        <img
                            /**
                             * SMOOTHNESS FIX 3 — unique key forces img remount on activation.
                             * activationCountRef.current[i] increments each time slide i
                             * becomes active, giving React a new key and triggering a clean
                             * unmount → remount of only the <img>, not the wrapper div.
                             * The wrapper's opacity transition is therefore unaffected.
                             */
                            key={`${slide.url}-${activationCountRef.current[i]}`}
                            src={slide.url}
                            alt={i18n.t(slide.altKey)}
                            className="h-full w-full object-cover"
                            style={{
                                animation: isActive ? "ken-burns 8s ease-out both" : "none",
                                transformOrigin: "center center",
                                /**
                                 * SMOOTHNESS FIX 5b — GPU compositing for the Ken Burns zoom.
                                 * will-change: transform keeps the scaled image on its own
                                 * compositor layer, preventing layout thrash during scaling.
                                 */
                                willChange: isActive ? "transform" : "auto",
                            }}
                            loading={i === 0 ? "eager" : "lazy"}
                            fetchPriority={i === 0 ? "high" : "low"}
                        />
                    </div>
                );
            })}
        </div>
    );
}
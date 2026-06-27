import { lazy, Suspense } from "react";
import { GraduationCap, Coffee, Map, Sparkles } from "lucide-react";
import { TypeAnimation } from 'react-type-animation';
import { useTranslation } from 'react-i18next';

const EgyptMap3D = lazy(() => import("../../../components/EgyptMap3D"));

/** Animated skeleton shown while the 3D globe canvas lazy-loads */
function GlobeLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-light dark:bg-bg-dark transition-colors duration-500">
      {/* Pulsing wireframe globe rings */}
      <div className="globe-loader" aria-label="Loading globe…">
        <div className="globe-loader__ring globe-loader__ring--equator" />
        <div className="globe-loader__ring globe-loader__ring--meridian-1" />
        <div className="globe-loader__ring globe-loader__ring--meridian-2" />
        <div className="globe-loader__glow" />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  return (
    <section
      id="home"
      className="relative min-h-[90vh] overflow-hidden transition-colors duration-500 bg-bg-light dark:bg-bg-dark"
    >
      {/* 3D Egypt map background layer */}
      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={<GlobeLoader />}>
          <EgyptMap3D />
        </Suspense>
      </div>

      {/*
       * Gradient overlay — very strong in light mode so dark text is
       * crystal clear. The globe shows through subtly as atmosphere.
       * Minimal in dark mode where white text naturally contrasts.
       */}
      <div
        className="absolute inset-0 z-[2] transition-all duration-500
          bg-gradient-to-b from-bg-light/90 via-bg-light/70 to-bg-light/90
          dark:from-bg-dark/20 dark:via-transparent dark:to-bg-dark/60"
        aria-hidden="true"
      />

      {/* Content — key forces full remount (re-animation) on language change */}
      <div key={i18n.language} className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-28 text-center sm:py-36">

        {/* Main headline */}
        <h1 className="font-display text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
          <span className="block animate-fade-in-up text-brand-secondary dark:text-white transition-colors duration-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:drop-shadow-none">
            {t("home.heroTitle1")}
          </span>
          <span className="block animate-fade-in-up text-brand-primary dark:text-brand-warm animation-delay-200 transition-colors duration-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:drop-shadow-none">
            {t("home.heroTitle2")} <Coffee className="inline size-[0.75em] mb-1" /> <Map className="inline size-[0.75em] mb-1" />
          </span>
        </h1>

        {/* Subtitle — initiative name */}
        <div className="mx-auto mt-6 max-w-fit text-xl font-bold text-brand-primary dark:text-brand-warm/90 transition-colors duration-500 flex items-center gap-2">
          <TypeAnimation
            sequence={[
              t('home.initiativeName')
            ]}
            wrapper="p"
            speed={40}
            repeat={0}
            cursor={false}
          />
          <Sparkles className="size-5 animate-pulse" aria-hidden="true" />
        </div>

        {/* Body description */}
        <div className="mx-auto mt-3 max-w-2xl text-lg font-medium leading-relaxed text-brand-secondary/90 dark:text-white/75 transition-colors duration-500">
          <TypeAnimation
            sequence={[
              2000,
              t('home.heroDescription1'),
              1000,
              t('home.heroDescription2'),
              1000,
              t('home.heroDescription3'),
            ]}
            wrapper="p"
            speed={65}
            style={{ display: 'block', minHeight: '4.5em' }}
            repeat={0}
            cursor={false}
          />
        </div>

        {/* Primary CTA button */}
        <div className="animate-fade-in-up animation-delay-500">
          <a
            href="#courses"
            className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-brand-gradient px-10 py-4 text-lg font-bold text-white shadow-brand transition-all duration-300 hover:scale-105 hover:shadow-brand-lg hover:brightness-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 focus:ring-offset-bg-light dark:focus:ring-offset-bg-dark"
          >
            <GraduationCap className="size-5" aria-hidden="true" />
            {t("home.exploreCourses")}
          </a>
        </div>
      </div>

      {/* Bottom fade to content below */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[2] h-24 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
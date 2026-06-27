/**
 * AboutSection
 *
 * Platform introduction and mission statement section.
 * Displays feature cards in a responsive grid layout.
 */

import { useTranslation } from "react-i18next";
import SectionHeader from "../../../components/SectionHeader";
import AboutCard from "../../../components/AboutCard";
import { ABOUT_ITEMS } from "../data/homeData";

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section id="about" className="bg-secondary/40 py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          primaryText={t("home.aboutPrimary")}
          highlightText={t("home.aboutHighlight")}
          subtitle={t("home.aboutSubtitle")}
          subtitleMaxWidth="2xl"
        />

        {/* About cards grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ABOUT_ITEMS.map((item, index) => (
            <AboutCard key={item.titleKey || item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

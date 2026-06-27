/**
 * Footer
 *
 * Site footer with brand info, quick links, contact details,
 * and copyright notice.
 */

import { QUICK_LINKS } from "../../features/home/data/homeData";
import { MapPin, Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/GeoLearn-logo.jpeg";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-brand-secondary text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {/* Brand column */}
        <div>
          <div className="flex items-center gap-3">
            <span
            className="grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-2xl shadow-brand"
            style={{
              backgroundImage: `url(${logo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
            <div>
              <p className="font-display text-lg font-bold text-white">
                {t("common.brandName")}
              </p>
              <p className="text-xs text-brand-warm">{t("common.brandTagline")}</p>
            </div>
          </div>
          <p className="mt-4 text-base text-white/70 leading-relaxed max-w-sm mx-auto">
              {t("home.authPanelDescription")}
            </p>
        </div>

        {/* Quick links column */}
        <div>
          <h4 className="font-display text-lg font-bold text-white">
            {t("footer.quickLinks")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition-colors hover:text-brand-warm focus:text-brand-warm focus:outline-none"
                >
                  {link.labelKey ? t(link.labelKey) : link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h4 className="font-display text-lg font-bold text-white">
            {t("footer.contactUs")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
              <span>{t("home.address")}</span>
            </li>
            <li>
              <a
                href="mailto:ahmed.adelenab@gmail.com"
                className="flex items-center gap-2 transition-colors hover:text-brand-warm"
              >
                <Mail className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
                <span>ahmed.adelenab@gmail.com</span>
              </a>
            </li>
            <li dir="ltr" className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
              <a
                href="tel:01550099124"
                className="transition-colors hover:text-brand-warm"
              >
                01550099124
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-xs text-white/50">
          {t("common.allRightsReserved")}
        </div>
      </div>
    </footer>
  );
}

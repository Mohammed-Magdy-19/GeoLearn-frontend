/**
 * Home Page Static Data
 *
 * All content constants for the GeoLearn Academy home page.
 * Keeping data separate from components enables:
 * - Easy content updates without touching UI code
 * - Future CMS integration with minimal refactoring
 * - Clear separation of concerns (data vs. presentation)
 *
 * IMPORTANT: Strings that need translation use `titleKey` / `bodyKey`
 * instead of literal `title` / `body`. Components must call t() at
 * render time to resolve these keys.
 */

import { Crosshair, Handshake, Lightbulb, BarChart3, MapPin, Mail, Phone } from "lucide-react";

import type {
    Course,
    AboutItem,
    StatItem,
    LevelItem,
    QuickLink,
    ContactInfo,
} from "../types/home";

/** Available course offerings displayed on the home page */
export const COURSES: readonly Course[] = [
    {
        slug: "arcgis-pro",
        title: "courses.masterArcGIS",
        badge: "courses.bestSeller",
        hours: "courses.hours",
        level: "courses.beginnerToAdvanced",
        description: "courses.masterArcGISDesc",
        price: "3,700",
        logoImage:
            "https://upload.wikimedia.org/wikipedia/commons/d/df/ArcGIS_logo.png",
        coverImage:
            "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80",
    },
    {
        slug: "surveying-basics",
        title: "courses.surveyingBasics",
        badge: null,
        hours: "courses.hours",
        level: "courses.beginner",
        description: "courses.surveyingBasicsDesc",
        price: "3,450",
        logoImage: null,
        coverImage:
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
    },
    {
        slug: "remote-sensing-drones",
        title: "courses.remoteSensing",
        badge: "courses.new",
        hours: "courses.hours",
        level: "courses.intermediate",
        description: "courses.remoteSensingDesc",
        price: "3,000",
        logoImage: null,
        coverImage:
            "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80",
    },
];

/** About section info cards — uses translation keys */
export const ABOUT_ITEMS: readonly AboutItem[] = [
    {
        icon: <Crosshair className="size-7 text-white" />,
        title: "home.goalTitle",
        titleKey: "home.goalTitle",
        body: "home.goalBody",
        bodyKey: "home.goalBody",
    },
    {
        icon: <Handshake className="size-7 text-white" />,
        title: "home.initiativeTitle",
        titleKey: "home.initiativeTitle",
        body: "home.initiativeBody",
        bodyKey: "home.initiativeBody",
    },
    {
        icon: <Lightbulb className="size-7 text-white" />,
        title: "home.methodTitle",
        titleKey: "home.methodTitle",
        body: "home.methodBody",
        bodyKey: "home.methodBody",
    },
    {
        icon: <BarChart3 className="size-7 text-white" />,
        title: "home.visionTitle",
        titleKey: "home.visionTitle",
        body: "home.visionBody",
        bodyKey: "home.visionBody",
    },
];


/** Hero section statistics counters — uses translation keys */
export const HERO_STATS: readonly StatItem[] = [
    { value: "+500", label: "home.registeredStudents", labelKey: "home.registeredStudents" },
    { value: "3", label: "home.specializedCourses", labelKey: "home.specializedCourses" },
    { value: "100%", label: "home.studentSatisfaction", labelKey: "home.studentSatisfaction" },
];

/** Academic level dropdown items — uses translation keys */
export const LEVEL_ITEMS: readonly LevelItem[] = [
    { slug: "level-1", label: "home.level1", labelKey: "home.level1" },
    { slug: "level-2", label: "home.level2", labelKey: "home.level2" },
    { slug: "level-3", label: "home.level3", labelKey: "home.level3" },
    { slug: "level-4", label: "home.level4", labelKey: "home.level4" },
];

/** Quick navigation links for footer — uses translation keys */
export const QUICK_LINKS: readonly QuickLink[] = [
    { label: "home.quickLinkHome", labelKey: "home.quickLinkHome", href: "#home" },
    { label: "home.quickLinkCourses", labelKey: "home.quickLinkCourses", href: "#courses" },
    { label: "home.quickLinkAbout", labelKey: "home.quickLinkAbout", href: "#about" },
];

/** Footer contact information items */
export const CONTACT_INFO_ITEMS: readonly ContactInfo[] = [
    {
        icon: <MapPin className="size-4 shrink-0" />,
        text: "home.address",
        textKey: "home.address",
    },
    {
        icon: <Mail className="size-4 shrink-0" />,
        text: "ahmed.adelenab@gmail.com",
        href: "mailto:ahmed.adelenab@gmail.com",
    },
    {
        icon: <Phone className="size-4 shrink-0" />,
        text: "01550099124",
        href: "tel:01550099124",
        isLtr: true,
    },
];

/** Hero slideshow background images */
export const HERO_SLIDES: readonly string[] = [
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80",
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1600&q=80",
];

/**
 * src/components/ContactSection.tsx
 *
 * Contact / enquiry form section.
 * Extracted from the home page so form logic is self-contained
 * and can be wired to a real backend endpoint later without
 * touching the page layout.
 *
 * Uses shadcn/ui components: Input, Label, Textarea, Button.
 */

import { useState, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
    const { t } = useTranslation();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        // Phase 4: wire to a real email/backend endpoint here
        await new Promise((r) => setTimeout(r, 800)); // simulate network
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <section id="contact" className="bg-background py-24">
            <div className="mx-auto max-w-3xl px-6">
                {/* Heading */}
                <div className="text-center">
                    <h2 className="font-display text-4xl font-black sm:text-5xl">
                        {t("contact.titlePrimary")}{" "}
                        <span className="relative inline-block">
                            {t("contact.titleHighlight")}
                            <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-brand-primary" />
                        </span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                        {t("contact.subtitle")}
                    </p>
                </div>

                {/* Form */}
                <div className="mt-12 rounded-2xl bg-card p-8 shadow-card ring-1 ring-border">
                    {submitted ? (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-3xl shadow-brand">
                                <CircleCheck className="size-8 text-white" />
                            </div>
                            <p className="font-display text-xl font-bold text-foreground">
                                {t("contact.messageSent")}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t("contact.willContactSoon")}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSubmitted(false)}
                                className="mt-6 rounded-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                            >
                                {t("contact.sendAnother")}
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="space-y-5">
                            {/* Name + Email row */}
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <Label
                                        htmlFor="contact-name"
                                        className="mb-1.5"
                                    >
                                        {t("contact.fullName")}
                                    </Label>
                                    <Input
                                        id="contact-name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder={t("contact.fullNamePlaceholder")}
                                        className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="contact-email"
                                        className="mb-1.5"
                                    >
                                        {t("contact.email")}
                                    </Label>
                                    <Input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="example@email.com"
                                        dir="ltr"
                                        className="rounded-xl px-4 py-2.5 focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <Label
                                    htmlFor="contact-message"
                                    className="mb-1.5"
                                >
                                    {t("contact.yourMessage")}
                                </Label>
                                <Textarea
                                    id="contact-message"
                                    name="message"
                                    required
                                    rows={5}
                                    placeholder={t("contact.messagePlaceholder")}
                                    className="rounded-xl px-4 py-2.5 resize-none focus-visible:ring-brand-primary/50 focus-visible:border-brand-primary/60"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold text-white shadow-brand transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                size="lg"
                            >
                                {loading ? t("contact.sending") : t("common.send") + " " + t("contact.yourMessage")}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
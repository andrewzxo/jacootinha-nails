"use client";

import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_TESTIMONIALS } from "@/lib/studio-data";
import { Reveal } from "./Reveal";

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 lg:py-28 bg-[var(--blush)]/60 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-script text-4xl text-[var(--rose-deep)] mb-2">Depoimentos</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--charcoal)]">
            Quem vive a experiência, recomenda
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-[var(--gold)] to-[var(--rose-soft)] mx-auto mt-5" />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} delay={i * 90}>
              <figure className="card-lift relative rounded-2xl bg-white border border-[var(--gold)]/25 p-6 h-full shadow-sm">
                <Quote size={36} className="absolute -top-4 right-5 text-[var(--gold)]/40 rotate-180" />
                <div className="flex gap-0.5 mb-4" aria-label={`${t.rating} de 5 estrelas`}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={15} className="text-[var(--gold)] fill-[var(--gold)]" />
                  ))}
                </div>
                <blockquote className="text-sm text-foreground/80 leading-relaxed">
                  “{t.text}”
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-5 pt-4 border-t border-[var(--gold)]/15">
                  <Avatar className="h-9 w-9 border border-[var(--gold)]/40">
                    <AvatarFallback className="bg-[var(--blush)] text-[var(--rose-deep)] font-semibold text-xs">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-[var(--charcoal)]">{t.name}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

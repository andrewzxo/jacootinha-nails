"use client";

import Image from "next/image";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/studio-data";
import { Reveal } from "./Reveal";

export function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      <Image
        src="/images/hero.png"
        alt="Jacootinha Nails — alongamentos sofisticados"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--charcoal)]/80 via-[var(--charcoal)]/50 to-[var(--rose-deep)]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
        <Reveal className="max-w-2xl">
          <p className="inline-flex items-center rounded-full border border-white/30 bg-black/30 backdrop-blur px-4 py-1.5 text-xs sm:text-sm text-white/90 tracking-wide animate-fade-up">
            {BUSINESS.heroEyebrow}
          </p>
          <p className="font-script text-4xl sm:text-5xl text-[var(--gold-light)] mb-3 mt-4 animate-fade-up">
            Bem-vinda ao seu momento
          </p>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] animate-fade-up" style={{ animationDelay: "120ms" }}>
            Jacootinha <br />
            <span className="gold-shimmer-text">Nails</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--gold-light)] to-transparent my-6 animate-fade-up" style={{ animationDelay: "240ms" }} />
          <p className="text-white/85 text-base sm:text-lg max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: "320ms" }}>
            {BUSINESS.tagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-up" style={{ animationDelay: "420ms" }}>
            <Button
              size="lg"
              onClick={onBook}
              className="btn-gold-shimmer text-white font-semibold text-base h-13 px-8 tracking-wide gap-2"
            >
              <CalendarDays size={18} /> Agendar Horário
            </Button>
            <Button
              size="lg"
              asChild
              className="text-base h-13 px-8 tracking-wide bg-white/15 backdrop-blur-md border border-white/70 text-white hover:bg-white/25 hover:text-white"
            >
              <a href="#servicos">Ver Serviços</a>
            </Button>
          </div>
        </Reveal>
      </div>

      <a href="#servicos" aria-label="Rolar para serviços" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 hover:text-white animate-bounce">
        <ChevronDown size={28} />
      </a>
    </section>
  );
}

"use client";

import Image from "next/image";
import { Clock, ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudioStore } from "@/lib/studio-store";
import { formatBRL } from "@/lib/studio-data";
import { Reveal } from "./Reveal";

export function Services({ onBook }: { onBook: (serviceId?: string) => void }) {
  const services = useStudioStore((s) => s.services);
  const active = services.filter((s) => s.active);

  return (
    <section id="servicos" className="py-20 lg:py-28 bg-gradient-to-b from-background to-[var(--cream)] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-script text-4xl text-[var(--rose-deep)] mb-2">Nossos Serviços</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--charcoal)]">
            Cuidado & arte para suas mãos
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-[var(--gold)] to-[var(--rose-soft)] mx-auto mt-5" />
          <p className="text-muted-foreground mt-5">
            Cada serviço é uma experiência — produtos premium, técnica impecável e atendimento que te faz se especial.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {active.map((svc, i) => (
            <Reveal key={svc.id} delay={i * 80}>
              <article
                className="card-lift group rounded-2xl border border-[var(--gold)]/25 bg-white overflow-hidden shadow-sm h-full flex flex-col cursor-pointer"
                onClick={() => onBook(svc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onBook(svc.id)}
                aria-label={`Agendar ${svc.name}`}
              >
                <div className="relative h-32 sm:h-44 lg:h-52 overflow-hidden">
                  <Image
                    src={svc.image}
                    alt={svc.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ objectPosition: svc.imagePosition || "center" }}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[var(--gold)]/95 text-[var(--charcoal)] hover:bg-[var(--gold)] gap-1 border-0 text-[10px] sm:text-xs">
                    <Clock size={11} /> {svc.durationMin} min
                  </Badge>
                </div>
                <div className="p-3 sm:p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base sm:text-xl font-bold text-[var(--charcoal)] leading-tight">{svc.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed flex-1 line-clamp-2 sm:line-clamp-none">{svc.description}</p>
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--gold)]/20">
                    <span className="font-display text-lg sm:text-2xl font-bold text-[var(--rose-deep)]">
                      {formatBRL(svc.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-[var(--gold)] group-hover:gap-2.5 transition-all">
                      Agendar <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => onBook()}
            className="btn-gold-shimmer text-white font-semibold h-12 px-10 tracking-wide gap-2"
          >
            <CalendarDays size={18} /> Agendar meu horário
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

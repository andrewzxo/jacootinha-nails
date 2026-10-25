"use client";

import Image from "next/image";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";

export function Courses() {
  return (
    <section id="cursos" className="relative py-16 lg:py-20 bg-[var(--charcoal)] text-white overflow-hidden scroll-mt-16">
      {/* decorative blobs */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--rose-deep)]/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--gold)]/15 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-[var(--gold)]/30 bg-white/5 backdrop-blur overflow-hidden shadow-2xl shadow-black/40">
            <div className="grid sm:grid-cols-[180px_1fr] items-stretch">
              <div className="relative min-h-40 sm:min-h-full">
                <Image
                  src="/images/curso/capa.png"
                  alt="Curso Pro Nails — Molde F1"
                  fill
                  className="object-cover"
                  sizes="180px"
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--gold-light)] mb-2">
                    <GraduationCap size={15} /> Curso
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold leading-snug">
                    Quer se tornar profissional? Conheça o Curso Pro Nails — Molde F1
                  </h2>
                  <p className="text-white/70 mt-2 text-sm">
                    Aprenda a técnica mais inovadora do mercado com metodologia simplificada e treino em modelos.
                  </p>
                </div>
                <Button
                  asChild
                  className="btn-gold-shimmer text-white font-semibold h-11 px-6 tracking-wide shrink-0"
                >
                  <a href="/?area=curso">
                    Ver curso <ArrowRight size={16} />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

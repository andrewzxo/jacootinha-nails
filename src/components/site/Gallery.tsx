"use client";

import Image from "next/image";
import { useStudioStore } from "@/lib/studio-store";
import { Reveal } from "./Reveal";

export function Gallery() {
  const gallery = useStudioStore((s) => s.gallery);

  // Fallback while loading or if the API is unavailable
  const images =
    gallery.length > 0
      ? gallery.map((g, i) => ({ src: g.url, alt: g.caption || "Trabalho realizado", tall: i % 2 === 0, pos: g.imagePosition || "center" }))
      : [
          { src: "/images/gallery1.webp", alt: "Alongamento em gel com acabamento natural", tall: true, pos: "center" },
          { src: "/images/gallery2.webp", alt: "Esmaltação impecável em tom clássico", tall: false, pos: "center" },
          { src: "/images/gallery3.webp", alt: "Nail art sofisticada dourada", tall: true, pos: "center" },
          { src: "/images/gallery4.webp", alt: "Manutenção e blindagem da unha natural", tall: false, pos: "center" },
        ];

  return (
    <section id="galeria" className="py-20 lg:py-28 bg-gradient-to-b from-[var(--cream)] to-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-script text-4xl text-[var(--rose-deep)] mb-2">Trabalhos Recentes</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[var(--charcoal)]">
            Nosso portfólio
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-[var(--gold)] to-[var(--rose-soft)] mx-auto mt-5" />
          <p className="text-muted-foreground mt-5">
            Um pouco do que sai das nossas mãos todos os dias — inspiração para sua próxima visita.
          </p>
        </Reveal>

        <div className="columns-2 lg:columns-4 gap-4 [column-fill:_balance]">
          {images.map((img, i) => (
            <Reveal key={`${img.src}-${i}`} delay={i * 80} className="break-inside-avoid mb-4">
              <div
                className={`relative rounded-2xl overflow-hidden card-lift border border-[var(--gold)]/25 shadow-sm group ${img.tall ? "aspect-[3/4]" : "aspect-square"}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ objectPosition: img.pos }}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                  <p className="text-white text-sm font-medium">{img.alt}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

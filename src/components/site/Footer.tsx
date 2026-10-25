"use client";

import { Instagram, MessageCircle, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useStudioStore } from "@/lib/studio-store";
import { WEEKDAY_LABELS, BUSINESS } from "@/lib/studio-data";
import Image from "next/image";

export function Footer() {
  const workHours = useStudioStore((s) => s.workHours);

  return (
    <footer id="contato" className="mt-auto bg-[var(--charcoal)] text-white scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              <Image src="/images/logo.png" alt="Jacootinha Nails" width={36} height={36} className="rounded-full" />
              <span className="font-display text-xl font-bold">
                Jacootinha <span className="font-script text-2xl text-[var(--gold-light)]">Nails</span>
              </span>
            </a>
            <p className="text-sm text-white/60 leading-relaxed">
              {BUSINESS.tagline}
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href={BUSINESS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Jacootinha Nails"
                className="h-10 w-10 rounded-full border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--charcoal)] transition-colors"
              >
                <Instagram size={17} />
              </a>
              <a
                href={BUSINESS.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Jacootinha Nails"
                className="h-10 w-10 rounded-full border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--charcoal)] transition-colors"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--gold-light)] mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2.5">
                <Instagram size={16} className="text-[var(--gold)] shrink-0" />
                <a
                  href={BUSINESS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @{BUSINESS.instagram.handle}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-[var(--gold)] shrink-0" />
                <a
                  href={BUSINESS.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {BUSINESS.whatsapp.display}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display text-lg font-bold text-[var(--gold-light)] mb-4 flex items-center gap-2">
              <Clock size={17} /> Horários
            </h3>
            <ul className="space-y-1.5 text-sm text-white/70 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {WEEKDAY_LABELS.map((label, i) => {
                const h = workHours[i];
                return (
                  <li key={label} className="flex justify-between gap-3">
                    <span>{label}</span>
                    <span className={h?.open ? "text-white/85" : "text-white/40"}>
                      {h?.open ? `${h.from} – ${h.to}` : "Fechado"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} Jacootinha Nails · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}

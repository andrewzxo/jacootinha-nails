"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  GraduationCap,
  Instagram,
  MessageCircle,
  Menu,
  X,
  Info,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudioStore } from "@/lib/studio-store";
import { BUSINESS, type Course } from "@/lib/studio-data";
import { Reveal } from "./Reveal";

const NAV = [
  { href: "#o-curso", label: "O Curso" },
  { href: "#para-voce", label: "Para Você" },
  { href: "#incluso", label: "Incluso" },
  { href: "#investimento", label: "Investimento" },
];

function GoldDivider() {
  return (
    <div
      className="h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent"
      aria-hidden="true"
    />
  );
}

function CourseHeader({ onEnroll }: { onEnroll: () => void }) {
  const [open, setOpen] = useState(false);
  const { session } = useStudioStore();

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <a href="/?area=curso" className="flex items-center gap-2 group">
            <Image
              src="/images/logo.webp"
              alt="Jacootinha Nails"
              width={40}
              height={40}
              className="rounded-full group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-xl md:text-2xl font-bold text-[var(--charcoal)]">
              Jacootinha <span className="font-script text-2xl md:text-3xl text-[var(--rose-deep)]">Nails</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação do curso">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-foreground/80 hover:text-[var(--rose-deep)] transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-[var(--gold)] after:to-[var(--rose-soft)] after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
            <a href="/" className="text-sm font-medium text-foreground/80 hover:text-[var(--rose-deep)] transition-colors">
              Unhas
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              onClick={onEnroll}
              size="sm"
              className="btn-gold-shimmer text-white font-semibold tracking-wide hidden sm:inline-flex"
            >
              Garantir minha vaga
            </Button>
            {session && (
              <a
                href="/"
                className="hidden md:inline-flex text-sm font-medium text-foreground/70 hover:text-[var(--rose-deep)] transition-colors"
              >
                Olá, {session.name.split(" ")[0]}
              </a>
            )}
            <button
              className="md:hidden p-2 text-[var(--charcoal)]"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[var(--gold)]/20 bg-white/95 backdrop-blur px-4 py-4 space-y-2 animate-fade-up" aria-label="Menu mobile do curso">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-foreground/85 hover:bg-[var(--blush)]"
            >
              {l.label}
            </a>
          ))}
          <a href="/" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-foreground/85 hover:bg-[var(--blush)]">
            Unhas
          </a>
          <Button
            onClick={() => { setOpen(false); onEnroll(); }}
            className="w-full btn-gold-shimmer text-white font-semibold"
          >
            Garantir minha vaga
          </Button>
        </nav>
      )}
    </header>
  );
}

function CourseFooter() {
  return (
    <footer className="mt-auto bg-[var(--charcoal)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <a href="/?area=curso" className="flex items-center gap-2 mb-4">
              <Image src="/images/logo.webp" alt="Jacootinha Nails" width={36} height={36} className="rounded-full" />
              <span className="font-display text-xl font-bold">
                Jacootinha <span className="font-script text-2xl text-[var(--gold-light)]">Nails</span>
              </span>
            </a>
            <p className="text-sm text-white/60 leading-relaxed">
              Curso Pro Nails — Molde F1. Formação profissional em alongamento de unhas com metodologia simplificada e treino em modelos.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-[var(--gold-light)] mb-4">Curso</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Serviços de unhas
                </a>
              </li>
            </ul>
          </div>

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
                <Phone size={16} className="text-[var(--gold)] shrink-0" />
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
        </div>

        <div className="h-px my-8 bg-white/10" aria-hidden="true" />
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} Jacootinha Nails · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}

export function CoursePage({ onEnroll }: { onEnroll: () => void }) {
  const storeCourse = useStudioStore((s) => s.courses.find((c) => c.active) ?? s.courses[0]);
  const [fallbackCourse, setFallbackCourse] = useState<Course | null>(null);
  const course = storeCourse ?? fallbackCourse;

  // Fallback fetch if the store has not loaded (e.g. direct visit to /?area=curso)
  useEffect(() => {
    if (storeCourse) return;
    let alive = true;
    fetch("/api/courses")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((list: Course[]) => {
        if (!alive) return;
        const active = list.find((c) => c.active) ?? list[0];
        if (active) setFallbackCourse(active);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [storeCourse]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f1e8]">
      <CourseHeader onEnroll={onEnroll} />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f1e8] via-[#f3e9dc] to-[#f7f1e8]">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[var(--rose-deep)]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[var(--gold)]/15 blur-3xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--rose-deep)]/80 mb-4">
                Cronograma de Curso
              </p>
              <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-bold text-[var(--charcoal)] leading-tight">
                Curso Pro Nails —{" "}
                <span className="font-script text-[var(--rose-deep)] text-5xl sm:text-6xl xl:text-7xl">Molde F1</span>
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-[var(--gold)] to-transparent mt-5" />
              <p className="mt-5 text-foreground/70 max-w-md leading-relaxed">
                A técnica mais inovadora do mercado com metodologia simplificada e limpa.
                Treino prático em modelos, material completo e certificado.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="bg-[var(--blush)] text-[var(--rose-deep)] border border-[var(--gold)]/40 hover:bg-[var(--blush)] gap-1.5">
                  <GraduationCap size={13} /> {course?.level || "Iniciante"}
                </Badge>
                <Badge className="bg-white/70 text-[var(--charcoal)] border border-[var(--gold)]/40 backdrop-blur hover:bg-white/70 gap-1.5">
                  <Clock size={13} /> {course?.duration || "3 dias · presencial"}
                </Badge>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={onEnroll}
                  className="btn-gold-shimmer text-white font-semibold h-12 px-8 tracking-wide gap-2"
                >
                  <CalendarDays size={18} /> Garantir minha vaga
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-8 border-[var(--gold)]/60 text-[var(--rose-deep)] hover:bg-[var(--blush)] font-medium tracking-wide"
                >
                  <a href="#o-curso">Ver conteúdo</a>
                </Button>
              </div>
            </Reveal>

            <Reveal className="relative">
              <div className="relative mx-auto max-w-lg">
                <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border border-[var(--gold)]/40" aria-hidden="true" />
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-rose-200/60 border border-white/60 bg-white">
                  <Image
                    src={course?.image || "/images/curso/capa.webp"}
                    alt="Capa do Curso Pro Nails — Molde F1"
                    width={1024}
                    height={1024}
                    style={{ objectPosition: course?.imagePosition || "center" }}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <GoldDivider />

        {/* BEM-VINDA */}
        <section id="o-curso" className="scroll-mt-20 py-14 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <p className="font-script text-4xl text-[var(--rose-deep)]">Bem-vinda!</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--charcoal)] mt-2">
                Aqui começa a sua nova profissão
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--gold)] to-transparent mx-auto mt-4" />
            </Reveal>
            <Reveal>
              <div className="max-w-2xl mx-auto rounded-[1.75rem] overflow-hidden shadow-xl shadow-rose-100 border border-white/60">
                <Image
                  src="/images/curso/bemvinda.webp"
                  alt="Bem-vinda ao Curso Pro Nails"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <GoldDivider />

        {/* PARA VOCÊ */}
        <section id="para-voce" className="scroll-mt-20 py-14 lg:py-20 bg-white/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--rose-deep)]/80 mb-2">Para Você</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--charcoal)]">
                É para você que…
              </h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[var(--gold)] to-transparent mx-auto mt-4" />
            </Reveal>
            <Reveal>
              <div className="max-w-2xl mx-auto rounded-[1.75rem] overflow-hidden shadow-xl shadow-rose-100 border border-white/60">
                <Image
                  src="/images/curso/paravoce.webp"
                  alt="É para você que deseja liberdade financeira e reconhecimento profissional"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <GoldDivider />

        {/* QUOTE */}
        <section className="py-14 lg:py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-[1.75rem] overflow-hidden shadow-xl shadow-rose-100 border border-white/60">
                <Image
                  src="/images/curso/po.webp"
                  alt="Quanto mais pó fica na sua mesa, mais dinheiro você joga no lixo"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <GoldDivider />

        {/* INCLUSO */}
        <section id="incluso" className="scroll-mt-20 py-14 lg:py-20 bg-white/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--rose-deep)]/80 mb-2">Incluso</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--charcoal)]">
                O que está incluso?
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--gold)] to-transparent mx-auto mt-4" />
            </Reveal>
            <Reveal>
              <div className="max-w-2xl mx-auto rounded-[1.75rem] overflow-hidden shadow-xl shadow-rose-100 border border-white/60">
                <Image
                  src="/images/curso/incluso.webp"
                  alt="O que está incluso no curso"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-cover"
                />
              </div>
            </Reveal>
            {course?.note && (
              <Reveal>
                <div className="mt-8 max-w-2xl mx-auto flex items-start gap-3 rounded-2xl border border-[var(--gold)]/40 bg-[var(--cream)] p-4">
                  <Info size={18} className="text-[var(--rose-deep)] shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/70 leading-relaxed">{course.note}</p>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <GoldDivider />

        {/* INVESTIMENTO */}
        <section id="investimento" className="scroll-mt-20 py-14 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--rose-deep)]/80 mb-2">Investimento</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--gold)] to-transparent mx-auto mt-4" />
            </Reveal>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <Reveal>
                <div className="rounded-[1.75rem] overflow-hidden shadow-xl shadow-rose-100 border border-white/60">
                  <Image
                    src="/images/curso/investimento.webp"
                    alt="Investimento no Curso Pro Nails"
                    width={1024}
                    height={1024}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </Reveal>
              <Reveal>
                <div className="rounded-[1.75rem] border-2 border-[var(--gold)]/60 bg-white p-6 sm:p-8 shadow-xl shadow-rose-100/70">
                  <p className="font-script text-3xl text-[var(--rose-deep)] mb-2">Curso Vip</p>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-[var(--charcoal)]">
                    {course?.priceFull || "R$ 2.988"} <span className="text-foreground/60 text-lg font-medium">à vista</span>
                  </p>
                  <p className="mt-3 text-foreground/85">
                    <span className="font-semibold text-[var(--rose-deep)]">Ou</span> {course?.priceInstallments || "12x de R$ 249 no cartão"}
                  </p>
                  <Button
                    onClick={onEnroll}
                    className="mt-6 w-full btn-gold-shimmer text-white font-semibold h-12 tracking-wide gap-2"
                  >
                    <CalendarDays size={18} /> Garantir minha vaga
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <GoldDivider />

        {/* INSTAGRAM */}
        <section className="py-14 lg:py-20 bg-white/50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="rounded-[1.75rem] overflow-hidden shadow-xl shadow-rose-100 border border-white/60">
                <Image
                  src="/images/curso/instagram.webp"
                  alt="Instagram @jacootinhanails"
                  width={1024}
                  height={1024}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="mt-6 text-center">
                <a
                  href={BUSINESS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--gold)]/50 bg-white px-6 py-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="h-10 w-10 rounded-full bg-[var(--blush)] flex items-center justify-center">
                    <Instagram size={20} className="text-[var(--rose-deep)]" />
                  </span>
                  <span className="font-display text-xl font-bold text-[var(--charcoal)]">@jacootinhanails</span>
                  <ArrowRight size={18} className="text-[var(--gold)]" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 lg:py-20 bg-[var(--charcoal)] text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <Reveal>
              <p className="font-script text-4xl text-[var(--gold-light)] mb-3">Vagas limitadas</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">
                Garanta a sua vaga no Curso Pro Nails — Molde F1
              </h2>
              <p className="mt-4 text-white/70">
                Fale com a gente pelo WhatsApp e receba todas as informações sobre as próximas turmas.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={onEnroll}
                  className="btn-gold-shimmer text-white font-semibold h-12 px-8 tracking-wide gap-2"
                >
                  <MessageCircle size={18} /> Garantir minha vaga
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-8 border-white/60 bg-white/10 text-white hover:bg-white/20 backdrop-blur font-medium tracking-wide"
                >
                  <a href="/">Ver serviços de unhas</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <CourseFooter />
    </div>
  );
}

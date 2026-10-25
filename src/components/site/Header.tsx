"use client";

import { useState } from "react";
import { Menu, X, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStudioStore } from "@/lib/studio-store";
import Image from "next/image";

const LINKS = [
  { href: "/", label: "Unhas" },
  { href: "/?area=curso", label: "Curso" },
  { href: "#servicos", label: "Serviços" },
  { href: "#galeria", label: "Galeria" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#contato", label: "Contato" },
];

export function Header({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const { session, logout, adminView, setAdminView } = useStudioStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="glass-nav sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <a href="/" className="flex items-center gap-2 group">
            <Image src="/images/logo.png" alt="Jacootinha Nails" width={40} height={40} className="rounded-full group-hover:scale-105 transition-transform" />
            <span className="font-display text-xl md:text-2xl font-bold text-[var(--charcoal)]">
              Jacootinha <span className="font-script text-2xl md:text-3xl text-[var(--rose-deep)]">Nails</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-foreground/80 hover:text-[var(--rose-deep)] transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-[var(--gold)] after:to-[var(--rose-soft)] after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session?.role === "admin" && !adminView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminView(true)}
                className="hidden sm:inline-flex border-[var(--gold)]/60 text-[var(--rose-deep)] hover:bg-[var(--blush)] gap-1.5"
              >
                <LayoutDashboard size={16} /> Área Admin
              </Button>
            )}
            <Button
              onClick={onBook}
              size="sm"
              className="btn-gold-shimmer text-white font-semibold tracking-wide hidden sm:inline-flex"
            >
              Agendar Horário
            </Button>

            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]" aria-label="Menu da conta">
                    <Avatar className="h-9 w-9 border border-[var(--gold)]/50">
                      <AvatarFallback className="bg-[var(--blush)] text-[var(--rose-deep)] font-semibold text-sm">
                        {session.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{session.role === "visitor" ? "Visitante" : session.role === "admin" ? "Administradora" : "Cliente"}</p>
                    {session.role === "visitor" && (
                      <p className="text-xs text-muted-foreground mt-1">Faça login para agendar ou se inscrever no curso.</p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session.role === "visitor" && (
                    <DropdownMenuItem onClick={handleLogout} className="gap-2">
                      <LogIn size={14} className="text-[var(--gold)]" /> Entrar com uma conta
                    </DropdownMenuItem>
                  )}
                  {session.role === "admin" && (
                    <DropdownMenuItem onClick={() => setAdminView(!adminView)} className="gap-2">
                      <LayoutDashboard size={14} /> {adminView ? "Ver site" : "Área Administrativa"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                    <LogOut size={14} /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-[var(--gold)]/20 bg-white/95 backdrop-blur px-4 py-4 space-y-2 animate-fade-up" aria-label="Menu mobile">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium text-foreground/85 hover:bg-[var(--blush)]"
            >
              {l.label}
            </a>
          ))}
          {session?.role === "admin" && !adminView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAdminView(true); setOpen(false); }}
              className="w-full border-[var(--gold)]/60 text-[var(--rose-deep)] gap-1.5"
            >
              <LayoutDashboard size={16} /> Área Admin
            </Button>
          )}
          <Button
            onClick={() => { setOpen(false); onBook(); }}
            className="w-full btn-gold-shimmer text-white font-semibold"
          >
            Agendar Horário
          </Button>
        </nav>
      )}
    </header>
  );
}

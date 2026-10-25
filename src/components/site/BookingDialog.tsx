"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Check, ChevronLeft, ChevronRight, Clock, CalendarDays, User, MessageCircle } from "lucide-react";
import { useStudioStore } from "@/lib/studio-store";
import { TIME_SLOTS, formatBRL, WEEKDAY_LABELS, BUSINESS, buildWhatsAppBookingMessage, type Service } from "@/lib/studio-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

function toISODate(d: Date | undefined): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function BookingDialog({
  open,
  onOpenChange,
  preselectedServiceId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preselectedServiceId?: string | null;
}) {
  const services = useStudioStore((s) => s.services);
  const blocks = useStudioStore((s) => s.blocks);
  const workHours = useStudioStore((s) => s.workHours);
  const loadWorkHours = useStudioStore((s) => s.loadWorkHours);
  const loadBlocks = useStudioStore((s) => s.loadBlocks);
  const addBooking = useStudioStore((s) => s.addBooking);
  const session = useStudioStore((s) => s.session);

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [occupied, setOccupied] = useState<Set<string>>(new Set());
  const [availLoading, setAvailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset dialog state when it opens (adjusting state during render, React-sanctioned)
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(preselectedServiceId ? 2 : 1);
      setServiceId(preselectedServiceId ?? null);
      setTime(null);
      setNotes("");
      setName((n) => n || (session && session.role !== "visitor" ? session.name : ""));
      loadWorkHours().catch(() => {});
      loadBlocks().catch(() => {});
    }
  }

  const service: Service | undefined = services.find((s) => s.id === serviceId);

  const isoDate = toISODate(date);

  // Fetch occupied slots from API when date changes or dialog reopens
  useEffect(() => {
    if (!isoDate || !wasOpen) {
      setOccupied(new Set());
      return;
    }
    let cancelled = false;
    setAvailLoading(true);
    fetch(`/api/bookings/availability?date=${isoDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setOccupied(new Set<string>(data.occupied ?? []));
      })
      .catch(() => {
        if (!cancelled) setOccupied(new Set());
      })
      .finally(() => {
        if (!cancelled) setAvailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isoDate, wasOpen]);

  const isDayBlocked = (d: Date) => {
    const iso = toISODate(d);
    return blocks.some((b) => b.date === iso);
  };

  const isDayClosed = (d: Date) => {
    const wh = workHours[d.getDay()];
    return !wh?.open;
  };

  const availableSlots = TIME_SLOTS.filter((t) => {
    const wh = workHours[date?.getDay() ?? 1];
    if (!wh?.open) return false;
    const [h] = t.split(":").map(Number);
    const [fh] = wh.from.split(":").map(Number);
    const [th] = wh.to.split(":").map(Number);
    return h >= fh && h < th;
  });

  const handleConfirm = async () => {
    if (!serviceId || !date || !time) {
      toast({ title: "Dados incompletos", description: "Escolha o serviço, a data e o horário.", variant: "destructive" });
      return;
    }
    if (name.trim().length < 3) {
      toast({ title: "Nome inválido", description: "Informe seu nome completo (mínimo 3 caracteres).", variant: "destructive" });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      toast({ title: "Telefone inválido", description: "Informe um telefone válido com DDD, ex: (19) 99999-9999.", variant: "destructive" });
      return;
    }
    const iso = toISODate(date)!;
    setSubmitting(true);
    try {
      await addBooking({
        serviceId,
        date: iso,
        time,
        clientName: name.trim(),
        clientPhone: phone.trim(),
        status: "PENDENTE",
      });
      const message = buildWhatsAppBookingMessage({
        serviceName: service!.name,
        dateBR: iso.split("-").reverse().join("/"),
        weekday: WEEKDAY_LABELS[date.getDay()],
        time,
        name: name.trim(),
        phone: phone.trim(),
      });
      const fullMessage = notes.trim() ? `${message}\n\nObservações: ${notes.trim()}` : message;
      window.open(`${BUSINESS.whatsapp.url}?text=${encodeURIComponent(fullMessage)}`, "_blank", "noopener,noreferrer");
      toast({
        title: "Agendamento solicitado!",
        description: "Envie a mensagem no WhatsApp para confirmar.",
      });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Não foi possível agendar",
        description: e instanceof Error ? e.message : "Tente novamente.",
        variant: "destructive",
      });
      if (e instanceof Error && e.message.includes("ocupado")) {
        setStep(2);
        setTime(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ["Serviço", "Data & Hora", "Seus dados"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-white to-[var(--cream)] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[var(--charcoal)] flex items-center gap-2">
            <CalendarDays size={20} className="text-[var(--gold)]" /> Agendar Horário
          </DialogTitle>
          <DialogDescription>
            Passo {step} de 3 — {steps[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-2" aria-hidden>
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < step ? "bg-[var(--gold)]" : "bg-[var(--gold)]/20"
              )}
            />
          ))}
        </div>

        {/* STEP 1: Service */}
        {step === 1 && (
          <div className="space-y-2.5">
            {services.filter((s) => s.active).map((s) => (
              <button
                key={s.id}
                onClick={() => { setServiceId(s.id); setStep(2); }}
                className={cn(
                  "w-full min-h-14 text-left rounded-xl border p-3.5 transition-all hover:border-[var(--gold)] hover:shadow-md flex items-center justify-between gap-3 bg-white",
                  serviceId === s.id && "border-[var(--gold)] ring-1 ring-[var(--gold)]"
                )}
              >
                <div>
                  <p className="font-semibold text-[var(--charcoal)]">{s.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> {s.durationMin} min
                  </p>
                </div>
                <span className="font-display font-bold text-[var(--rose-deep)]">{formatBRL(s.price)}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: Date & time */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-center rounded-xl bg-white border border-[var(--gold)]/25 p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setTime(null); }}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || isDayBlocked(d) || isDayClosed(d)}
                locale={ptBR}
                className="text-[var(--charcoal)]"
                classNames={{
                  day_selected: "bg-[var(--rose-deep)] text-white hover:bg-[var(--rose-deep)] focus:bg-[var(--rose-deep)]",
                  day_today: "ring-1 ring-[var(--gold)]",
                }}
              />
            </div>

            {blocks.some((b) => b.date === toISODate(date)) && (
              <p className="text-sm text-center text-destructive">Esta data está bloqueada pelo studio.</p>
            )}

            {date && !isDayBlocked(date) && !isDayClosed(date) && (
              <div>
                <p className="text-sm font-medium text-[var(--charcoal)] mb-2 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-[var(--gold)]" />
                  Horários disponíveis ·{" "}
                  {WEEKDAY_LABELS[date.getDay()]}, {toISODate(date)!.split("-").reverse().join("/")}
                  {availLoading && <span className="text-xs text-muted-foreground ml-2">carregando…</span>}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableSlots.map((t) => {
                    const occ = occupied.has(t);
                    return (
                      <button
                        key={t}
                        disabled={occ || availLoading}
                        onClick={() => setTime(t)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-sm font-medium transition-all",
                          occ
                            ? "slot-occupied border-destructive/30 bg-destructive/5 text-destructive cursor-not-allowed relative"
                            : time === t
                              ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--rose-deep)] shadow-sm"
                              : "border-[var(--gold)]/30 hover:border-[var(--gold)] hover:bg-[var(--blush)] text-[var(--charcoal)]"
                        )}
                        title={occ ? "Ocupado" : "Disponível"}
                      >
                        {t}
                        {occ && (
                          <span className="absolute inset-x-0 -bottom-0.5 text-[8px] uppercase tracking-wide text-destructive">
                            Ocupado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                <ChevronLeft size={16} /> Voltar
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!date || !time}
                className="flex-1 btn-gold-shimmer text-white font-semibold gap-1.5"
              >
                Continuar <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-white border border-[var(--gold)]/25 p-4 text-sm space-y-1.5">
              <p className="flex justify-between gap-3"><span className="text-muted-foreground shrink-0">Serviço:</span><span className="font-medium text-right min-w-0">{service?.name}</span></p>
              <p className="flex justify-between gap-3"><span className="text-muted-foreground shrink-0">Data:</span><span className="font-medium text-right">{toISODate(date)?.split("-").reverse().join("/")}</span></p>
              <p className="flex justify-between gap-3"><span className="text-muted-foreground shrink-0">Hora:</span><span className="font-medium text-right">{time}</span></p>
              <p className="flex justify-between gap-3"><span className="text-muted-foreground shrink-0">Valor:</span><span className="font-display font-bold text-[var(--rose-deep)] text-right">{service ? formatBRL(service.price) : ""}</span></p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="bk-name" className="flex items-center gap-1.5">
                  <User size={14} className="text-[var(--gold)]" /> Nome
                </Label>
                <Input id="bk-name" className="h-11 text-base" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} autoCapitalize="words" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-phone">Telefone / WhatsApp</Label>
                <Input id="bk-phone" required inputMode="tel" autoComplete="tel" type="tel" className="h-11 text-base" placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-notes">Observações (opcional)</Label>
                <textarea
                  id="bk-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma preferência ou informação extra?"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MessageCircle size={13} className="text-[var(--gold)] shrink-0" />
              Ao confirmar, você será direcionada ao WhatsApp para enviar o pedido.
            </p>

            <div className="flex flex-col-reverse gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="h-11 flex-1 gap-1.5">
                  <ChevronLeft size={16} /> Voltar
                </Button>
                <Button onClick={handleConfirm} disabled={submitting} className="h-11 flex-[2] btn-gold-shimmer text-white font-semibold gap-2">
                  <Check size={17} /> {submitting ? "Enviando…" : "Confirmar"}
                </Button>
              </div>
            </div>
            <Badge variant="outline" className="w-full justify-center whitespace-normal border-[var(--gold)]/50 text-muted-foreground bg-transparent px-4 py-1.5 text-center leading-relaxed">
              Seu agendamento ficará como <strong className="mx-1">Pendente</strong> até confirmação do studio
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

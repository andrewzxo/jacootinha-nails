"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Scissors,
  GraduationCap,
  Images,
  CalendarCheck,
  Clock,
  Ban,
  Pencil,
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  CheckCircle2,
  XCircle,
  CheckCheck,
  CalendarX,
  CalendarDays,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudioStore } from "@/lib/studio-store";
import {
  WEEKDAY_LABELS,
  TIME_SLOTS,
  formatBRL,
  type Service,
  type Course,
  type Booking,
  type BookingStatus,
} from "@/lib/studio-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRef } from "react";

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Falha no upload.");
  return (data as { url: string }).url;
}

const IMAGE_POSITIONS: { value: string; label: string }[] = [
  { value: "left top", label: "Superior esquerdo" },
  { value: "center top", label: "Superior centralizado" },
  { value: "right top", label: "Superior direito" },
  { value: "left center", label: "Centralizado à esquerda" },
  { value: "center", label: "Centralizado" },
  { value: "right center", label: "Centralizado à direita" },
  { value: "left bottom", label: "Inferior esquerdo" },
  { value: "center bottom", label: "Inferior centralizado" },
  { value: "right bottom", label: "Inferior direito" },
];

function ImageField({
  value,
  position = "center",
  onPositionChange,
  onChange,
}: {
  value: string;
  position?: string;
  onPositionChange?: (p: string) => void;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      toast({ title: "Erro no upload", description: err instanceof Error ? err.message : "Tente novamente.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[var(--gold)]/30 bg-[var(--cream)]">
        {value ? (
          <img
            src={value}
            alt="Pré-visualização"
            className="h-full w-full object-cover"
            style={{ objectPosition: position || "center" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Sem imagem</span>
        )}
      </div>
      {value && onPositionChange && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--gold)]/25 bg-white p-2">
          <p className="text-[11px] font-medium text-muted-foreground shrink-0 leading-tight">
            Foco da imagem<br />(evita cortes)
          </p>
          <div className="grid grid-cols-3 gap-1" role="group" aria-label="Posição do foco da imagem">
            {IMAGE_POSITIONS.map((p) => {
              const active = (position || "center") === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-label={p.label}
                  title={p.label}
                  onClick={() => onPositionChange(p.value)}
                  className={cn(
                    "h-5 w-5 rounded-full border transition-all",
                    active
                      ? "border-[var(--rose-deep)] bg-[var(--rose-deep)]"
                      : "border-[var(--gold)]/50 bg-[var(--cream)] hover:bg-[var(--blush)]"
                  )}
                />
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Clique no ponto para escolher qual parte da imagem deve aparecer.
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <Button type="button" variant="outline" size="sm" disabled={uploading} className="gap-1.5" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> {uploading ? "Enviando…" : "Enviar imagem"}
        </Button>
        <p className="text-[11px] text-muted-foreground">PNG, JPG ou WEBP até 5MB.</p>
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ou cole uma URL de imagem" />
    </div>
  );
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  CONFIRMADO: "bg-emerald-100 text-emerald-800 border-emerald-300",
  PENDENTE: "bg-amber-100 text-amber-800 border-amber-300",
  CONCLUIDO: "bg-rose-100 text-rose-800 border-rose-300",
  CANCELADO: "bg-neutral-200 text-neutral-600 border-neutral-300",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  CONFIRMADO: "Confirmado",
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function ServiceFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Service | null;
}) {
  const { addService, updateService } = useStudioStore();
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [duration, setDuration] = useState(String(editing?.durationMin ?? 60));
  const [price, setPrice] = useState(String(editing?.price ?? ""));
  const [image, setImage] = useState(editing?.image ?? "/images/gallery1.png");
  const [imagePosition, setImagePosition] = useState(editing?.imagePosition ?? "center");
  const [saving, setSaving] = useState(false);
  const [key, setKey] = useState(0);

  // reset on open change
  if (open && key !== 1) {
    setName(editing?.name ?? "");
    setDescription(editing?.description ?? "");
    setDuration(String(editing?.durationMin ?? 60));
    setPrice(String(editing?.price ?? ""));
    setImage(editing?.image ?? "/images/gallery1.png");
    setImagePosition(editing?.imagePosition ?? "center");
    setKey(1);
  }
  if (!open && key !== 0) setKey(0);

  const save = async () => {
    if (!name.trim() || !price) {
      toast({ title: "Preencha nome e preço.", variant: "destructive" });
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim(),
      durationMin: Number(duration),
      price: Number(price),
      image,
      imagePosition,
      active: editing?.active ?? true,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateService(editing.id, data);
        toast({ title: "Serviço atualizado!" });
      } else {
        await addService(data);
        toast({ title: "Serviço criado!" });
      }
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e instanceof Error ? e.message : "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Manicure Clássica" />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duração (min)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto custom-scrollbar">
                  {[30, 45, 60, 75, 90, 120, 150, 180].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$)</Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="45" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Imagem</Label>
            <ImageField value={image} position={imagePosition} onPositionChange={setImagePosition} onChange={setImage} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving} className="btn-gold-shimmer text-white font-semibold">{saving ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CourseFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Course | null;
}) {
  const { addCourse, updateCourse } = useStudioStore();
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [duration, setDuration] = useState(editing?.duration ?? "");
  const [level, setLevel] = useState(editing?.level ?? "Iniciante");
  const [priceLabel, setPriceLabel] = useState(editing?.priceLabel ?? "Preço em breve");
  const [priceFull, setPriceFull] = useState(editing?.priceFull ?? "");
  const [priceInstallments, setPriceInstallments] = useState(editing?.priceInstallments ?? "");
  const [paymentNote, setPaymentNote] = useState(editing?.paymentNote ?? "");
  const [forWho, setForWho] = useState((editing?.forWho ?? []).join("\n"));
  const [image, setImage] = useState(editing?.image ?? "/images/curso/capa.png");
  const [imagePosition, setImagePosition] = useState(editing?.imagePosition ?? "center");
  const [learnTheory, setLearnTheory] = useState((editing?.learnTheory ?? []).join("\n"));
  const [learnPractice, setLearnPractice] = useState((editing?.learnPractice ?? []).join("\n"));
  const [included, setIncluded] = useState((editing?.included ?? []).join("\n"));
  const [note, setNote] = useState(editing?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [key, setKey] = useState(0);

  if (open && key !== 1) {
    setName(editing?.name ?? "");
    setDescription(editing?.description ?? "");
    setDuration(editing?.duration ?? "");
    setLevel(editing?.level ?? "Iniciante");
    setPriceLabel(editing?.priceLabel ?? "Preço em breve");
    setPriceFull(editing?.priceFull ?? "");
    setPriceInstallments(editing?.priceInstallments ?? "");
    setPaymentNote(editing?.paymentNote ?? "");
    setForWho((editing?.forWho ?? []).join("\n"));
    setImage(editing?.image ?? "/images/curso/capa.png");
    setImagePosition(editing?.imagePosition ?? "center");
    setLearnTheory((editing?.learnTheory ?? []).join("\n"));
    setLearnPractice((editing?.learnPractice ?? []).join("\n"));
    setIncluded((editing?.included ?? []).join("\n"));
    setNote(editing?.note ?? "");
    setKey(1);
  }
  if (!open && key !== 0) setKey(0);

  const splitLines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);

  const save = async () => {
    if (!name.trim()) {
      toast({ title: "Informe o nome do curso.", variant: "destructive" });
      return;
    }
    const data = {
      name: name.trim(),
      description: description.trim(),
      duration: duration.trim() || "Presencial",
      level: level.trim() || "Iniciante",
      benefits: editing?.benefits ?? splitLines(included),
      learnTheory: splitLines(learnTheory),
      learnPractice: splitLines(learnPractice),
      included: splitLines(included),
      note: note.trim(),
      priceLabel,
      priceFull: priceFull.trim(),
      priceInstallments: priceInstallments.trim(),
      paymentNote: paymentNote.trim(),
      forWho: splitLines(forWho),
      image,
      imagePosition,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(editing.id, data);
        toast({ title: "Curso atualizado!" });
      } else {
        await addCourse({ ...data, active: true });
        toast({ title: "Curso criado!" });
      }
      onOpenChange(false);
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e instanceof Error ? e.message : "Tente novamente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-display">{editing ? "Editar curso" : "Novo curso"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duração</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 3 dias · presencial" />
            </div>
            <div className="space-y-1.5">
              <Label>Nível</Label>
              <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Ex: Iniciante" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Preço à vista (Opção 1)</Label>
              <Input value={priceFull} onChange={(e) => setPriceFull(e.target.value)} placeholder="Ex: R$ 2.988" />
            </div>
            <div className="space-y-1.5">
              <Label>Parcelado (Opção 2)</Label>
              <Input value={priceInstallments} onChange={(e) => setPriceInstallments(e.target.value)} placeholder="Ex: 12x de R$ 249 no cartão" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observação de pagamento</Label>
            <textarea rows={2} value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Ex: Pix parcelado: o pagamento pode ser feito antes do curso..." className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Para quem é o curso (um perfil por linha)</Label>
            <textarea rows={3} value={forWho} onChange={(e) => setForWho(e.target.value)} placeholder={"Deseja ter liberdade financeira.\nDeseja ser vista como uma profissional expert..."} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Imagem</Label>
            <ImageField value={image} position={imagePosition} onPositionChange={setImagePosition} onChange={setImage} />
          </div>
          <div className="space-y-1.5">
            <Label>O que você vai aprender — Teoria (um item por linha)</Label>
            <textarea rows={4} value={learnTheory} onChange={(e) => setLearnTheory(e.target.value)} placeholder={"Histologia e anatomia\nParte química"} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>O que você vai aprender — Prática (um item por linha)</Label>
            <textarea rows={4} value={learnPractice} onChange={(e) => setLearnPractice(e.target.value)} placeholder={"Tempos de cabine\nPreparação de lâmina"} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Incluso no curso (um item por linha)</Label>
            <textarea rows={4} value={included} onChange={(e) => setIncluded(e.target.value)} placeholder={"Contrato\nApostila em PDF"} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </div>
          <div className="space-y-1.5">
            <Label>Observação importante</Label>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving} className="btn-gold-shimmer text-white font-semibold">{saving ? "Salvando…" : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminArea() {
  const {
    services, deleteService, updateService,
    courses, deleteCourse,
    bookings, loadBookings, updateBookingStatus, rescheduleBooking, deleteBooking,
    workHours, loadWorkHours, setWorkHours,
    blocks, loadBlocks, addBlock, removeBlock,
    gallery, loadGallery, addGalleryImage, removeGalleryImage,
    setAdminView,
  } = useStudioStore();

  const [svcDialog, setSvcDialog] = useState<{ open: boolean; editing: Service | null }>({ open: false, editing: null });
  const [crsDialog, setCrsDialog] = useState<{ open: boolean; editing: Course | null }>({ open: false, editing: null });
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [reschedule, setReschedule] = useState<{ booking: Booking | null; date: string; time: string }>({ booking: null, date: "", time: "" });
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [galUrl, setGalUrl] = useState("");
  const [galPos, setGalPos] = useState("center");
  const [galCaption, setGalCaption] = useState("");
  const [galBusy, setGalBusy] = useState(false);

  useEffect(() => {
    loadBookings().catch(() => toast({ title: "Erro ao carregar agendamentos", variant: "destructive" }));
    loadWorkHours().catch(() => {});
    loadBlocks().catch(() => {});
    loadGallery().catch(() => {});
  }, []);

  const handleAddGalleryImage = async () => {
    if (!galUrl.trim()) {
      toast({ title: "Envie uma imagem ou informe uma URL.", variant: "destructive" });
      return;
    }
    setGalBusy(true);
    try {
      await addGalleryImage({ url: galUrl.trim(), caption: galCaption.trim() || undefined, order: gallery.length + 1, imagePosition: galPos });
      setGalUrl("");
      setGalPos("center");
      setGalCaption("");
      toast({ title: "Imagem adicionada à galeria!" });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Tente novamente.", variant: "destructive" });
    } finally {
      setGalBusy(false);
    }
  };

  const run = async (id: string, fn: () => Promise<void>, okMsg: string) => {
    setBusyAction(id);
    try {
      await fn();
      toast({ title: okMsg });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "Tente novamente.", variant: "destructive" });
    } finally {
      setBusyAction(null);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-[var(--blush)]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--rose-deep)] to-[var(--gold)] flex items-center justify-center text-white shadow-md">
              <LayoutDashboard size={22} />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--charcoal)]">Área Administrativa</h1>
              <p className="text-sm text-muted-foreground">Gerencie o Jacootinha Nails</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setAdminView(false)} className="gap-1.5 border-[var(--gold)]/50 text-[var(--rose-deep)] hover:bg-white">
            <ArrowLeft size={16} /> Ver site
          </Button>
        </div>

        <Tabs defaultValue="agendamentos">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-white/80 border border-[var(--gold)]/20 p-1 mb-6">
            {[
              { v: "agendamentos", icon: CalendarCheck, label: "Agendamentos" },
              { v: "servicos", icon: Scissors, label: "Serviços" },
              { v: "cursos", icon: GraduationCap, label: "Cursos" },
              { v: "galeria", icon: Images, label: "Galeria" },
              { v: "horarios", icon: Clock, label: "Horários" },
              { v: "bloqueios", icon: Ban, label: "Bloqueios" },
            ].map(({ v, icon: Icon, label }) => (
              <TabsTrigger key={v} value={v} className="gap-1.5 data-[state=active]:bg-[var(--blush)] data-[state=active]:text-[var(--rose-deep)] px-3 py-2">
                <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ---- Agendamentos ---- */}
          <TabsContent value="agendamentos">
            <div className="rounded-2xl border border-[var(--gold)]/25 bg-white shadow-sm overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[var(--blush)] text-[var(--charcoal)]">
                    <tr>
                      <th className="text-left font-semibold px-4 py-3">Cliente</th>
                      <th className="text-left font-semibold px-4 py-3">Serviço</th>
                      <th className="text-left font-semibold px-4 py-3">Data / Hora</th>
                      <th className="text-left font-semibold px-4 py-3">Status</th>
                      <th className="text-left font-semibold px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((b) => (
                      <tr key={b.id} className="border-t border-[var(--gold)]/15 hover:bg-[var(--cream)]/60">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--charcoal)]">{b.clientName}</p>
                          <p className="text-xs text-muted-foreground">{b.clientPhone}</p>
                        </td>
                        <td className="px-4 py-3">{b.serviceName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {b.date.split("-").reverse().join("/")} · {b.time}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("border", STATUS_STYLE[b.status])}>
                            {STATUS_LABEL[b.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {b.status === "PENDENTE" && (
                              <Button size="sm" variant="outline" disabled={busyAction === b.id} className="h-8 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => run(b.id, () => updateBookingStatus(b.id, "CONFIRMADO"), "Agendamento confirmado!")}>
                                <CheckCircle2 size={14} /> Confirmar
                              </Button>
                            )}
                            {b.status !== "CONCLUIDO" && b.status !== "CANCELADO" && (
                              <>
                                <Button size="sm" variant="outline" disabled={busyAction === b.id} className="h-8 gap-1 border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => run(b.id, () => updateBookingStatus(b.id, "CONCLUIDO"), "Agendamento concluído!")}>
                                  <CheckCheck size={14} /> Concluir
                                </Button>
                                <Button size="sm" variant="outline" disabled={busyAction === b.id} className="h-8 gap-1 border-[var(--gold)]/60 text-[var(--rose-deep)] hover:bg-[var(--blush)]" onClick={() => setReschedule({ booking: b, date: b.date, time: b.time })}>
                                  <CalendarDays size={14} /> Remarcar
                                </Button>
                                <Button size="sm" variant="outline" disabled={busyAction === b.id} className="h-8 gap-1 border-neutral-300 text-neutral-600 hover:bg-neutral-50" onClick={() => run(b.id, () => deleteBooking(b.id), "Agendamento cancelado.")}>
                                  <XCircle size={14} /> Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sortedBookings.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nenhum agendamento ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ---- Serviços ---- */}
          <TabsContent value="servicos">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setSvcDialog({ open: true, editing: null })} className="btn-gold-shimmer text-white gap-1.5">
                <Plus size={16} /> Novo serviço
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
              {services.map((s) => (
                <div key={s.id} className="card-lift rounded-xl border border-[var(--gold)]/25 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[var(--charcoal)]">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.durationMin} min · {formatBRL(s.price)}</p>
                    </div>
                    <Switch checked={s.active} onCheckedChange={(v) => run(s.id, () => updateService(s.id, { active: v }), v ? "Serviço ativado" : "Serviço desativado")} aria-label={`Ativar ${s.name}`} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-8 gap-1 flex-1" onClick={() => setSvcDialog({ open: true, editing: s })}>
                      <Pencil size={13} /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => run(s.id, () => deleteService(s.id), "Serviço excluído")}>
                      <Trash2 size={13} /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ---- Cursos ---- */}
          <TabsContent value="cursos">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setCrsDialog({ open: true, editing: null })} className="btn-gold-shimmer text-white gap-1.5">
                <Plus size={16} /> Novo curso
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
              {courses.map((c) => (
                <div key={c.id} className="card-lift rounded-xl border border-[var(--gold)]/25 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[var(--charcoal)]">{c.name}</h3>
                    <Badge variant="outline" className="border-[var(--gold)]/60 text-[var(--rose-deep)] shrink-0">{c.priceLabel}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.duration}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-8 gap-1 flex-1" onClick={() => setCrsDialog({ open: true, editing: c })}>
                      <Pencil size={13} /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => run(c.id, () => deleteCourse(c.id), "Curso excluído")}>
                      <Trash2 size={13} /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ---- Galeria ---- */}
          <TabsContent value="galeria">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[var(--gold)]/25 bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-display text-lg font-bold text-[var(--charcoal)]">Adicionar imagem</h3>
                <div className="space-y-1.5">
                  <Label>Imagem</Label>
                  <ImageField value={galUrl} position={galPos} onPositionChange={setGalPos} onChange={setGalUrl} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gal-caption">Legenda (opcional)</Label>
                  <Input id="gal-caption" value={galCaption} onChange={(e) => setGalCaption(e.target.value)} placeholder="Ex: Alongamento em gel" />
                </div>
                <Button onClick={handleAddGalleryImage} disabled={galBusy} className="btn-gold-shimmer text-white gap-1.5">
                  <Plus size={16} /> {galBusy ? "Adicionando…" : "Adicionar à galeria"}
                </Button>
              </div>

              <div className="rounded-2xl border border-[var(--gold)]/25 bg-white p-5 shadow-sm">
                <h3 className="font-display text-lg font-bold text-[var(--charcoal)] mb-4">Imagens da galeria</h3>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {gallery.map((g) => (
                    <div key={g.id} className="relative rounded-xl overflow-hidden border border-[var(--gold)]/25 group aspect-square">
                        <img src={g.url} alt={g.caption || "Imagem da galeria"} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: (g.imagePosition as string) || "center" }} />
                      {g.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs line-clamp-1">{g.caption}</p>
                        </div>
                      )}
                      <button
                        aria-label="Remover imagem"
                        onClick={() => run(g.id, () => removeGalleryImage(g.id), "Imagem removida")}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 text-destructive flex items-center justify-center shadow hover:bg-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {gallery.length === 0 && (
                    <p className="col-span-2 text-sm text-muted-foreground py-6 text-center">Nenhuma imagem na galeria ainda.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ---- Horários ---- */}
          <TabsContent value="horarios">
            <div className="rounded-2xl border border-[var(--gold)]/25 bg-white p-5 shadow-sm space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {WEEKDAY_LABELS.map((label, i) => {
                const h = workHours[i];
                return (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-[var(--gold)]/10 last:border-0">
                    <span className="font-medium text-[var(--charcoal)] w-24">{label}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={h?.open ?? false}
                        onCheckedChange={(v) => run(`wh-${i}`, () => setWorkHours(i, { ...(h ?? { from: "09:00", to: "18:00" }), open: v }), v ? `${label} aberto` : `${label} fechado`)}
                        aria-label={`Abrir ${label}`}
                      />
                      <span className="text-sm text-muted-foreground">{h?.open ? "Aberto" : "Fechado"}</span>
                    </div>
                    {h?.open && (
                      <div className="flex items-center gap-2 sm:ml-auto">
                        <Select value={h.from} onValueChange={(v) => run(`wh-${i}`, () => setWorkHours(i, { ...h, from: v }), "Horário atualizado")}>
                          <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-56 overflow-y-auto custom-scrollbar">
                            {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">–</span>
                        <Select value={h.to} onValueChange={(v) => run(`wh-${i}`, () => setWorkHours(i, { ...h, to: v }), "Horário atualizado")}>
                          <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-56 overflow-y-auto custom-scrollbar">
                            {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ---- Bloqueios ---- */}
          <TabsContent value="bloqueios">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[var(--gold)]/25 bg-white p-5 shadow-sm space-y-4">
                <h3 className="font-display text-lg font-bold text-[var(--charcoal)]">Bloquear um dia inteiro</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="block-date">Data</Label>
                  <Input id="block-date" type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="block-reason">Motivo (opcional)</Label>
                  <Input id="block-reason" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Ex: Férias, compromisso..." />
                </div>
                <Button
                  className="btn-gold-shimmer text-white gap-1.5"
                  onClick={() => {
                    if (!blockDate) { toast({ title: "Selecione uma data.", variant: "destructive" }); return; }
                    run("block", async () => {
                      await addBlock({ date: blockDate, reason: blockReason.trim() || undefined });
                      setBlockDate(""); setBlockReason("");
                    }, `Dia ${blockDate.split("-").reverse().join("/")} bloqueado!`);
                  }}
                >
                  <CalendarX size={16} /> Bloquear dia
                </Button>
              </div>

              <div className="rounded-2xl border border-[var(--gold)]/25 bg-white p-5 shadow-sm">
                <h3 className="font-display text-lg font-bold text-[var(--charcoal)] mb-4">Dias bloqueados</h3>
                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {blocks.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3">
                      <div>
                        <p className="font-medium text-[var(--charcoal)]">{b.date.split("-").reverse().join("/")}</p>
                        {b.reason && <p className="text-xs text-muted-foreground">{b.reason}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 gap-1" onClick={() => run(b.id, () => removeBlock(b.id), "Bloqueio removido")}>
                        <Trash2 size={14} /> Remover
                      </Button>
                    </div>
                  ))}
                  {blocks.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Nenhum dia bloqueado.</p>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ServiceFormDialog open={svcDialog.open} editing={svcDialog.editing} onOpenChange={(v) => setSvcDialog({ open: v, editing: null })} />
      <CourseFormDialog open={crsDialog.open} editing={crsDialog.editing} onOpenChange={(v) => setCrsDialog({ open: v, editing: null })} />

      {/* Reschedule dialog */}
      <Dialog open={!!reschedule.booking} onOpenChange={(v) => !v && setReschedule({ booking: null, date: "", time: "" })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Remarcar agendamento</DialogTitle>
          </DialogHeader>
          {reschedule.booking && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {reschedule.booking.clientName} · {reschedule.booking.serviceName}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="rs-date">Nova data</Label>
                <Input id="rs-date" type="date" value={reschedule.date} onChange={(e) => setReschedule((r) => ({ ...r, date: e.target.value, time: "" }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nova hora</Label>
                <Select value={reschedule.time} onValueChange={(v) => setReschedule((r) => ({ ...r, time: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto custom-scrollbar">
                    {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReschedule({ booking: null, date: "", time: "" })}>Cancelar</Button>
            <Button
              disabled={!reschedule.date || !reschedule.time}
              className="btn-gold-shimmer text-white font-semibold"
              onClick={async () => {
                const { booking, date, time } = reschedule;
                if (!booking) return;
                await run(booking.id, () => rescheduleBooking(booking.id, date, time), "Agendamento remarcado!");
                setReschedule({ booking: null, date: "", time: "" });
              }}
            >
              Remarcar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

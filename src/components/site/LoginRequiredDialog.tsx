"use client";

import { LogIn, UserPlus, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LoginRequiredDialog({
  open,
  onOpenChange,
  action,
  onGoToLogin,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  action: "booking" | "course" | null;
  onGoToLogin: () => void;
}) {
  const isBooking = action === "booking";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-b from-white to-[var(--cream)]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[var(--charcoal)]">
            Faça login para continuar
          </DialogTitle>
          <DialogDescription className="text-muted-foreground leading-relaxed">
            {isBooking
              ? "Para solicitar um agendamento, é necessário ter uma conta. O modo visitante permite apenas navegar pelos serviços, galeria e cursos."
              : "Para se inscrever no curso, é necessário ter uma conta. O modo visitante permite apenas navegar pelos serviços, galeria e cursos."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={onGoToLogin}
            className="w-full btn-gold-shimmer text-white font-semibold tracking-wide gap-2"
          >
            <LogIn size={17} /> Entrar
          </Button>
          <Button
            onClick={onGoToLogin}
            variant="outline"
            className="w-full border-[var(--gold)]/60 text-[var(--rose-deep)] hover:bg-[var(--blush)] gap-2"
          >
            <UserPlus size={17} /> Criar conta
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full text-muted-foreground hover:bg-transparent gap-2"
          >
            <User size={15} /> Continuar como visitante
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

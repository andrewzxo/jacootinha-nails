"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudioStore } from "@/lib/studio-store";
import { BUSINESS } from "@/lib/studio-data";
import { toast } from "@/hooks/use-toast";

export function LoginGate() {
  const login = useStudioStore((s) => s.login);
  const register = useStudioStore((s) => s.register);
  const loginVisitor = useStudioStore((s) => s.loginVisitor);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [busy, setBusy] = useState(false);

  const showError = (e: unknown) => {
    toast({ title: "Ops!", description: e instanceof Error ? e.message : "Tente novamente.", variant: "destructive" });
  };

  const handleLogin = async () => {
    if (!email.includes("@") || password.length < 4) {
      toast({ title: "Credenciais inválidas", description: "Verifique seu e-mail e senha.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const s = await login(email.trim(), password);
      toast({
        title: `Bem-vinda de volta, ${s.name}!`,
        description: s.role === "admin" ? "Área administrativa desbloqueada." : "Você está logada como cliente.",
      });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !createEmail.includes("@") || createPassword.length < 4) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome, e-mail válido e senha (mín. 4 caracteres).",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      await register(name.trim(), createEmail.trim(), createPassword);
      toast({ title: `Conta criada!`, description: `Bem-vinda, ${name.trim()}!` });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  const handleVisitor = async () => {
    setBusy(true);
    try {
      await loginVisitor();
      toast({ title: "Bem-vinda, Visitante", description: "Explore o site. Faça login para agendar ou se inscrever no curso." });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-[var(--blush)] via-background to-[var(--cream)]">
      {/* Image side */}
      <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="Jacootinha Nails"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal)]/70 via-transparent to-[var(--rose-deep)]/20" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="font-script text-5xl mb-2 text-[var(--gold-light)]">Bem-vinda ao</p>
          <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight">
            Jacootinha Nails
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-[var(--gold)] to-transparent mt-4" />
          <p className="mt-4 text-white/85 max-w-md text-sm tracking-wide">
            {BUSINESS.tagline} Entre para agendar seu momento de beleza.
          </p>
        </div>
        <Image
          src="/images/logo.png"
          alt="Jacootinha Nails"
          width={56}
          height={56}
          className="absolute top-10 right-10 rounded-full shadow-lg animate-float-soft"
        />
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Image src="/images/logo.png" alt="Jacootinha Nails" width={48} height={48} className="rounded-full shadow" />
            <div className="text-left">
              <p className="font-script text-3xl text-[var(--rose-deep)] leading-none">Bem-vinda ao</p>
              <h1 className="font-display text-2xl font-bold text-[var(--charcoal)]">Jacootinha Nails</h1>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6 bg-[var(--blush)]">
              <TabsTrigger value="login" className="gap-2 data-[state=active]:bg-white">
                <LogIn size={16} /> Entrar
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2 data-[state=active]:bg-white">
                <UserPlus size={16} /> Criar conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="rounded-2xl border border-[var(--gold)]/30 bg-white/80 backdrop-blur p-6 shadow-xl shadow-rose-100/50 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="voce@email.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-pw">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="login-pw"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPw((v) => !v)}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={busy}
                  className="w-full btn-gold-shimmer text-white font-semibold tracking-wide"
                >
                  {busy ? "Entrando…" : "Entrar"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Administradora? Use <span className="font-medium text-[var(--rose-deep)]">admin@jacootinha.com</span>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="create">
              <div className="rounded-2xl border border-[var(--gold)]/30 bg-white/80 backdrop-blur p-6 shadow-xl shadow-rose-100/50 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="create-name">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input id="create-name" placeholder="Seu nome" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input id="create-email" type="email" placeholder="voce@email.com" className="pl-9" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-pw">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      id="create-pw"
                      type="password"
                      placeholder="Mínimo 4 caracteres"
                      className="pl-9"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={busy} className="w-full btn-gold-shimmer text-white font-semibold tracking-wide">
                  {busy ? "Criando…" : "Criar minha conta"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
          </div>

          <Button
            variant="outline"
            onClick={handleVisitor}
            disabled={busy}
            className="w-full h-12 border-[var(--gold)]/60 text-[var(--rose-deep)] hover:bg-[var(--blush)] hover:border-[var(--gold)] font-medium tracking-wide gap-2"
          >
            <LogIn size={18} className="text-[var(--gold)]" />
            Entrar como Visitante
          </Button>
        </div>
      </div>
    </div>
  );
}
